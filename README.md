# Campus Desk - Triple-Zone Library Management Ecosystem

A comprehensive library management system built with the MERN stack, managing 1,320 total seats across three distinct zones with strict single-seat validation and real-time synchronization.

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
- **Express Server**: RESTful API with Socket.io for real-time updates
- **MongoDB**: Seat and booking data with unique constraints
- **Authentication**: JWT-based auth with role management
- **Real-time**: Socket.io for instant seat status updates
- **Ghosting Detection**: Cron job for 90-minute session monitoring

### Frontend (React + TypeScript + Tailwind CSS v4)
- **Glassmorphism UI**: Modern light-mode design with backdrop blur
- **Real-time Updates**: Live seat status synchronization
- **QR Scanner**: Camera-based and manual QR code input
- **Responsive Grid**: Optimized for 1,010+ seats with windowing
- **Toast Notifications**: Non-intrusive user feedback

## 📊 Zone Configuration

### M-Block Library
- **Seats**: 1,010 (MB-0001 to MB-1010)
- **Grid**: 20 columns × ~51 rows
- **Performance**: React.memo for 60fps rendering

### Law Library  
- **Seats**: 205 (LL-0001 to LL-0205)
- **Grid**: 15 columns × ~14 rows
- **Layout**: Collaborative table-based design

### Central Library
- **Seats**: 105 (CL-0001 to CL-0105)
- **Grid**: 15 columns × 7 rows
- **Specialization**: Focused study zones

## 🚀 Features

### Strict Single-Seat Logic
- **Database Constraint**: Unique index on `studentId` in ActiveBookings
- **Backend Validation**: API prevents multiple active bookings
- **Frontend UI**: Disabled buttons when user has active session
- **Session Banner**: Persistent display of current booking

### Real-Time Synchronization
- **Socket.io Integration**: Instant seat status updates
- **Live Updates**: All users see changes immediately
- **Status Colors**: Emerald (available), Rose (occupied), Amber (ghosted)

### QR Scanner System
- **Camera Support**: qr-scanner library for fast scanning
- **Manual Entry**: Fallback for camera permission issues
- **Seat Validation**: QR code to seat mapping
- **Check-in Flow**: Seamless camera-to-API experience

### 90-Minute Ghosting Detection
- **Automatic Monitoring**: Cron job checks every 5 minutes
- **Session Extension**: Re-scan QR to extend session
- **Status Updates**: Automatic ghosting and notifications
- **Librarian Dashboard**: Real-time ghosted seat tracking

## 🎨 UI Design

### Glassmorphism Theme
- **Surface**: `bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem]`
- **Background**: Animated mesh gradient with floating blobs
- **Typography**: Plus Jakarta Sans font family
- **Colors**: Tailwind custom colors for seat statuses

### Responsive Design
- **Mobile**: Optimized grid layouts
- **Desktop**: Full-featured dashboard
- **Tablet**: Adaptive seat grids
- **Animations**: Smooth transitions and micro-interactions

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- Modern browser with camera support

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Update .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm start
```

### Full Stack Development
```bash
# Root directory
npm run install-all
npm run dev
```

## 📱 Usage

### Student Workflow
1. **Register/Login**: Create account or sign in
2. **Select Zone**: Choose from M-Block, Law, or Central
3. **Choose Seat**: Click available (green) seat
4. **Scan QR**: Use camera or manual entry
5. **Active Session**: Monitor time and extend as needed
6. **Check Out**: Release seat when done

### Librarian Features
- View all active bookings
- Monitor ghosted seats
- Manage user accounts
- Real-time dashboard updates

## 🔧 Configuration

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-desk
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### Seat Initialization
```bash
# Auto-initialize all zones via API
POST /api/seats/initialize
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd client && npm run build

# Backend
cd server && npm start
```

### Environment Setup
- Set `NODE_ENV=production`
- Use HTTPS for production
- Configure MongoDB Atlas for cloud deployment
- Set proper CORS origins

## 📋 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### Seats
- `GET /api/seats/:zone` - Get seats by zone
- `POST /api/seats/initialize` - Initialize all seats
- `GET /api/seats/seat/:seatId` - Get specific seat

### Bookings
- `GET /api/bookings/active` - Get active booking
- `POST /api/bookings/checkin` - Check-in to seat
- `POST /api/bookings/checkout` - Check-out from seat
- `POST /api/bookings/recheckin` - Extend session
- `GET /api/bookings/all` - Get all bookings (librarian)

## 🎯 Key Features Implemented

✅ **Triple-Zone Architecture**: 1,320 total seats across 3 zones  
✅ **Strict Single-Seat Logic**: Database and UI validation  
✅ **Real-Time Socket.io**: Live seat status updates  
✅ **QR Scanner**: Camera and manual entry  
✅ **90-Minute Ghosting**: Automatic detection and notifications  
✅ **Glassmorphism UI**: Modern light-mode design  
✅ **Responsive Grid**: Optimized for large seat counts  
✅ **JWT Authentication**: Secure user management  
✅ **MongoDB Integration**: Scalable data storage  

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- MERN Stack for the robust technology foundation
- Tailwind CSS v4 for modern styling
- Socket.io for real-time capabilities
- qr-scanner for camera integration
- React Hot Toast for elegant notifications
