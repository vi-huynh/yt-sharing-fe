import React, { useCallback, useEffect, useState, Suspense } from 'react'
import './App.less'
import { FloatButton, Form, Input, Layout, Modal, notification } from 'antd'
import { Content } from 'antd/es/layout/layout'
import Header from './components/Header'
import axios from "./services/axios"
import { ILink } from "./type"
import TimeLineSkeleton from './components/TimeLinePlaceHolder'
import { useLocalStorage } from 'usehooks-ts'
import { PoweroffOutlined, ShareAltOutlined, HomeOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { createConsumer } from "@rails/actioncable"
import { AUTH_API, LINK_API } from './services/api'

const TimeLine = React.lazy(() => import("./components/TimeLine"))
const REGEX = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)??v(?:i)?=|&v(?:i)?=))([^#&?]*).*/

const YT_API  = process.env.REACT_APP_YT_CRAWL_API
const API_KEY = process.env.REACT_APP_YT_API_KEY
const WS_URL  = process.env.REACT_APP_WS_URL || ""

type FieldType = {
  url?: string
}

const cable = createConsumer(WS_URL)

function App() {
  const [form] = Form.useForm()

  const [userId, setUserId] = useLocalStorage('user_id', null)
  const [links, setLinks] = useState<ILink[]>([])
  const [notifications, setNotifications] = useState<number>(0)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const [, contextHolder] = notification.useNotification()

  useEffect(() => {
    if (userId) {
      (async () => {
        const response = await axios.get(LINK_API)
        const data = response.data.data
        if (data) setLinks(data)
      })()
    }
  }, [userId])

  useEffect(() => {
    if (userId && cable) {
      const isSubscribed = (cable?.subscriptions as any).subscriptions?.map((x: any) => JSON.parse(x.identifier)?.channel)?.includes('NotifierChannel')
      if (isSubscribed) return

      cable.subscriptions.create(
        { channel: `NotifierChannel` },
        {
          connected: () => console.log(`Connected! ${userId}`),
          disconnected: () =>{
            console.log("Disconnected!")
            cable.connect()
          },
          received: (data: ILink) => {
            if (data && data.sharer_id !== Number.parseInt(userId)) {
              notification.info({ message: "New movies have just been shared!"})
              setLinks((currentLinks) => [...currentLinks, data])
              setNotifications((currentNotification) => currentNotification + 1)
            }
          }
        }
      )
    }
  }, [userId])

  const onSubmit = () => {
    form.submit()
    setIsModalOpen(false)
  }

  const onCancel = () => {
    form.resetFields()
    setIsModalOpen(false)
  }

  const handleLogOut = async () => {
    await axios.delete(AUTH_API)
    setUserId(null)
  }

  const handleOpenDialog = () => setIsModalOpen(true)

  const handleSubmitUrl = async (values: FieldType) => {
    const video_id = values.url?.match(REGEX)
    if (!video_id || !video_id[1]) {
      notification.error({ message: "Invalid URL, please check again!"})
      return
    }
    if (!YT_API || !API_KEY) {
      notification.error({ message: "Invalid API KEY, please check again!"})
      return
    }

    const response = await fetch(YT_API.replace("video_id", video_id[1]).replace("api_key", API_KEY))
    const data = await response.json()
    const info = data.items[0]

    if (!info) return

    const requestData = {
      url: values.url,
      title: info.snippet.title,
      description: info.snippet.description?.replaceAll("\n", "<br/>"),
      video_id: info.id,
    }

    const storeResponse = await axios.post("/v1/links", requestData)

    if (storeResponse.status === 200) {
      form.resetFields()
      notification.success({ message: "Shared Movie Successfully!"})
      setLinks([...links, storeResponse.data])
    } else {
      notification.error({ message: storeResponse.data.message})
    }
  }

  const handleReadAll = useCallback(() => setNotifications(0), [])

  return (
    <Layout className="site-layout">
      {contextHolder}
      <Header />
      {userId &&
        <FloatButton.Group
          trigger="hover"
          badge={{ dot: notifications > 0 }}
          icon={<HomeOutlined />}
          type="primary"
        >
          <FloatButton onClick={handleReadAll} badge={{ count: notifications }} tooltip={notifications > 0 ? `${notifications} new movies has just been shared` : null} icon={<InfoCircleOutlined />} />
          <FloatButton onClick={handleOpenDialog} tooltip={<div>Share A Movie</div>} icon={<ShareAltOutlined />} />
          <FloatButton onClick={handleLogOut} tooltip={<div>Logout</div>} icon={<PoweroffOutlined />} />
        </FloatButton.Group>
      }
      <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
        <Suspense fallback={<TimeLineSkeleton />}>
          {userId && <TimeLine links={links}/> }
        </Suspense>
        <Modal
          title="Share A Movie"
          open={isModalOpen}
          onOk={onSubmit}
          onCancel={onCancel}
          okText="Share"
          cancelText="Cancel"
        >
          <Form form={form} onFinish={handleSubmitUrl}>
            <Form.Item<FieldType>
              label="URL"
              name="url"
              rules={[{ required: true, message: 'Please input movie url!' }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  )
}

export default App
