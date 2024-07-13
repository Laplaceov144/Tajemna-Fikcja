import App from './App'; 
import React from 'react';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('app');
console.log(container);               //////////////
const root = createRoot(container); 
root.render(<App tab="home"/>);



