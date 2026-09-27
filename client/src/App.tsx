import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SeatProvider } from './context/SeatContext';
import API_BASE_URL from './config/api';

// Components
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import ZoneGrid from './components/ZoneGrid';
import QRScanner from './components/QRScanner';
import CurrentSession from './components/CurrentSession';
import GDRooms from './components/GDRooms';
import GDRoomDetail from './components/GDRoomDetail';
import AdminConsole from './components/AdminConsole';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { authState } = useAuth();
  
  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (!authState.isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  // If admin-only route and user is not admin, redirect to dashboard
  if (adminOnly && authState.user?.role !== 'admin') {
    return <Redirect to="/dashboard" />;
  }
  
  return <>{children}</>;
};

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(API_BASE_URL, {
      transports: ['websocket'],
      upgrade: false,
    });
    
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
        newSocket.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AuthProvider>
        <SeatProvider socket={socket}>
          <Router>
            <div className="relative">
              {/* Animated background blobs */}
              <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float animation-delay-4000"></div>
              </div>

              {/* Main content */}
              <div className="relative z-10">
                <Switch>
                  <Route path="/login" component={Login} />
                  <Route path="/register" component={Register} />
                  <Route path="/zone/:zoneName" component={ZoneGrid} />
                  <Route path="/scanner" component={QRScanner} />
                  <Route path="/session" component={CurrentSession} />
                  <Route path="/gd-rooms" component={GDRooms} />
                  <Route path="/gd-room/:roomId" component={GDRoomDetail} />
                  <Route path="/dashboard" render={() => (
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  )} />
                  <Route path="/admin-dashboard" render={() => (
                    <ProtectedRoute adminOnly={true}>
                      <AdminConsole />
                    </ProtectedRoute>
                  )} />
                  <Route path="/admin" render={() => <Redirect to="/admin-dashboard" />} />
                  <Route path="/" render={() => <Redirect to="/dashboard" />} />
                </Switch>
              </div>
            </div>
          </Router>
        </SeatProvider>
      </AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl',
          duration: 4000,
        }}
      />
    </div>
  );
}

export default App;
