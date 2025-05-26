import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Removed Link, not used here
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import CVEditorPage from './pages/CVEditorPage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboardPage from './pages/UserDashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // Import ForgotPasswordPage
import ResetPasswordPage from './pages/ResetPasswordPage';   // Import ResetPasswordPage
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/common/Header';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Header /> 
        <div className="pt-16"> {/* Adjust padding if header height changes */}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* Added route */}
            <Route path="/reset-password" element={<ResetPasswordPage />} />   {/* Added route */}
            {/* Add other public routes like /about, /contact here */}

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<UserDashboardPage />} />
              <Route path="/cv-editor" element={<CVEditorPage />} />
              {/* Example for a route with parameters: */}
              {/* <Route path="/cv-editor/:cvId" element={<CVEditorPage />} /> */}
              {/* Add other protected routes here */}
            </Route>

            {/* Catch-all for 404 Not Found (optional) */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
