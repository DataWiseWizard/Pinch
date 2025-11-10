import axios from 'axios';
import API_URL from '../apiConfig';

export const api = axios.create({
  baseURL: API_URL
});