// src/api/client.ts
import axios from 'axios';
import { handleApiError } from '../utils/socketErrorHandler';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

export default api;
