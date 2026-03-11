import axios from 'axios';
import { Incident, ApiResponse } from '../types';

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const submitIncident = async (data: Incident): Promise<ApiResponse<Incident>> => {
  try {
    const response = await api.post<Incident>('/posts', data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erreur lors de l\'envoi du signalement',
    };
  }
};

export default api;