import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
})

export const setToken = (token) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete api.defaults.headers.common['Authorization']
}
