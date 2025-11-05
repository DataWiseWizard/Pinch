import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext.jsx'
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
import './index.css'
import App from './App.jsx'


// const darkTheme = createTheme({
//   palette: {
//     mode: 'dark',
//     primary: {
//       main: '#90caf9', 
//     },
//     secondary: {
//       main: '#f48fb1', 
//     },
//     background: {
//       default: '#121212', 
//       paper: '#121212',   
//     },
//   },
//   typography: {
//     fontFamily: 'YourFont, Arial, sans-serif',
//   },
// });


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
