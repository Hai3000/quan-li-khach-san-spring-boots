import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import RoomMapPage from './pages/RoomMapPage';
import AdminRoomPage from './pages/admin/AdminRoomPage';
import AdminStaffPage from './pages/admin/AdminStaffPage';
import AdminInvoicePage from './pages/admin/AdminInvoicePage';
import SetupWizardPage from './pages/SetupWizardPage';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import NewBookingModal from './components/NewBookingModal';
import styles from './App.module.css';

// Private Route Guard
const PrivateRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);

  if (loading) return (
    <div className={styles.appBootLoader}>
      <div className="spinner lg"></div>
    </div>
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/rooms' : '/receptionist/rooms'} replace />;
  }

  return (
    <div className={styles.appLayout}>
      <Sidebar onOpenNewBooking={() => setIsNewBookingOpen(true)} />
      <div className={styles.contentWrapper}>
        <TopNav />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>

      {isNewBookingOpen && (
        <NewBookingModal
          onClose={() => setIsNewBookingOpen(false)}
          onSuccess={() => {
            setIsNewBookingOpen(false);
            window.location.reload(); // Simple reload to refresh data
          }}
        />
      )}
    </div>
  );
};

function AppRoutes({ initialized }) {
  const { user } = useAuth();

  // Nếu hệ thống chưa khởi tạo, tất cả route dẫn về Setup Wizard
  if (!initialized) {
    return (
      <Routes>
        <Route path="/setup" element={<SetupWizardPage onSetupComplete={() => window.location.replace('/login')} />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin/rooms' : '/receptionist/rooms'} /> : <LoginPage />} />
      <Route path="/setup" element={<Navigate to="/login" replace />} />

      {/* Routes cho Lễ tân */}
      <Route path="/receptionist/*" element={
        <PrivateRoute allowedRole="RECEPTIONIST">
          <Routes>
            <Route path="rooms" element={<RoomMapPage />} />
            <Route path="*" element={<Navigate to="rooms" />} />
          </Routes>
        </PrivateRoute>
      } />

      {/* Routes cho Admin */}
      <Route path="/admin/*" element={
        <PrivateRoute allowedRole="ADMIN">
          <Routes>
            <Route path="rooms" element={<AdminRoomPage />} />
            <Route path="staff" element={<AdminStaffPage />} />
            <Route path="invoices" element={<AdminInvoicePage />} />
            <Route path="*" element={<Navigate to="rooms" />} />
          </Routes>
        </PrivateRoute>
      } />

      {/* Default Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  const [initialized, setInitialized] = useState(null); // null = đang kiểm tra

  useEffect(() => {
    fetch('http://localhost:8080/api/system/status')
      .then(res => res.json())
      .then(data => setInitialized(data.initialized))
      .catch(() => setInitialized(true)); // Nếu lỗi kết nối, không block user
  }, []);

  if (initialized === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <div className="spinner lg"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes initialized={initialized} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
