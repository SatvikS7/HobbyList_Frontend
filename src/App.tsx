import { Routes, Route, Link } from 'react-router-dom';
import './App.css'
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import VerificationPage from './pages/VerificationPage';
import PasswordResetForm from './pages/PasswordResetForm';
import PasswordReset from './pages/PasswordReset';
import HomePage from './pages/HomePage';
import UploadPhoto from './pages/UploadPhoto';
import { AuthProvider } from './components/AuthContext';
import Header from './components/Header';
import ProfilePage from './pages/ProfilePage';
import Onboarding from './pages/OnboardingPage';

function App() {
  return (
    <AuthProvider>
      <div className='body'>
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/reset-password" element={<PasswordResetForm />} />
          <Route path="/home-page" element={<HomePage />} />
          <Route path="/upload-photo" element={<UploadPhoto />} />
          <Route path="/reset-password" element={<PasswordResetForm />} />
          <Route path="/profile-page" element={<ProfilePage />} />
          <Route path="/onboarding-page" element={<Onboarding />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
