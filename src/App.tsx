import { Routes, Route, Link } from 'react-router-dom';
import './App.css'
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import VerificationPage from './pages/VerificationPage';

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
      </Routes>
    </div>
  )
}

export default App
