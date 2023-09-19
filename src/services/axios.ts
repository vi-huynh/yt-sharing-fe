import axios from "axios"
import { AUTH_API } from "./api"

const instance = axios.create({
  baseURL: process.env.REACT_APP_YT_SHARING_API,
  withCredentials: true,
})

const refreshInstance = axios.create({
  baseURL: process.env.REACT_APP_YT_SHARING_API,
  withCredentials: true,
})

instance.interceptors.response.use(
  (res) => {
    return res
  },
  async (err) => {
    const originalConfig = err.config
    if (err.response) {
      if (err.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true
        try {
          await refreshInstance.put(AUTH_API)
          const response = await refreshInstance.get(AUTH_API)

          localStorage.setItem("user_id", response.data.data.id)
          return instance(originalConfig)
        } catch (_error) {
          localStorage.removeItem("user_id")
          localStorage.setItem("session_expired", "1")
          return window.location.href = '/'
        }
      }
    }

    return Promise.reject(err)
  },
)

export default instance
