const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Lead = require('./models/Lead');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://DigiBro123:DigiBro123@cluster0.wajwxbz.mongodb.net/Quantum?retryWrites=true&w=majority&appName=Cluster0';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (HTML, CSS, JS, Assets)
app.use(express.static(path.join(__dirname)));

// Connect to MongoDB Atlas Database 'Quantum'
mongoose.connect(MONGODB_URI, {
  dbName: 'Quantum'
})
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas Database: Quantum (Collection: Quantum1)');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// API Routes

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Hyperstar Quantum 1 API & MongoDB Server operational',
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// 1. Create a Lead (Submit Brochure Form / Contact Form)
app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, phone, interest, message, source } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, and phone are mandatory.',
      });
    }

    const newLead = new Lead({
      name,
      email,
      phone,
      interest: interest || 'General Inquiry',
      message: message || '',
      source: source || 'brochure_modal'
    });

    const savedLead = await newLead.save();

    console.log(`📥 [NEW LEAD STORED]: ${savedLead.name} (${savedLead.phone}) - Source: ${savedLead.source}`);

    return res.status(201).json({
      success: true,
      message: 'Lead captured successfully and saved to MongoDB Quantum1 collection.',
      data: savedLead
    });
  } catch (error) {
    console.error('❌ Error saving lead to MongoDB:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit lead to database.'
    });
  }
});

// 2. Fetch all Leads (Admin API)
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch leads.'
    });
  }
});

// Catch-all route to serve index.html for single-page routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Hyperstar Quantum 1 Server running on port ${PORT}`);
});
