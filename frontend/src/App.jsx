import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Layout from './pages/Layout';
import Login from './pages/Login';
import Preview from './pages/Preview';
import ResumeBuilder from './pages/ResumeBuilder';
import Profile from './pages/Profile';
import Account from './pages/Account';

import Templates from './pages/Templates';
import CareerLab from './pages/CareerLab';
import CoverLetter from './pages/CoverLetter';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} errorElement={<ErrorBoundary />} />
        <Route path="/login" element={<Login />} errorElement={<ErrorBoundary />} />
        <Route path="/about-us" element={<AboutUs />} errorElement={<ErrorBoundary />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} errorElement={<ErrorBoundary />} />

        {/* Protected Routes */}
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route key="profile" path="profile" element={<Profile />} />
          <Route key="account" path="account" element={<Account />} />
          <Route path="builder/:resumeId" element={<ResumeBuilder />} />
          <Route path="templates" element={<Templates />} />
          <Route path="career-lab" element={<CareerLab />} />
          <Route path="cover-letter" element={<CoverLetter />} />
        </Route>
        {/* The /view/:resumeId route was present in the original code but not in the provided snippet for modification.
              Assuming it should be kept and also have an errorElement. */}
        <Route path="/view/:resumeId" element={<Preview />} errorElement={<ErrorBoundary />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
