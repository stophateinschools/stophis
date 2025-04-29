import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  // withCredentials: true, // optional, if using cookies/auth
});

export default api;