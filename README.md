# Jayid Botamed Health Care - Backend Migration Guide

## 🚀 Migration from Flask (Python) to Express.js (Node.js)

This guide will help you migrate your backend from Python Flask to Node.js Express.

---

## 📁 Project Structure

```
jayid-botamed/
├── server.js              # Main Express server
├── package.json           # Node.js dependencies
├── .env                   # Environment variables (create this)
├── .env.example          # Environment template
├── .gitignore            # Git ignore file
├── templates/
│   └── home.html         # Your HTML file (moved from root)
└── static/
    ├── style.css         # Your CSS
    ├── script.js         # Your JavaScript
    ├── heartbeat.png     # Your images
    └── health.jpg
```

---

## 🔧 Setup Instructions

### Step 1: Remove Python Dependencies

```bash
# Remove Flask and Python virtual environment
rm -rf venv/
rm requirements.txt
```

### Step 2: Initialize Node.js Project

```bash
# Install Node.js dependencies
npm install

# Or if you prefer yarn
yarn install
```

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` with your credentials:
```env
NODE_ENV=development
PORT=5000

# Gmail credentials
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-gmail-app-password
RECEIVER_EMAIL=receiver@gmail.com

# Production frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com
```

**Important:** For Gmail, you need to use an **App Password**, not your regular password:
1. Go to https://myaccount.google.com/apppasswords
2. Generate a new App Password for "Mail"
3. Use that 16-character password in `.env`

### Step 4: Organize Your Files

Move your HTML file to the templates folder:
```bash
mkdir -p templates
mv index.html templates/home.html
```

Your static files should already be in the `static/` folder.

---

## 🏃 Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
# or
npm run prod
```

The server will run on `http://localhost:5000`

---

## 🔍 Testing the Setup

### 1. Check Server Health
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "environment": "development",
  "emailConfigured": true
}
```

### 2. Test Contact Form
Open your browser and go to `http://localhost:5000`

Fill out the contact form and submit. Check the console logs for:
- ✅ Contact endpoint hit!
- 📧 Attempting to send email...
- ✅ Email sent successfully!

---

## 🌐 Deployment Options

### Option 1: Traditional VPS (DigitalOcean, Linode, AWS EC2)

1. **Install Node.js on server:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Clone your repository:**
```bash
git clone your-repo-url
cd jayid-botamed
```

3. **Install dependencies:**
```bash
npm install --production
```

4. **Set environment variables:**
```bash
nano .env
# Add your production credentials
```

5. **Use PM2 for process management:**
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the server
pm2 start server.js --name jayid-botamed

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

6. **Setup Nginx reverse proxy:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Heroku

1. **Create `Procfile`:**
```
web: node server.js
```

2. **Deploy:**
```bash
heroku create jayid-botamed
heroku config:set NODE_ENV=production
heroku config:set SENDER_EMAIL=your-email@gmail.com
heroku config:set SENDER_PASSWORD=your-app-password
heroku config:set RECEIVER_EMAIL=receiver@gmail.com
git push heroku main
```

### Option 3: Vercel

1. **Create `vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

2. **Deploy:**
```bash
npm i -g vercel
vercel
```

### Option 4: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

---

## 🔐 Security Checklist

- [ ] Never commit `.env` file to Git
- [ ] Use Gmail App Password, not regular password
- [ ] Set `NODE_ENV=production` in production
- [ ] Use HTTPS in production (Let's Encrypt)
- [ ] Keep dependencies updated: `npm audit fix`
- [ ] Set appropriate CORS origins in production
- [ ] Use environment-specific configurations

---

## 📊 Comparison: Flask vs Express.js

| Feature             | Flask (Python) | Express.js (Node.js)      |
| ------------------- | -------------- | ------------------------- |
| **Language**        | Python         | JavaScript                |
| **Speed**           | Moderate       | Fast (event-driven)       |
| **Async**           | asyncio        | Native async/await        |
| **Package Manager** | pip            | npm/yarn                  |
| **Process Manager** | gunicorn       | PM2                       |
| **Email Library**   | smtplib        | nodemailer                |
| **Templating**      | Jinja2         | Not needed (static files) |

---

## 🐛 Troubleshooting

### Email Not Sending
1. Check Gmail App Password is correct
2. Enable "Less secure app access" (if using old Gmail accounts)
3. Check server logs: `pm2 logs jayid-botamed`
4. Test with: `node -e "require('nodemailer').createTransport({...}).verify()"`

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### CORS Errors
- Check `FRONTEND_URL` in `.env`
- Ensure your frontend is making requests to the correct API URL

### Static Files Not Loading
- Verify files are in `static/` directory
- Check file paths in HTML: `/static/style.css`
- Ensure server is serving static files correctly

---

## 📝 API Endpoints

| Method | Endpoint       | Description                      |
| ------ | -------------- | -------------------------------- |
| GET    | `/`            | Serves home.html                 |
| POST   | `/api/contact` | Handles contact form submissions |
| GET    | `/api/health`  | Health check endpoint            |

---

## 🎯 Next Steps

1. ✅ Migrate backend to Node.js
2. ✅ Test locally in development
3. ✅ Deploy to production server
4. ✅ Setup SSL certificate
5. ✅ Configure domain name
6. ✅ Monitor with PM2
7. ✅ Setup automated backups

---

## 📞 Support

If you encounter any issues during migration, check:
- Server logs: `pm2 logs` or check console
- Node.js version: `node --version` (should be >=14)
- Environment variables: ensure all are set correctly

---

## 📄 License

All rights reserved © 2025 Jayid Botamed Health Care