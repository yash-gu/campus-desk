import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSeat } from '../context/SeatContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const CurrentSession: React.FC = () => {
  const history = useHistory();
  const { seatState, checkOut, reCheckIn } = useSeat();
  const { authState } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (seatState.activeBooking) {
      const checkInTime = new Date(seatState.activeBooking.lastCheckedIn);
      const ninetyMinutes = 90 * 60 * 1000; // 90 minutes in milliseconds
      
      const timer = setInterval(() => {
        const now = new Date();
        const elapsed = now.getTime() - checkInTime.getTime();
        const remaining = Math.max(0, ninetyMinutes - elapsed);
        setTimeRemaining(remaining);
        
        // Show warning when 10 minutes remaining
        if (remaining === 10 * 60 * 1000) {
          toast('⚠️ 10 minutes remaining! Please re-scan your QR code.', {
            duration: 10000,
            icon: '⏰',
          });
        }
        
        if (remaining === 0) {
          toast.error('Session expired! Your seat has been ghosted.', {
            duration: 10000,
          });
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [seatState.activeBooking]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const getTimeColor = () => {
    if (timeRemaining === 0) return 'text-gray-500';
    if (timeRemaining < 10 * 60 * 1000) return 'text-red-600';
    if (timeRemaining < 30 * 60 * 1000) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const handleReCheckIn = async () => {
    try {
      await reCheckIn();
      toast.success('Session extended for 90 minutes!');
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut();
      history.push('/dashboard');
    } catch (error) {
      console.error('Failed to check out:', error);
    }
  };

  if (!seatState.activeBooking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-12 w-full max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Active Session</h2>
            <p className="text-gray-600 mb-8">
              You don't have any active seat bookings.
            </p>
            <button
              onClick={() => history.push('/dashboard')}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-8">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => history.push('/dashboard')}
                className="text-indigo-600 hover:text-indigo-700 mb-4 flex items-center gap-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Current Session</h1>
              <p className="text-xl text-gray-600">Manage your active booking</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-700">Welcome,</p>
              <p className="text-2xl font-bold text-indigo-600">{authState.user?.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Session Info */}
        <div className="lg:col-span-2">
          <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Session Details</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Seat Number</h3>
                  <p className="text-3xl font-bold text-indigo-600">{seatState.activeBooking.seatId}</p>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Zone</h3>
                  <p className="text-3xl font-bold text-emerald-600">{seatState.activeBooking.zone}</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Check-in Time</h3>
                  <p className="text-xl font-bold text-amber-600">
                    {new Date(seatState.activeBooking.checkInTime).toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Status</h3>
                  <p className="text-xl font-bold text-rose-600 capitalize">{seatState.activeBooking.status}</p>
                </div>
              </div>

              {/* Timer */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl p-8 text-center">
                <h3 className="text-lg font-semibold mb-4">Time Remaining</h3>
                <div className={`text-5xl font-bold mb-2 ${getTimeColor()}`}>
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-sm text-gray-400">
                  {timeRemaining === 0 
                    ? 'Session has expired' 
                    : 'Session will expire if not extended'
                  }
                </p>
                {timeRemaining < 30 * 60 * 1000 && timeRemaining > 0 && (
                  <div className="mt-4 p-3 bg-amber-500/20 rounded-lg">
                    <p className="text-amber-300 text-sm">
                      ⚠️ Please extend your session soon to avoid ghosting
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Actions</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => history.push('/scanner')}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                📷 Re-scan QR Code
              </button>
              
              <button
                onClick={handleReCheckIn}
                disabled={timeRemaining > 60 * 60 * 1000}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                ⏰ Extend Session
              </button>
              
              <button
                onClick={handleCheckOut}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                🚪 Check Out
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">Session Rules:</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Sessions last 90 minutes</li>
                <li>• Re-scan QR to extend</li>
                <li>• Auto-ghost after expiry</li>
                <li>• One seat per student</li>
              </ul>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Today's Stats</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Session Duration</span>
                <span className="font-bold text-gray-800">
                  {Math.floor((Date.now() - new Date(seatState.activeBooking.checkInTime).getTime()) / (1000 * 60))} min
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Extensions Used</span>
                <span className="font-bold text-gray-800">0</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Zone Occupancy</span>
                <span className="font-bold text-gray-800">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentSession;
