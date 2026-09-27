# Vercel Deployment Guide - Campus Desk

## 🚀 Quick Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Root Directory
```bash
cd /Users/yashgupta/CAMPUS-DESK/campus-desk
vercel --prod
```

## 🔧 Environment Variables Setup

### Required Environment Variables in Vercel Dashboard:
1. `MONGODB_URI` - Your MongoDB Atlas connection string
2. `JWT_SECRET` - Your production JWT secret key
3. `NODE_ENV` - Set to `production`

### Setting Environment Variables:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add the required variables

## 📁 Project Structure for Vercel

```
campus-desk/
├── api/
│   └── index.js          # Main serverless function
├── client/
│   ├── public/
│   ├── src/
│   └── package.json      # React app
├── server/
│   ├── models/
│   ├── routes/
│   └── utils/
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json
```

## 🌐 API Endpoints

All API routes are prefixed with `/api/`:
- `/api/users/*` - User authentication and management
- `/api/seats/*` - Seat management
- `/api/bookings/*` - Booking operations
- `/api/test/*` - Testing endpoints

## 🔄 Deployment Process

### Automatic Deployment:
1. Push to GitHub repository
2. Connect Vercel to your GitHub repo
3. Automatic deployment on every push to main branch

### Manual Deployment:
```bash
vercel --prod
```

## 🧪 Testing Deployment

### Health Check:
- `GET /api/health` - Should return `{"status": "ok"}`

### Frontend:
- Root URL (`/`) - Should load the React application

## 📝 Important Notes

### MongoDB Setup:
1. Create a free MongoDB Atlas account
2. Create a cluster
3. Get your connection string
4. Add to Vercel environment variables

### CORS Configuration:
- CORS is configured for both development and production
- Production origin is set to your Vercel URL

### Socket.io Limitations:
- Socket.io may have limitations in serverless environment
- Consider using WebSockets alternatives if needed

## 🐛 Troubleshooting

### Common Issues:
1. **Build Failures**: Check `vercel.json` configuration
2. **Database Connection**: Verify MongoDB URI in environment variables
3. **CORS Errors**: Check origin configuration in `api/index.js`
4. **Static Files**: Ensure client build is properly configured

### Debug Commands:
```bash
vercel logs              # View deployment logs
vercel env list          # List environment variables
vercel inspect           # Inspect deployment
```

## 📊 Monitoring

### Vercel Analytics:
- Built-in analytics available in Vercel dashboard
- Monitor performance and usage

### Custom Monitoring:
- Add custom logging to your API endpoints
- Use Vercel's log viewer for debugging

## 🔄 Updates and Maintenance

### Updating:
1. Make changes to your code
2. Commit to Git
3. Push to trigger automatic deployment
   OR
4. Run `vercel --prod` for manual deployment

### Rollback:
```bash
vercel rollback [deployment-url]
```

## 📞 Support

- Vercel Documentation: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Campus Desk Repository: Check your GitHub repo
