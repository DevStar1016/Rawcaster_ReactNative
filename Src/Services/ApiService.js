import axios from 'axios';
import {BASE_URL} from './ServiceConstants';

axios.defaults.baseURL = BASE_URL;

axios.interceptors.response.use(
  async response => {
    if (response.data.status === -1) {
      // clear token
    }
    return response;
  },
  error => Promise.reject(error),
);

axios.interceptors.request.use(
  async request => {
    request.headers['Content-Type'] = 'multipart/form-data';
    return request;
  },
  error => Promise.reject(error),
);

export const loginService = formData => {
  return axios.post('login', formData);
};

export const signupService = formData => {
  return axios.post('signup', formData);
};
