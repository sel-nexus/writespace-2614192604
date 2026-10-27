import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Home from './pages/Home.jsx';
import ReadBlog from './pages/ReadBlog.jsx';
import WriteBlog from './pages/WriteBlog.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UserManagement from './pages/UserManagement.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

/** Render the application route tree. */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/blogs" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/blog/:id" element={<ProtectedRoute><ReadBlog /></ProtectedRoute>} />
        <Route path="/write" element={<ProtectedRoute><WriteBlog /></ProtectedRoute>} />
        <Route path="/edit/:id" element={<ProtectedRoute><WriteBlog /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />
        <Route path="*" element={<main className="min-h-screen bg-slate-50 p-8"><h1>Page not found</h1></main>} />
      </Routes>
    </BrowserRouter>
  );
}
