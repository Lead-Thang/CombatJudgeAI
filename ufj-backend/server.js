// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Firebase Admin Initialization
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Update path if needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const verifyIdToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Authentication failed');
  }
};

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

// Set up storage engine for Multer
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid overwriting
  }
});

// Initialize upload variable with config
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 1024 * 5 }, // 5GB max size
}).single('fightVideo');

// Ensure uploads directory exists
const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// POST route for video analysis
app.post('/analyze', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    await verifyIdToken(idToken);
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }

  // Handle video upload
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    console.log(`Video saved at: ${filePath}`);

    // Call Python script for video analysis
    const pythonProcess = spawn('python', ['video_analysis.py', filePath]);

    let result = '';
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const analysisResult = JSON.parse(result);
          res.json(analysisResult);
        } catch (error) {
          res.status(500).json({ error: 'Failed to parse analysis result' });
        }
      } else {
        res.status(500).json({ error: 'Video analysis failed' });
      }
    });

    pythonProcess.on('error', (error) => {
      res.status(500).json({ error: 'Error executing video analysis script' });
    });
  });
});

// Simple GET route
app.get('/', (req, res) => {
  res.json({ message: 'UFC Fight Judge API is running' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});