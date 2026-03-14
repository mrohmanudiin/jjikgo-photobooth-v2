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

function App() {
  return (
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
  );
}

export default App;
