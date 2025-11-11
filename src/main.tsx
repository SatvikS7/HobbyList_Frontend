import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import {ProfileProvider} from './contexts/ProfileContext.tsx';
import { PhotoProvider } from './contexts/PhotoContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ProfileProvider>
        <PhotoProvider>
          <App />
        </PhotoProvider>
      </ProfileProvider>
    </BrowserRouter>
  </StrictMode>,
)
