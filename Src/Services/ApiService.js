import axios from 'axios';
import {BASE_URL} from './ServiceConstants';

axios.defaults.baseURL = BASE_URL;

export const loginService = formData => {
  return axios.post('login', formData);
};

export const signupService = formData => {
  return axios.post('signup', formData);
};
