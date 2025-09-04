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

function App() {
  return (
    <div className='body'>
      <div className="header">
        <Link to="/" style={{ textDecoration: "none" }}>
          <h1>HobbyList</h1>
        </Link>
      </div>
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
      </Routes>
    </div>
  )
}

export default App
