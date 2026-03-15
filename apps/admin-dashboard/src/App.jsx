import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { LiveBooth } from './pages/LiveBooth';
import { QueueMonitor } from './pages/QueueMonitor';
import { TransactionHistory } from './pages/TransactionHistory';
import { FinanceDashboard } from './pages/FinanceDashboard';
import { DailyCash } from './pages/DailyCash';
import { PhotoSessions } from './pages/PhotoSessions';
import { PrintRequests } from './pages/PrintRequests';
import { ThemeManagement } from './pages/ThemeManagement';
import { BoothManagement } from './pages/BoothManagement';
import { UserManagement } from './pages/UserManagement';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Branches } from './pages/Branches';
import { Login } from './pages/Login';
import { BranchProvider } from './contexts/BranchContext';
import axios from 'axios';
import { useState, useEffect } from 'react';

// Setup global axios defaults
axios.defaults.withCredentials = true;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('jjikgo-admin-store');
  });

  useEffect(() => {
    // Intercept requests to inject the token
    const requestInterceptor = axios.interceptors.request.use((config) => {
      try {
        const storeStr = localStorage.getItem('jjikgo-admin-store');
        if (storeStr) {
          const { user } = JSON.parse(storeStr);
          if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
          }
        }
      } catch (e) { }
      return config;
    });

    // Intercept responses to handle 401
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('jjikgo-admin-store');
          setIsAuthenticated(false);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <BranchProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="branches" element={<Branches />} />
            <Route path="booths" element={<LiveBooth />} />
            <Route path="queue" element={<QueueMonitor />} />
            <Route path="transactions" element={<TransactionHistory />} />
            <Route path="finance" element={<FinanceDashboard />} />
            <Route path="daily-cash" element={<DailyCash />} />
            <Route path="sessions" element={<PhotoSessions />} />
            <Route path="prints" element={<PrintRequests />} />
            <Route path="themes" element={<ThemeManagement />} />
            <Route path="booths-manage" element={<BoothManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </BranchProvider>
  );
}

export default App;
