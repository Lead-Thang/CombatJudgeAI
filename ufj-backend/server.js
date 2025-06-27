require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const winston = require('winston');
const admin = require('firebase-admin');

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const verifyIdToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    logger.info('Successfully verified token');
    return decodedToken;
  } catch (error) {
    logger.error('Authentication failed', { error: error.message });
    throw new Error('Authentication failed');
  }
};

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5GB max size
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Not a video! Please upload a video file.'));
    }
  },
}).single('fightVideo');

// Middleware to handle errors
const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
};
app.use(errorHandler);

// POST route for video analysis
app.post('/analyze', async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Unauthorized access attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    await verifyIdToken(idToken);
  } catch (err) {
    logger.error('Forbidden: Invalid token', { error: err.message });
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }

  upload(req, res, async (err) => {
    if (err) {
      logger.error('File upload error', { error: err.message });
      return res.status(500).json({ error: err.message });
    }

    if (!req.file) {
      logger.warn('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    logger.info(`Video saved at: ${filePath}`);

    // Call Python script for video analysis
    const pythonProcess = spawn('python', ['video_analysis.py', filePath]);

    let result = '';
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      logger.error(`Python script error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          logger.error('Failed to delete uploaded file', { error: err.message });
        } else {
          logger.info(`Deleted uploaded file: ${filePath}`);
        }
      });

      if (code !== 0) {
        logger.error('Video analysis failed');
        return res.status(500).json({ error: 'Video analysis failed' });
      }

      try {
        const analysisResult = JSON.parse(result);
        res.json(analysisResult);
      } catch (error) {
        logger.error('Failed to parse analysis result', { error: error.message });
        res.status(500).json({ error: 'Failed to parse analysis result' });
      }
    });

    pythonProcess.on('error', (error) => {
      logger.error('Error executing video analysis script', { error: error.message });
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
  logger.info(`Server running on http://localhost:${PORT}`);
});
