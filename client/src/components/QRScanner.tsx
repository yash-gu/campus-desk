import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import { useSeat } from '../context/SeatContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const QRScanner: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ seatId?: string }>();
  const { checkIn, seatState } = useSeat();
  const { authState } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualQRCode, setManualQRCode] = useState('');
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.seatId) {
      setSelectedSeatId(location.state.seatId);
    }
  }, [location.state]);

  useEffect(() => {
    if (videoRef.current && !manualMode) {
      console.log('Initializing QR scanner...');
      let scanner: QrScanner | null = null;
      
      try {
        scanner = new QrScanner(
          videoRef.current,
          (result) => {
            console.log('QR code detected:', result.data);
            handleQRResult(result.data);
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
        
        setQrScanner(scanner);
        console.log('QR scanner initialized');
      } catch (error) {
        console.error('Failed to initialize QR scanner:', error);
        toast.error('QR scanner initialization failed. Using manual entry.');
        setManualMode(true);
      }
      
      return () => {
        if (scanner) {
          scanner.destroy();
        }
      };
    }
  }, [manualMode]);

  const checkCameraPermissions = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Camera permission check failed:', error);
    return false;
  }
};

const startScanning = async () => {
  if (qrScanner && !manualMode) {
    try {
      console.log('Checking camera permissions...');
      const hasPermission = await checkCameraPermissions();
      
      if (!hasPermission) {
        toast.error('Camera permission denied. Please enable camera access or use manual entry.');
        setManualMode(true);
        return;
      }
      
      console.log('Starting camera scanner...');
      await qrScanner.start();
      setScanning(true);
      console.log('Camera started successfully');
    } catch (error) {
      console.error('Failed to start camera:', error);
      toast.error('Camera access denied. Please check permissions or use manual entry.');
      setManualMode(true);
    }
  }
};

  const stopScanning = () => {
    if (qrScanner && !manualMode) {
      qrScanner.stop();
      setScanning(false);
    }
  };

  const handleQRResult = (qrData: string) => {
    stopScanning();
    
    console.log('QR data received:', qrData);
    
    const seatId = selectedSeatId || extractSeatIdFromQR(qrData);
    console.log('Extracted seat ID:', seatId);
    
    if (seatId) {
      performCheckIn(seatId, qrData);
    } else {
      toast.error('Invalid QR code format');
      setScanning(true);
    }
  };

  const extractSeatIdFromQR = (qrData: string): string | null => {
    console.log('Extracting seat ID from:', qrData);
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.seatId) {
        console.log('Found seat ID in JSON:', parsed.seatId);
        return parsed.seatId;
      }
    } catch (e) {
      // Not JSON, continue with regex patterns
    }
    
    const patterns = [
      /(MB|LL|CL)-\d{4}/,
      /seat:\s*(MB|LL|CL)-\d{4}/i,
      /id:\s*(MB|LL|CL)-\d{4}/i,
    ];
    
    for (const pattern of patterns) {
      const match = qrData.match(pattern);
      if (match) {
        const seatId = match[0]; // Return the full match, not just the group
        console.log('Found seat ID with regex:', seatId);
        return seatId;
      }
    }
    
    console.log('No seat ID found in QR data');
    return null;
  };

  const performCheckIn = async (seatId: string, qrCode: string) => {
    try {
      console.log('Attempting check-in for seat:', seatId);
      console.log('QR code data:', qrCode);
      
      await checkIn(seatId, qrCode);
      toast.success(`Successfully checked in at ${seatId}!`);
      history.push('/dashboard');
    } catch (error: any) {
      console.error('Check-in failed:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Check-in failed';
      toast.error(errorMessage);
      
      // Restart scanning for another attempt
      setScanning(true);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualQRCode.trim()) {
      toast.error('Please enter a QR code or seat ID');
      return;
    }
    
    console.log('Manual QR code submission:', manualQRCode);
    
    // Try to extract seat ID from the manual input
    const extractedSeatId = extractSeatIdFromQR(manualQRCode);
    
    if (extractedSeatId) {
      console.log('Using extracted seat ID:', extractedSeatId);
      await performCheckIn(extractedSeatId, manualQRCode);
    } else if (selectedSeatId) {
      console.log('Using selected seat ID:', selectedSeatId);
      await performCheckIn(selectedSeatId, manualQRCode);
    } else {
      toast.error('Invalid seat ID format. Please use format like MB-0001, LL-0001, or CL-0001');
    }
  };

  if (seatState.activeBooking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-12 w-full max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Session Detected</h2>
            <p className="text-gray-600 mb-6">
              You are already seated at <span className="font-bold text-rose-600">{seatState.activeBooking.seatId}</span>
            </p>
            <p className="text-gray-600 mb-8">
              Please check out before booking another seat.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => history.push('/dashboard')}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => history.push('/session')}
                className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Manage Session
              </button>
            </div>
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
              <h1 className="text-4xl font-bold text-gray-800 mb-2">QR Check-in</h1>
              <p className="text-xl text-gray-600">
                {selectedSeatId ? `Checking in to seat: ${selectedSeatId}` : 'Scan QR code to check in'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-700">Welcome,</p>
              <p className="text-2xl font-bold text-indigo-600">{authState.user?.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {manualMode ? 'Manual Entry' : 'QR Scanner'}
          </h2>
          
          {!manualMode ? (
            <div className="space-y-6">
              <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '1' }}>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />
                {!scanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">📷</div>
                      <p className="text-lg">Camera not started</p>
                      <p className="text-sm mt-2 opacity-75">Click "Start Scanner" to begin</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                {!scanning ? (
                  <button
                    onClick={startScanning}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Start Scanner
                  </button>
                ) : (
                  <button
                    onClick={stopScanning}
                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Stop Scanner
                  </button>
                )}
                <button
                  onClick={() => setManualMode(true)}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Manual Entry
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  If camera doesn't work, try refreshing the page or use manual entry
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label htmlFor="qrCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Seat ID or QR Code
                  </label>
                  <input
                    type="text"
                    id="qrCode"
                    value={manualQRCode}
                    onChange={(e) => setManualQRCode(e.target.value)}
                    placeholder="Enter seat ID (e.g., MB-0001, LL-0001, CL-0001) or QR code"
                    className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Check In
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualMode(false)}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Use Camera
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Instructions Section */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Instructions</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Select a seat</h3>
                <p className="text-gray-600">Choose an available seat (green) from your desired zone</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Scan QR code</h3>
                <p className="text-gray-600">Point your camera at the QR code on your selected seat</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Automatic check-in</h3>
                <p className="text-gray-600">System will automatically process your check-in</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Important Notes:</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• You can only have one active booking at a time</li>
              <li>• Sessions expire after 90 minutes without re-scanning</li>
              <li>• Make sure you're physically at the seat when checking in</li>
              <li>• Ghosted seats will be automatically released</li>
            </ul>
          </div>

          {selectedSeatId && (
            <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <h3 className="font-semibold text-emerald-800 mb-2">Selected Seat:</h3>
              <p className="text-2xl font-bold text-emerald-600">{selectedSeatId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
