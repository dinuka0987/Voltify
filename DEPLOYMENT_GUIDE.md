# 🚀 Deployment Guide - EV Parking System

## Overview

This guide covers deploying both backend and frontend to production environments.

---

## Backend Deployment

### Option 1: Deploy to Heroku

#### Prerequisites

- Heroku account (free tier available)
- Heroku CLI installed
- Git installed

#### Steps

1. **Create Heroku App**

```bash
cd Backend
heroku login
heroku create your-app-name
```

2. **Create Procfile**
   Create `Backend/Procfile`:

```
web: node server.js
```

3. **Set Environment Variables**

```bash
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
```

4. **Deploy**

```bash
git push heroku main
```

5. **View Logs**

```bash
heroku logs --tail
```

#### Heroku Deployment URL

Your backend will be at: `https://your-app-name.herokuapp.com`

---

### Option 2: Deploy to Render.com

#### Steps

1. Connect your GitHub repository
2. Create new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy!

---

### Option 3: Deploy to Railway

1. Go to railway.app
2. Create new project
3. Connect GitHub
4. Select Backend folder
5. Add MongoDB connection
6. Deploy!

---

## Frontend Deployment

### Option 1: Deploy to Vercel (Recommended)

#### Prerequisites

- Vercel account (free)
- GitHub repository

#### Steps

1. **Push code to GitHub**

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Go to Vercel.com**

- Click "New Project"
- Import your GitHub repository
- Select Frontend directory
- Add environment variables

3. **Add Environment Variables on Vercel**

```
REACT_APP_API_URL=https://your-backend.herokuapp.com/api
REACT_APP_SOCKET_URL=https://your-backend.herokuapp.com
```

4. **Deploy**

```bash
# Or deploy from CLI
npm i -g vercel
cd Frontend
vercel --prod
```

#### Vercel Deployment URL

Your frontend will be at: `https://your-project.vercel.app`

---

### Option 2: Deploy to Netlify

1. Build frontend locally

```bash
cd Frontend
npm run build
```

2. Go to Netlify.com
3. Drag & drop the build folder
4. Add environment variables
5. Set up custom domain if needed

---

### Option 3: Deploy to GitHub Pages

```bash
cd Frontend
npm run build
# Deploy build folder to GitHub Pages
```

---

## Database Deployment

### MongoDB Atlas (Recommended - Free Tier)

1. Go to mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Create database user
5. Get connection string
6. Add to MONGO_URI

Example:

```
mongodb+srv://username:password@cluster0.mongodb.net/ev_parking
```

---

## Full Production Setup

### Architecture

```
Client (Vercel)
    ↓ HTTPS
API Server (Heroku/Render)
    ↓ Secure
Database (MongoDB Atlas)
```

### Environment Variables

#### Backend Production (.env)

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ev_parking
JWT_SECRET=a_very_long_random_secret_key_minimum_32_characters
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

#### Frontend Production (.env)

```env
REACT_APP_API_URL=https://your-backend-api.com/api
REACT_APP_SOCKET_URL=https://your-backend-api.com
```

---

## Post-Deployment Checklist

- [ ] Test all user flows
- [ ] Test all admin functions
- [ ] Check console for errors
- [ ] Verify database connection
- [ ] Test authentication flow
- [ ] Check CORS configuration
- [ ] Monitor error logs
- [ ] Setup alerts/monitoring
- [ ] Backup database regularly
- [ ] Review security settings

---

## Troubleshooting Deployment

### Backend Issues

**"Cannot connect to MongoDB"**

- Verify MongoDB URI in Heroku config vars
- Check IP whitelist in MongoDB Atlas
- Ensure database user exists

**"Port not defined"**

- Heroku assigns PORT automatically
- Remove hardcoded port from server.js

**"Build failed"**

- Check error logs
- Ensure all dependencies in package.json
- Verify Node.js version compatibility

### Frontend Issues

**"Cannot connect to API"**

- Check REACT_APP_API_URL
- Verify backend is running
- Check CORS settings on backend

**"Page not found after refresh"**

- Configure Vercel/Netlify for SPA
- Add redirects to API routes

**"Static assets not loading"**

- Check PUBLIC_URL in production
- Verify asset paths

---

## Performance Optimization

### Backend

- Enable gzip compression
- Add caching headers
- Optimize database queries
- Use connection pooling

### Frontend

- Run `npm run build`
- Use lazy loading for routes
- Optimize images
- Enable service workers

---

## Security Best Practices

1. **Secrets Management**
   - Never commit .env files
   - Use platform secrets manager
   - Rotate keys regularly

2. **HTTPS**
   - All connections must be HTTPS
   - Use SSL certificates
   - Enforce HSTS

3. **Data Protection**
   - Hash passwords with bcrypt
   - Use secure JWT secrets
   - Validate all inputs
   - Sanitize outputs

4. **API Security**
   - Rate limiting
   - API authentication
   - CORS restrictions
   - Input validation

---

## Monitoring & Logging

### Heroku Monitoring

```bash
heroku logs --tail
heroku metrics
```

### Vercel Analytics

- Built-in performance monitoring
- Error tracking
- Real User Monitoring (RUM)

### Error Tracking (Optional)

- Sentry.io
- LogRocket
- BugSnag

---

## Scaling Considerations

### Database

- MongoDB Atlas auto-scaling
- Index optimization
- Connection pooling

### Backend

- Horizontal scaling (multiple dynos)
- Load balancing
- Worker processes

### Frontend

- CDN caching
- Edge caching
- Image optimization

---

## CI/CD Pipeline (Optional)

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        run: |
          git push https://heroku:${{ secrets.HEROKU_API_KEY }}@git.heroku.com/${{ secrets.HEROKU_APP_NAME }}.git main
```

---

## Useful Commands

### Heroku

```bash
heroku login                    # Login
heroku create app-name          # Create app
heroku config:set KEY=value    # Set variables
heroku logs --tail             # View logs
heroku open                    # Open app
heroku destroy                 # Delete app
```

### Vercel

```bash
vercel                         # Deploy preview
vercel --prod                  # Deploy production
vercel env ls                  # List env vars
vercel logs                    # View logs
```

---

## Cost Estimation (Free Tier)

| Service       | Free Tier        | Price      |
| ------------- | ---------------- | ---------- |
| Heroku        | 1 web dyno/month | $7/month   |
| Vercel        | Unlimited        | Free       |
| MongoDB Atlas | 512MB            | Free       |
| **Total**     |                  | $0-7/month |

---

## Emergency Procedures

### Rollback Deployment

```bash
heroku releases                # List releases
heroku rollback v123           # Rollback to version
```

### Database Emergency

```bash
# Backup database
mongodump --uri "connection-string"

# Restore database
mongorestore --uri "connection-string" dump/
```

---

## Support Resources

- Heroku: https://devcenter.heroku.com
- Vercel: https://vercel.com/docs
- MongoDB: https://docs.mongodb.com
- Express: https://expressjs.com/

---

## Final Notes

1. Start with free tier services
2. Monitor logs regularly
3. Keep dependencies updated
4. Backup data regularly
5. Test thoroughly before production
6. Document configuration changes

---

**Happy Deploying! 🚀**
