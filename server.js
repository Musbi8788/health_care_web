const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();

// CRITICAL: Middleware MUST be before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration - Allow all origins in development
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

// Environment variables
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_PASSWORD = process.env.SENDER_PASSWORD;
const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL;
const PORT = process.env.PORT || 5000;

// Validate required environment variables
if (!SENDER_EMAIL || !SENDER_PASSWORD || !RECEIVER_EMAIL) {
  console.error('❌ Missing required environment variables!');
  console.error('Please set SENDER_EMAIL, SENDER_PASSWORD, and RECEIVER_EMAIL in .env file');
  console.error('Current values:');
  console.error('- SENDER_EMAIL:', SENDER_EMAIL ? '✓ Set' : '✗ Not set');
  console.error('- SENDER_PASSWORD:', SENDER_PASSWORD ? '✓ Set' : '✗ Not set');
  console.error('- RECEIVER_EMAIL:', RECEIVER_EMAIL ? '✓ Set' : '✗ Not set');
}

// Email transporter configuration
let transporter = null;
if (SENDER_EMAIL && SENDER_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SENDER_EMAIL,
      pass: SENDER_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Verify email configuration on startup
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email configuration error:', error.message);
      console.error('Please check your Gmail credentials and App Password');
    } else {
      console.log('✅ Email server is ready to send messages');
    }
  });
}

// Serve static files - BEFORE routes
// Serve static files
app.use('/static', express.static(path.join(__dirname, 'static')));

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// 404 handler for API routes
// app.use('/api/*', (req, res) => {
//   res.status(404).json({
//     error: 'API endpoint not found',
//     method: req.method,
//     path: req.originalUrl
//   });
// });

// Catch-all for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});



// API ROUTES - Must come before catch-all route

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    emailConfigured: !!(SENDER_EMAIL && SENDER_PASSWORD && RECEIVER_EMAIL)
  });
});

// Contact form endpoint - CRITICAL: This must work
app.post('/api/contact', async (req, res) => {
  console.log('✅ POST /api/contact endpoint hit!');
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  
  try {
    const { name, phone, message } = req.body;

    // Validation
    if (!name || !phone || !message) {
      console.log('❌ Validation failed: Missing fields');
      return res.status(400).json({ 
        error: 'All fields are required',
        received: { name: !!name, phone: !!phone, message: !!message }
      });
    }

    // Trim whitespace
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedPhone || !trimmedMessage) {
      console.log('❌ Validation failed: Empty fields after trimming');
      return res.status(400).json({ 
        error: 'All fields must contain valid data' 
      });
    }

    // Check if email is configured
    if (!transporter) {
      console.error('❌ Email transporter not configured');
      return res.status(500).json({ 
        error: 'Email service not configured. Please contact administrator.' 
      });
    }

    // Email configuration
    const mailOptions = {
      from: `"Jayid Botamed Contact Form" <${SENDER_EMAIL}>`,
      to: RECEIVER_EMAIL,
      replyTo: trimmedPhone,
      subject: `New Contact Form Message from ${trimmedName}`,
      text: `
New message from Jayid Botamed Health Care website:

Name: ${trimmedName}
Phone: ${trimmedPhone}

Message:
${trimmedMessage}

---
This email was sent from the contact form at Jayid Botamed Health Care website.
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2E8B57; border-bottom: 2px solid #2E8B57; padding-bottom: 10px;">
            🌿 New Contact Form Submission
          </h2>
          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Name:</strong> ${trimmedName}</p>
            <p style="margin: 10px 0;"><strong>Phone:</strong> <a href="tel:${trimmedPhone}">${trimmedPhone}</a></p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Message:</strong></p>
            <p style="margin: 10px 0; white-space: pre-wrap;">${trimmedMessage}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This email was sent from the contact form at Jayid Botamed Health Care website.
          </p>
        </div>
      `
    };

    // Send email
    console.log('📧 Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);

    res.status(200).json({ 
      message: 'Message sent successfully!' 
    });

  } catch (error) {
    console.error('❌ Error in /api/contact:', error);
    res.status(500).json({ 
      error: 'Failed to send message. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Home route - serves the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'home.html'));
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  console.log('❌ 404 - API endpoint not found:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: 'API endpoint not found',
    method: req.method,
    path: req.originalUrl
  });
});

// Catch-all route - serve home.html for any other route (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'home.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 ===============================================');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 Email: ${SENDER_EMAIL ? '✅ Configured' : '❌ Not configured'}`);
  console.log('🚀 API Endpoints:');
  console.log(`   POST http://localhost:${PORT}/api/contact`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log('🚀 ===============================================');
});