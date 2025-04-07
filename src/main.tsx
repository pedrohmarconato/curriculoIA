import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { ResumeProvider } from './context/ResumeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ResumeProvider>
        <App />
      </ResumeProvider>
    </ThemeProvider>
  </StrictMode>
);