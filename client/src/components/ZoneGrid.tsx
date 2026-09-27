import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSeat } from '../context/SeatContext';
import { useAuth } from '../context/AuthContext';

const ZoneGrid: React.FC = () => {
  const { zoneName } = useParams<{ zoneName: string }>();
  const history = useHistory();
  const { seatState, fetchSeats, checkIn } = useSeat();
  const { authState } = useAuth();
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  useEffect(() => {
    if (zoneName) {
      fetchSeats(zoneName);
    }
  }, [zoneName, fetchSeats]);

  const zoneSeats = seatState.seats[zoneName || ''] || [];
  
  const zoneConfig = useMemo(() => {
    switch (zoneName) {
      case 'M-Block':
        return { cols: 20, color: 'blue' };
      case 'Law':
        return { cols: 15, color: 'purple' };
      case 'Central':
        return { cols: 15, color: 'green' };
      default:
        return { cols: 15, color: 'gray' };
    }
  }, [zoneName]);

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'emerald':
        return 'bg-slate-900 text-emerald-400 border-2 border-emerald-500 hover:bg-black hover:border-emerald-400 hover:text-emerald-300 shadow-md';
      case 'rose':
        return 'bg-slate-900 text-rose-400 border-2 border-rose-600/70 opacity-60';
      case 'amber':
        return 'bg-slate-900 text-amber-400 border-2 border-amber-500/70 opacity-60';
      case 'ghosted':
        return 'bg-slate-900 text-gray-400 border-2 border-gray-600 opacity-50';
      default:
        return 'bg-slate-900 text-white border-2 border-gray-700';
    }
  };

  const handleSeatClick = (seatId: string, status: string) => {
    if (seatState.activeBooking) {
      return;
    }

    if (status === 'emerald') {
      setSelectedSeat(seatId);
    }
  };

  const handleBookSeat = () => {
    if (selectedSeat) {
      history.push('/scanner', { seatId: selectedSeat });
    }
  };

  if (seatState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
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
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{zoneName} Library</h1>
              <p className="text-xl text-gray-600">{zoneSeats.length} seats available</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-700">Welcome,</p>
              <p className="text-2xl font-bold text-indigo-600">{authState.user?.name}</p>
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
                <p className="text-sm opacity-90 mt-2">You must check out before booking another seat.</p>
              </div>
              <button
                onClick={() => history.push('/session')}
                className="bg-white text-rose-500 px-6 py-3 rounded-xl font-semibold hover:bg-rose-50 transition-all"
              >
                Manage Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mb-8">
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Seat Status Legend</h3>
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded"></div>
              <span className="text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-rose-500 rounded"></div>
              <span className="text-gray-700">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-500 rounded"></div>
              <span className="text-gray-700">Ghosted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-8">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${zoneConfig.cols}, minmax(0, 1fr))` }}>
          {zoneSeats.map((seat) => (
            <button
              key={seat.seatId}
              onClick={() => handleSeatClick(seat.seatId, seat.status)}
              disabled={seat.status !== 'emerald' || !!seatState.activeBooking}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-xs font-bold font-mono
                transition-all duration-200 transform
                ${getSeatColor(seat.status)}
                ${selectedSeat === seat.seatId ? '!bg-indigo-600 !text-white !border-indigo-400 ring-4 ring-indigo-400 scale-110 shadow-2xl z-10' : ''}
                ${seat.status === 'emerald' && !seatState.activeBooking ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
              `}
              title={`${seat.seatId} - ${seat.status}`}
            >
              {seat.seatId.split('-')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Seat Action */}
      {selectedSeat && !seatState.activeBooking && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/90 backdrop-blur-2xl border border-white shadow-2xl rounded-[2rem] p-6">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-lg font-semibold text-gray-800">Selected Seat:</p>
                <p className="text-2xl font-bold text-indigo-600">{selectedSeat}</p>
              </div>
              <button
                onClick={handleBookSeat}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Proceed to Check-in
              </button>
              <button
                onClick={() => setSelectedSeat(null)}
                className="bg-gray-200 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneGrid;
