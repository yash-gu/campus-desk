import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

interface RoomConfig {
  id: string;
  name: string;
  location: string;
  capacity: number;
  slots: string[];
  color: string;
  icon: string;
  description: string;
}

const GDRoomDetail: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const history = useHistory();
  const { authState } = useAuth();

  const roomConfig: Record<string, RoomConfig> = {
    'M-GD-01': {
      id: 'M-GD-01',
      name: 'M-GD-01',
      location: 'M-Block, 1st Floor',
      capacity: 6,
      slots: ['9-11', '11-13', '13-15', '15-17', '17-19', '19-21'],
      color: 'from-blue-400 to-indigo-600',
      icon: '👥',
      description: 'Spacious GD Room for Large Groups'
    },
    'M-GD-02': { 
      id: 'M-GD-02', 
      name: 'M-GD-02', 
      location: 'M-Block, 2nd Floor',
      capacity: 6,
      slots: ['11:00 AM', '02:00 PM', '05:00 PM'],
      color: 'from-indigo-400 to-purple-600',
      icon: '👥',
      description: 'Collaboration GD Room'
    },
    'M-GD-03': { 
      id: 'M-GD-03', 
      name: 'M-GD-03',
      location: 'M-Block, 3rd Floor', 
      capacity: 6,
      slots: ['9-11', '11-13', '13-15', '15-17', '17-19', '19-21'],
      color: 'from-purple-400 to-pink-600',
      icon: '👥',
      description: 'Study Room GD'
    },
    'M-GD-04': { 
      id: 'M-GD-04', 
      name: 'M-GD-04',
      location: 'M-Block, 4th Floor', 
      capacity: 6,
      slots: ['9-11', '11-13', '13-15', '15-17', '17-19', '19-21'],
      color: 'from-pink-400 to-rose-600',
      icon: '👥',
      description: 'Project Room GD'
    },
    'LL-GD-01': { 
      id: 'LL-GD-01', 
      name: 'LL-GD-01', 
      location: 'Law Library, 1st Floor', 
      capacity: 6,
      slots: ['10:00 AM', '01:00 PM', '03:00 PM'],
      color: 'from-rose-400 to-red-600',
      icon: '⚖️',
      description: 'Law Library Discussion Suite'
    },
    'LL-GD-02': { 
      id: 'LL-GD-02', 
      name: 'LL-GD-02',
      location: 'Law Library, 2nd Floor', 
      capacity: 6,
      slots: ['09:00 AM', '12:00 PM', '04:00 PM'],
      color: 'from-red-400 to-orange-600',
      icon: '⚖️',
      description: 'Premium Discussion Room'
    }
  };

  const room = roomConfig[roomId as keyof typeof roomConfig];

  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    purpose: '',
    attendees: '',
    specialRequirements: ''
  });
  const [userBookings, setUserBookings] = useState<string[]>([]);

  // Fetch user's booking status
  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        // Simulate API call to get user's bookings
        const mockUserBookings = [
          'M-GD-01:9-11', // Approved booking
          'LL-GD-02:14-16'  // Rejected booking
        ];
        setUserBookings(mockUserBookings);
      } catch (error) {
        console.error('Error fetching user bookings:', error);
      }
    };

    if (authState.isAuthenticated) {
      fetchUserBookings();
    }
  }, [authState.isAuthenticated, authState.user?.studentId]);

  // Early return if room doesn't exist
  const getSlotStatus = (slot: string) => {
    const bookingKey = `${roomId}:${slot}`;
    if (userBookings.includes(bookingKey)) {
      if (bookingKey.includes('M-GD-01:9-11')) {
        return { status: 'approved', color: 'bg-green-500 text-white', icon: '✅', text: 'Approved' };
      } else if (bookingKey.includes('LL-GD-02:14-16')) {
        return { status: 'rejected', color: 'bg-red-500 text-white', icon: '❌', text: 'Rejected' };
      }
    }
    return { status: 'available', color: 'bg-white text-gray-800 border-gray-100 hover:border-indigo-300 hover:bg-indigo-50', icon: '🕐', text: 'Available' };
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-12 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Room Not Found</h2>
          <p className="text-gray-600 mb-6">The requested GD room "{roomId}" does not exist.</p>
          <button
            onClick={() => history.push('/gd-rooms')}
            className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-all"
          >
            ← Back to GD Rooms
          </button>
        </div>
      </div>
    );
  }

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }
    if (!authState.isAuthenticated) {
      toast.error('Please login to book a slot');
      history.push('/login');
      return;
    }

    try {
      const bookingData = {
        roomId,
        roomName: room.name,
        slot: selectedSlot,
        studentId: authState.user?.studentId,
        studentName: authState.user?.name || 'Unknown User',
        purpose: bookingDetails.purpose,
        attendees: bookingDetails.attendees,
        specialRequirements: bookingDetails.specialRequirements,
        timestamp: new Date().toISOString()
      };
      console.log('GD Room booking request:', bookingData);
      toast.success(`Booking request submitted for ${room.name} - ${selectedSlot}`);
      setShowBookingForm(false);
      setSelectedSlot('');
      setBookingDetails({ purpose: '', attendees: '', specialRequirements: '' });
      setTimeout(() => history.push('/gd-rooms'), 2000);
    } catch (error: any) {
      toast.error('Failed to submit booking request');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{room.name}</h1>
                <p className="text-gray-600">{room.description}</p>
                <p className="text-sm text-gray-500">📍 {room.location}</p>
              </div>
              <button
                onClick={() => history.push('/gd-rooms')}
                className="bg-gray-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-gray-600 transition-all"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Room Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Room ID:</span>
                <span className="font-semibold">{room.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-semibold">{room.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-semibold">{room.capacity} Persons</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Time Slot</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {room.slots.map((slot: string) => {
                const slotStatus = getSlotStatus(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => handleSlotSelect(slot)}
                    disabled={slotStatus.status !== 'available'}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      slotStatus.color
                    }`}
                  >
                    <div className="text-lg font-medium">{slot}</div>
                    <div className="text-xs mt-1 font-medium">
                      {slotStatus.icon} {slotStatus.text}
                    </div>
                  </button>
                );
              })}
            </div>

            {showBookingForm && (
              <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Booking</h3>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="bg-white border border-gray-100 rounded-lg p-3 text-gray-800">
                    <span className="text-sm text-gray-500 block">Selected Slot</span>
                    <span className="font-medium">{selectedSlot}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purpose of Booking
                    </label>
                    <textarea
                      value={bookingDetails.purpose}
                      onChange={(e) => setBookingDetails({...bookingDetails, purpose: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      rows={3}
                      placeholder="e.g., Group study session, project discussion..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Attendees
                    </label>
                    <input
                      type="number"
                      value={bookingDetails.attendees}
                      onChange={(e) => setBookingDetails({...bookingDetails, attendees: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      min="1"
                      max={room.capacity}
                      placeholder={`Maximum ${room.capacity} people`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requirements
                    </label>
                    <textarea
                      value={bookingDetails.specialRequirements}
                      onChange={(e) => setBookingDetails({...bookingDetails, specialRequirements: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      rows={2}
                      placeholder="e.g., Whiteboard, projector, special equipment..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-all shadow-md"
                  >
                    📅 Submit Booking Request
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDRoomDetail;