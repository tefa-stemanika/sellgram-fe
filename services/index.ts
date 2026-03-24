import axios from 'axios'

export const API_URL = process.env.NEXT_PUBLIC_API_URL
const version = 'api/'

export const API = axios.create({
  baseURL: `${API_URL}/${version}`,
  headers: {
    'Content-Type': 'application/json'
  }
})
