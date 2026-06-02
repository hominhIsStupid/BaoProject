import React from 'react';
import ReactDOM from 'react-dom/client';
import './client/style/index.css';
import App from './client/App/App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
   <React.StrictMode>
      <App />
   </React.StrictMode>
);
