import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

interface GDBookingRequest {
  id: string;
  roomId: string;
  roomName: string;
  slot: string;
  studentId: string;
  studentName: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  requestTime: string;
  purpose?: string;
  attendees?: string;
  specialRequirements?: string;
  adminComment?: string;
}

const AdminConsole: React.FC = () => {
  const history = useHistory();
  const { authState } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(false);
  
  // Initialize mock data from localStorage or use defaults
  const getInitialData = (): GDBookingRequest[] => {
    try {
      const savedData = localStorage.getItem('gdBookingRequests');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        console.log('Loaded saved booking requests from localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Error loading saved booking requests:', error);
    }
    
    // Default data
    const defaultData = [
      {
        id: '1',
        roomId: 'M-GD-01',
        roomName: 'M-GD-01',
        slot: '9-11',
        studentId: 'ST001',
        studentName: 'John Student',
        timestamp: '2026-03-18T10:30:00Z',
        status: 'pending' as const,
        requestTime: '2026-03-18T10:30:00Z',
        purpose: 'Group study session for final exam preparation',
        attendees: '4',
        specialRequirements: 'Whiteboard and markers, projector needed'
      },
      {
        id: '2',
        roomId: 'LL-GD-01',
        roomName: 'LL-GD-01',
        slot: '11-13',
        studentId: 'ST002',
        studentName: 'Jane Smith',
        timestamp: '2026-03-18T11:15:00Z',
        status: 'pending' as const,
        requestTime: '2026-03-18T11:15:00Z',
        purpose: 'Project presentation with slides',
        attendees: '3',
        specialRequirements: 'Projector, HDMI cable, and presentation remote'
      },
      {
        id: '3',
        roomId: 'M-GD-02',
        roomName: 'M-GD-02',
        slot: '14-16',
        studentId: 'ST003',
        studentName: 'Mike Johnson',
        timestamp: '2026-03-18T13:45:00Z',
        status: 'approved' as const,
        requestTime: '2026-03-18T13:45:00Z',
        purpose: 'Team meeting for project planning',
        attendees: '5',
        specialRequirements: 'Large whiteboard, conference phone',
        adminComment: 'Approved - Room available for requested time'
      },
      {
        id: '4',
        roomId: 'LL-GD-02',
        roomName: 'LL-GD-02',
        slot: '16-18',
        studentId: 'ST004',
        studentName: 'Sarah Wilson',
        timestamp: '2026-03-18T15:30:00Z',
        status: 'rejected' as const,
        requestTime: '2026-03-18T15:30:00Z',
        purpose: 'Birthday party celebration',
        attendees: '8',
        specialRequirements: 'Decorations, sound system, and catering',
        adminComment: 'Rejected - GD rooms not for personal events'
      }
    ];
    
    console.log('Using default booking requests data');
    return defaultData;
  };
  
  // Initialize state with data from localStorage
  const [bookingRequests, setBookingRequests] = useState<GDBookingRequest[]>(getInitialData);
  
  // Save to localStorage whenever bookingRequests changes
  useEffect(() => {
    try {
      localStorage.setItem('gdBookingRequests', JSON.stringify(bookingRequests));
      console.log('Saved booking requests to localStorage:', bookingRequests);
    } catch (error) {
      console.error('Error saving booking requests to localStorage:', error);
    }
  }, [bookingRequests]);

  // Test function to verify state updates
  const testStateUpdate = () => {
    alert('Test button clicked! Check console for logs.');
    console.log('Testing state update...');
    console.log('Current bookingRequests before update:', bookingRequests);
    
    const newRequests = bookingRequests.map(req => 
      req.id === '1' 
        ? { ...req, status: 'approved' as const, adminComment: 'Test update' }
        : req
    );
    
    console.log('New bookingRequests after update:', newRequests);
    setBookingRequests(newRequests);
    
    // Force re-render by updating activeTab
    setActiveTab('approved');
    setTimeout(() => setActiveTab('pending'), 100);
  };

  const handleApprove = async (requestId: string) => {
    console.log('Approving request:', requestId);
    try {
      // Direct state update without loading state
      setBookingRequests(prev => {
        console.log('Before approve - current requests:', prev);
        const updated = prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'approved' as const, adminComment: 'Approved by admin' }
            : req
        );
        console.log('After approve - updated requests:', updated);
        return updated;
      });
      
      toast.success('Booking request approved successfully!');
    } catch (error: any) {
      console.error('Approval failed:', error);
      toast.error('Failed to approve booking request');
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    console.log('Rejecting request:', requestId, 'Reason:', reason);
    try {
      // Direct state update without loading state
      setBookingRequests(prev => {
        console.log('Before reject - current requests:', prev);
        const updated = prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'rejected' as const, adminComment: reason }
            : req
        );
        console.log('After reject - updated requests:', updated);
        return updated;
      });
      
      toast.success('Booking request rejected successfully!');
    } catch (error: any) {
      console.error('Rejection failed:', error);
      toast.error('Failed to reject booking request');
    }
  };

  const filteredRequests = bookingRequests.filter(req => req.status === activeTab);
  console.log('Filtering requests - activeTab:', activeTab);
  console.log('Filtering requests - bookingRequests:', bookingRequests);
  console.log('Filtering requests - filteredRequests:', filteredRequests);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  // Check if user is admin
  console.log('AdminConsole - Auth state:', authState);
  console.log('AdminConsole - User role:', authState.user?.role);
  console.log('AdminConsole - Is admin?', authState.isAuthenticated && authState.user?.role === 'admin');
  
  if (!authState.isAuthenticated || authState.user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-12 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">🚫 Access Denied</h2>
          <p className="text-gray-600 mb-6">Admin access required to view this page.</p>
          <button
            onClick={() => history.push('/dashboard')}
            className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-all"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">👨‍💼 Admin Console</h1>
                <p className="text-gray-600">GD Room Booking Management</p>
              </div>
              <button
                onClick={() => history.push('/dashboard')}
                className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{bookingRequests.filter(r => r.status === 'pending').length}</div>
              <div className="text-sm text-gray-600">Pending Requests</div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{bookingRequests.filter(r => r.status === 'approved').length}</div>
              <div className="text-sm text-gray-600">Approved Today</div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{bookingRequests.filter(r => r.status === 'rejected').length}</div>
              <div className="text-sm text-gray-600">Rejected Today</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-6 mb-8">
          <div className="flex space-x-4">
            {['pending', 'approved', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab === 'pending' && '⏳ Pending'}
                {tab === 'approved' && '✅ Approved'}
                {tab === 'rejected' && '❌ Rejected'}
              </button>
            ))}
          </div>
        </div>

        {/* Booking Requests */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {activeTab === 'pending' && '⏳ Pending Requests'}
              {activeTab === 'approved' && '✅ Approved Requests'}
              {activeTab === 'rejected' && '❌ Rejected Requests'}
            </h2>
            <div className="text-sm text-gray-600">
              {filteredRequests.length} requests
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          )}

          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className={`border rounded-xl p-6 ${getStatusColor(request.status)}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-lg font-semibold ${getStatusColor(request.status).split(' ')[0]}`}>
                        {getStatusIcon(request.status)} {request.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        Requested {new Date(request.requestTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(request.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Student</div>
                    <div className="font-semibold">{request.studentName}</div>
                    <div className="text-sm text-gray-500">ID: {request.studentId}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Booking Details</div>
                    <div className="font-semibold">{request.roomName}</div>
                    <div className="text-sm text-indigo-600">🕐 Slot: {request.slot}</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {request.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={loading}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Approving...' : '✅ Approve'}
                    </button>
                  )}
                  {request.status === 'pending' && (
                    <button
                      onClick={() => handleReject(request.id, 'Inappropriate for GD room')}
                      disabled={loading}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Rejecting...' : '❌ Reject'}
                    </button>
                  )}
                  {request.status === 'approved' && (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-center">
                      <span className="font-medium">✅ Approved</span>
                    </div>
                  )}
                  {request.status === 'rejected' && (
                    <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-center">
                      <span className="font-medium">❌ Rejected</span>
                    </div>
                  )}
                </div>

                {request.status === 'approved' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-green-800 font-medium">
                      ✅ Approved on {new Date(request.timestamp).toLocaleString()}
                    </div>
                  </div>
                )}

                {request.status === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-red-800 font-medium">
                      ❌ Rejected - Slot not available
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConsole;
