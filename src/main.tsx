import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Main.tsx loaded');
createRoot(document.getElementById("root")!).render(<App />);
console.log('App mounted');
