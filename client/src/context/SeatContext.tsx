import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

interface Seat {
  seatId: string;
  zone: string;
  status: 'emerald' | 'amber' | 'rose' | 'ghosted';
  lastUpdated: string;
  position: {
    row: number;
    col: number;
  };
}

interface Booking {
  studentId: string;
  seatId: string;
  zone: string;
  checkInTime: string;
  lastCheckedIn: string;
  status: 'active' | 'ghosted' | 'checked-out';
  qrCode: string;
}

interface SeatState {
  seats: { [zone: string]: Seat[] };
  activeBooking: Booking | null;
  loading: boolean;
  error: string | null;
}

type SeatAction =
  | { type: 'SET_SEATS'; payload: { zone: string; seats: Seat[] } }
  | { type: 'UPDATE_SEAT'; payload: { seatId: string; status: string; zone: string } }
  | { type: 'SET_ACTIVE_BOOKING'; payload: Booking | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: SeatState = {
  seats: {},
  activeBooking: null,
  loading: true,
  error: null,
};

const seatReducer = (state: SeatState, action: SeatAction): SeatState => {
  switch (action.type) {
    case 'SET_SEATS':
      return {
        ...state,
        seats: {
          ...state.seats,
          [action.payload.zone]: action.payload.seats,
        },
        loading: false,
      };
    case 'UPDATE_SEAT':
      const updatedSeats = { ...state.seats };
      const zoneSeats = updatedSeats[action.payload.zone] || [];
      const seatIndex = zoneSeats.findIndex(seat => seat.seatId === action.payload.seatId);
      
      if (seatIndex !== -1) {
        updatedSeats[action.payload.zone] = [
          ...zoneSeats.slice(0, seatIndex),
          { ...zoneSeats[seatIndex], status: action.payload.status as any },
          ...zoneSeats.slice(seatIndex + 1),
        ];
      }
      
      return {
        ...state,
        seats: updatedSeats,
      };
    case 'SET_ACTIVE_BOOKING':
      return {
        ...state,
        activeBooking: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

interface SeatContextType {
  seatState: SeatState;
  fetchSeats: (zone: string) => Promise<void>;
  checkIn: (seatId: string, qrCode: string) => Promise<void>;
  checkOut: () => Promise<void>;
  reCheckIn: () => Promise<void>;
  checkActiveBooking: () => Promise<void>;
  initializeSeats: () => Promise<void>;
}

const SeatContext = createContext<SeatContextType | undefined>(undefined);

export const useSeat = () => {
  const context = useContext(SeatContext);
  if (!context) {
    throw new Error('useSeat must be used within a SeatProvider');
  }
  return context;
};

interface SeatProviderProps {
  children: React.ReactNode;
  socket: Socket | null;
}

export const SeatProvider: React.FC<SeatProviderProps> = ({ children, socket }) => {
  const [seatState, dispatch] = useReducer(seatReducer, initialState);

  useEffect(() => {
    if (socket) {
      console.log('Setting up Socket.io listeners...');
      
      socket.on('seatUpdate', (data: any) => {
        console.log('Received seat update:', data);
        
        dispatch({
          type: 'UPDATE_SEAT',
          payload: data,
        });
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      return () => {
        console.log('Cleaning up Socket.io listeners...');
        socket.off('seatUpdate');
        socket.off('connect');
        socket.off('disconnect');
      };
    }
  }, [socket]);

  const fetchSeats = useCallback(async (zone: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.get(`/seats/${zone}`);
      dispatch({
        type: 'SET_SEATS',
        payload: { zone, seats: response.data },
      });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch seats' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const checkIn = useCallback(async (seatId: string, qrCode: string) => {
    try {
      const response = await api.post('/bookings/checkin', { seatId, qrCode });
      dispatch({
        type: 'SET_ACTIVE_BOOKING',
        payload: response.data.booking,
      });
      toast.success('Successfully checked in!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    }
  }, []);

  const checkOut = async () => {
    try {
      await api.post('/bookings/checkout');
      dispatch({ type: 'SET_ACTIVE_BOOKING', payload: null });
      toast.success('Successfully checked out!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    }
  };

  const reCheckIn = async () => {
    try {
      await api.post('/bookings/recheckin');
      toast.success('Session extended!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to extend session');
    }
  };

  const checkActiveBooking = useCallback(async () => {
    try {
      const response = await api.get('/bookings/active');
      dispatch({
        type: 'SET_ACTIVE_BOOKING',
        payload: response.data.booking || null,
      });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to check booking' });
    }
  }, []);

  const initializeSeats = async () => {
    try {
      await api.post('/seats/initialize');
      toast.success('Seats initialized successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initialize seats');
    }
  };

  return (
    <SeatContext.Provider
      value={{
        seatState,
        fetchSeats,
        checkIn,
        checkOut,
        reCheckIn,
        checkActiveBooking,
        initializeSeats,
      }}
    >
      {children}
    </SeatContext.Provider>
  );
};
