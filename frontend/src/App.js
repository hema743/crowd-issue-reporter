import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import FeedPage from './pages/FeedPage';
import ReportPage from './pages/ReportPage';
import DetailPage from './pages/DetailPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"           element={<FeedPage />} />
          <Route path="/report"     element={<ReportPage />} />
          <Route path="/issues/:id" element={<DetailPage />} />
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/login"      element={<LoginPage />} />
          <Route path="/register"   element={<RegisterPage />} />
          <Route path="/profile"    element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;