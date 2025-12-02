const isDevelopment = import.meta.env.MODE === 'development';


const API_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : (import.meta.env.VITE_BACKEND_URL || 'https://pinch-nk6z.onrender.com');

export default API_URL;