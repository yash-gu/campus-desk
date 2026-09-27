import React, { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSeat } from '../context/SeatContext';

const Dashboard: React.FC = () => {
  const history = useHistory();
  const { authState, logout } = useAuth();
  const { seatState, checkActiveBooking, initializeSeats, fetchSeats } = useSeat();
  const [zoneStats, setZoneStats] = useState({
    'M-Block': { available: 0, occupied: 0, ghosted: 0 },
    'Law': { available: 0, occupied: 0, ghosted: 0 },
    'Central': { available: 0, occupied: 0, ghosted: 0 }
  });

  // Calculate zone statistics from seat data
  const calculateZoneStats = useCallback(() => {
    const stats: Record<string, { available: number; occupied: number; ghosted: number }> = {
      'M-Block': { available: 0, occupied: 0, ghosted: 0 },
      'Law': { available: 0, occupied: 0, ghosted: 0 },
      'Central': { available: 0, occupied: 0, ghosted: 0 }
    };

    console.log('Calculating zone stats from seat data:', seatState.seats);

    Object.entries(seatState.seats).forEach(([zone, seats]) => {
      if (stats[zone] && seats) {
        console.log(`Processing ${zone} with ${seats.length} seats`);
        seats.forEach(seat => {
          switch (seat.status) {
            case 'emerald':
              stats[zone].available++;
              break;
            case 'rose':
              stats[zone].occupied++;
              break;
            case 'amber':
            case 'ghosted':
              stats[zone].ghosted++;
              break;
          }
        });
        console.log(`${zone} stats:`, stats[zone]);
      }
    });

    console.log('Final calculated stats:', stats);
    return stats;
  }, [seatState.seats]);

  // Update zone stats whenever seat data changes
  useEffect(() => {
    const stats = calculateZoneStats();
    // Ensure all zones have default values
    const finalStats = {
      'M-Block': stats['M-Block'] || { available: 0, occupied: 0, ghosted: 0 },
      'Law': stats['Law'] || { available: 0, occupied: 0, ghosted: 0 },
      'Central': stats['Central'] || { available: 0, occupied: 0, ghosted: 0 }
    };
    setZoneStats(finalStats);
  }, [seatState.seats, calculateZoneStats]);

  useEffect(() => {
    if (!authState.loading && !authState.isAuthenticated) {
      history.push('/login');
    }
  }, [authState.loading, authState.isAuthenticated, history]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      checkActiveBooking();
      
      // Fetch seat data for all zones
      const zones = ['M-Block', 'Law', 'Central'];
      zones.forEach(zone => {
        fetchSeats(zone);
      });
    }
  }, [authState.isAuthenticated]); // Remove function dependencies

  const zones = [
    {
      name: 'M-Block',
      description: 'Massive Library Zone',
      seatCount: 1010,
      color: 'from-blue-400 to-indigo-600',
      icon: '📚',
    },
    {
      name: 'Law',
      description: 'Legal Studies Zone',
      seatCount: 205,
      color: 'from-purple-400 to-pink-600',
      icon: '⚖️',
    },
    {
      name: 'Central',
      description: 'Central Library Zone',
      seatCount: 105,
      color: 'from-green-400 to-teal-600',
      icon: '🏛️',
    },
    {
      name: 'GD Rooms',
      description: 'Group Discussion Room Management',
      seatCount: 36, // 6 rooms × 6 slots each
      color: 'from-rose-400 to-orange-600',
      icon: '🏛️️',
      isGD: true,
    },
  ];

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-800 mb-2">Campus Desk</h1>
              <p className="text-xl text-gray-600">Triple-Zone Library Management Ecosystem</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-700">Welcome back,</p>
              <p className="text-2xl font-bold text-indigo-600">{authState.user?.name}</p>
              <p className="text-sm text-gray-500">{authState.user?.studentId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Session Banner */}
      {seatState.activeBooking && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-[2rem] p-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold mb-2">Current Session Active</h3>
                <p className="text-lg">You are seated at: <span className="font-bold">{seatState.activeBooking.seatId}</span></p>
                <p className="text-sm opacity-90">Zone: {seatState.activeBooking.zone}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => history.push('/session')}
                  className="bg-white text-rose-500 px-6 py-3 rounded-xl font-semibold hover:bg-rose-50 transition-all"
                >
                  Extend Session
                </button>
                <button
                  onClick={() => history.push('/scanner')}
                  className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all"
                >
                  Scan QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {zones.map((zone) => (
          <div
            key={zone.name}
            onClick={() => zone.isGD ? history.push('/gd-rooms') : history.push(`/zone/${zone.name}`)}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8 h-full">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${zone.color} flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform`}>
                {zone.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{zone.name}</h3>
              <p className="text-gray-600 mb-4">{zone.description}</p>
              
              {zone.isGD ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">{zone.seatCount}</div>
                      <div className="text-sm text-gray-600">Total Rooms</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-rose-600">36</div>
                      <div className="text-sm text-gray-600">Time Slots</div>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-gray-700 mb-3">🏛️️ GD Room Features</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• 6 discussion rooms available</li>
                      <li>• 6 time slots per room</li>
                      <li>• Admin approval required</li>
                      <li>• QR code based booking</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">{zoneStats[zone.name as keyof typeof zoneStats]?.available || 0}</div>
                      <div className="text-xs text-gray-600">Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-rose-600">{zoneStats[zone.name as keyof typeof zoneStats]?.occupied || 0}</div>
                      <div className="text-xs text-gray-600">Occupied</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">{zoneStats[zone.name as keyof typeof zoneStats]?.ghosted || 0}</div>
                      <div className="text-xs text-gray-600">Ghosted</div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gray-700">Total: {zone.seatCount}</div>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <div className="text-xs text-gray-600">Available</div>
                    <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                    <div className="text-xs text-gray-600">Occupied</div>
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <div className="text-xs text-gray-600">Ghosted</div>
                  </div>
                  <div className="text-lg font-semibold text-indigo-600">
                    {zone.isGD ? '🏛️️ Manage Rooms' : '📱 Select Seats'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => history.push('/scanner')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            📷 Quick Check-in
          </button>
          <button
            onClick={() => seatState.activeBooking && history.push('/session')}
            disabled={!seatState.activeBooking}
            className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⏰ Extend Session
          </button>
          <button
            onClick={initializeSeats}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            🔄 Initialize Seats
          </button>
          <button
            onClick={() => logout()}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            🚪 Logout
          </button>
        </div>
        {/* Admin Console Button - Only visible to admin users */}
        {authState.user?.role === 'admin' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => history.push('/admin')}
              className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white p-4 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              👨‍💼 Admin Console
            </button>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-6 text-center">
          <div className="text-4xl font-bold text-indigo-600 mb-2">1,320</div>
          <div className="text-gray-600">Total Seats</div>
        </div>
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-6 text-center">
          <div className="text-4xl font-bold text-emerald-600 mb-2">3</div>
          <div className="text-gray-600">Active Zones</div>
        </div>
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-6 text-center">
          <div className="text-4xl font-bold text-rose-600 mb-2">
            {seatState.activeBooking ? '1' : '0'}
          </div>
          <div className="text-gray-600">Your Active Sessions</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
