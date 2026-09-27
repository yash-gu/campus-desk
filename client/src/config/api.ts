// API Configuration for Campus Desk
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.onrender.com'  // Update this with your deployed backend URL
  : 'http://localhost:5001';

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  USERS: `${API_BASE_URL}/api/users`,
  SEATS: `${API_BASE_URL}/api/seats`,
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  TEST: `${API_BASE_URL}/api/test`,
  HEALTH: `${API_BASE_URL}/api/health`
};

export default API_BASE_URL;
