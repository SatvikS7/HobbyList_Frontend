import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import {ProfileProvider} from './contexts/ProfileContext.tsx';
import { PhotoProvider } from './contexts/PhotoContext.tsx';
import { MilestoneProvider } from './contexts/milestoneContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ProfileProvider>
        <MilestoneProvider>
          <PhotoProvider>
            <App />
          </PhotoProvider>
        </MilestoneProvider>
      </ProfileProvider>
    </BrowserRouter>
  </StrictMode>,
)
