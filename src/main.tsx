import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import {ProfileProvider} from './contexts/ProfileContext.tsx';
import { PhotoMilestoneProvider } from './contexts/PhotoMilestoneContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ProfileProvider>
        <PhotoMilestoneProvider>
          <App />
        </PhotoMilestoneProvider>
      </ProfileProvider>
    </BrowserRouter>
  </StrictMode>,
)
