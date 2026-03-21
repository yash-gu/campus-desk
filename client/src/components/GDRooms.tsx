import React from 'react';
import { useNavigate } from 'react-router-dom';

const GDRooms: React.FC = () => {
  const navigate = useNavigate();

  const gdRooms = [
    {
      id: 'M-GD-01',
      name: 'M-GD-01',
      location: 'M-Block, 1st Floor',
      capacity: 6,
      slots: ['9-11', '11-13', '13-15', '15-17', '17-19', '19-21'],
      color: 'from-blue-400 to-indigo-600',
      icon: '👥',
      description: 'Group Discussion Room'
    },
    {
      id: 'M-GD-02',
      name: 'M-GD-02', 
      location: 'M-Block, 2nd Floor',
      capacity: 6,
      slots: ['9-11', '11-13', '13-15', '15-17', '17-19', '19-21'],
      color: 'from-indigo-400 to-purple-600',
      icon: '👥',
      description: 'Collaboration Room'
    },
    {
      id: 'M-GD-03',
      name: 'M-GD-03',
      location: 'M-Block, 3rd Floor', 
      capacity: 6,
      slots: ['9-11', '11-13', '13-15', '15-17', '17-19', '19-21'],
      color: 'from-purple-400 to-pink-600',
      icon: '👥',
      description: 'Study Room'
    },
    {
      id: 'M-GD-04',
      name: 'M-GD-04',
      location: 'M-Block, 4th Floor',
      capacity: 6,
      slots: ['9-11', '11-13', '13-15', '15-17', '17-19', '19-21'],
      color: 'from-pink-400 to-rose-600',
      icon: '👥',
      description: 'Project Room'
    },
    {
      id: 'LL-GD-01',
      name: 'LL-GD-01',
      location: 'Law Library, 1st Floor',
      capacity: 6,
      slots: ['9-11', '11-13', '13-15', '15-17', '17-19', '19-21'],
      color: 'from-rose-400 to-red-600',
      icon: '⚖️',
      description: 'Moot Court Room'
    },
    {
      id: 'LL-GD-02',
      name: 'LL-GD-02',
      location: 'Law Library, 2nd Floor',
      capacity: 6,
      slots: ['9-11', '11-13', '13-15', '15-17', '17-19', '19-21'],
      color: 'from-red-400 to-orange-600',
      icon: '⚖️',
      description: 'Debate Room'
    }
  ];

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">🏛️️ GD Room Booking</h1>
              <p className="text-gray-600">Group Discussion Room Management System</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* GD Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {gdRooms.map((room) => (
          <div
            key={room.id}
            onClick={() => navigate(`/gd-room/${room.id}`)}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8 h-full">
              {/* Room Header */}
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${room.color} flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform`}>
                {room.icon}
              </div>
              
              {/* Room Info */}
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{room.name}</h3>
              <p className="text-gray-600 mb-4">{room.description}</p>
              <p className="text-sm text-gray-500 mb-6">📍 {room.location}</p>
              
              {/* Room Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">{room.capacity}</div>
                  <div className="text-sm text-gray-600">Total Slots</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">6</div>
                  <div className="text-sm text-gray-600">Time Slots</div>
                </div>
              </div>
              
              {/* Available Slots */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">🕐 Available Time Slots</h4>
                <div className="grid grid-cols-3 gap-2">
                  {room.slots.map((slot, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:border-indigo-300 transition-colors"
                    >
                      <div className="font-medium text-gray-800">{slot}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Action Button */}
              <div className="mt-6">
                <button
                  onClick={() => navigate(`/gd-room/${room.id}`)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
                >
                  📱 Book Slot in {room.name}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GDRooms;
