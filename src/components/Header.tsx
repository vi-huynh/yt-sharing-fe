import React, { useEffect, useState } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input, notification } from 'antd'
import axios from '../services/axios'
import { useLocalStorage } from 'usehooks-ts'
import { AUTH_API } from '../services/api'

const Header: React.FC = () => {
  const [form] = Form.useForm()
  const [clientReady, setClientReady] = useState<boolean>(false)
  const [userId, setUserId] = useLocalStorage('user_id', null)

  useEffect(() => {
    if (localStorage.getItem("session_expired")) {
      notification.warning({ message: "Session expired, please login again!"})
      localStorage.removeItem("session_expired")
    }

    setClientReady(true)
  }, [])

  const onFinish = async (values: { email: string, password: string}) => {
    await axios.post(AUTH_API, values)
    const response = await axios.get(AUTH_API)

    if (response.status === 200) {
      setUserId(response.data.data.id)
    }
  }

  return (
    <>
      {!userId &&
        <Form form={form} name="horizontal_login" layout="inline" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item shouldUpdate>
            {() => (
              <Button
                type="primary"
                htmlType="submit"
                disabled={
                  !clientReady ||
                  !!form.getFieldsError().filter(({ errors }) => errors.length).length
                }
              >
                Log in
              </Button>
            )}
          </Form.Item>
        </Form>
      }
    </>
  )
}

export default Header
