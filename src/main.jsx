import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Data from './data/data.js'

// Suppress browser console warnings for closing/closed WebSockets (e.g. from Pusher cleanup)
if (typeof window !== 'undefined' && window.WebSocket) {
  const originalSend = window.WebSocket.prototype.send;
  window.WebSocket.prototype.send = function (data) {
    if (this.readyState === 1) { // OPEN
      try {
        originalSend.call(this, data);
      } catch (e) {}
    }
  };

  const originalClose = window.WebSocket.prototype.close;
  window.WebSocket.prototype.close = function (code, reason) {
    if (this.readyState === 0 || this.readyState === 1) { // CONNECTING or OPEN
      try {
        originalClose.call(this, code, reason);
      } catch (e) {}
    }
  };
}

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
