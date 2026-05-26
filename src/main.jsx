import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Data from './data/data.js'

// Inject test credentials from Data object
if (Data.testCredentials) {
  Object.entries(Data.testCredentials).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
}

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  //   <App />
  // </StrictMode>,
  <App />
)
