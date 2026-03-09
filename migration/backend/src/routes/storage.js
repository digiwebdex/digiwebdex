// Storage routes for file uploads
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate: authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure storage
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directories exist
const buckets = ['payment-proofs', 'ticket-attachments', 'reseller-logos', 'invoices', 'general'];
buckets.forEach((bucket) => {
  const dir = path.join(UPLOAD_DIR, bucket);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const bucket = req.params.bucket || 'general';
    const dir = path.join(UPLOAD_DIR, bucket);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const customPath = req.body.path;
    
    if (customPath) {
      // Use the custom path provided
      cb(null, customPath);
    } else {
      cb(null, `${uniqueSuffix}${ext}`);
    }
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});

// Upload file to bucket
router.post('/:bucket/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const bucket = req.params.bucket;
    const filePath = `${bucket}/${req.file.filename}`;

    res.json({
      success: true,
      path: filePath,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get public file
router.get('/:bucket/public/:filename', (req, res) => {
  const { bucket, filename } = req.params;
  const filePath = path.join(UPLOAD_DIR, bucket, filename);

  // Check if bucket is public
  const publicBuckets = ['reseller-logos', 'invoices'];
  if (!publicBuckets.includes(bucket)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(path.resolve(filePath));
});

// Get private file (requires auth)
router.get('/:bucket/:filename', authenticateToken, (req, res) => {
  const { bucket, filename } = req.params;
  const filePath = path.join(UPLOAD_DIR, bucket, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(path.resolve(filePath));
});

// Delete file
router.delete('/:bucket', authenticateToken, (req, res) => {
  try {
    const { bucket } = req.params;
    const paths = req.query.paths?.split(',') || [];

    let deleted = 0;
    paths.forEach((p) => {
      const filePath = path.join(UPLOAD_DIR, bucket, p);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deleted++;
      }
    });

    res.json({ success: true, deleted });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// List files in bucket (admin only)
router.get('/:bucket', authenticateToken, async (req, res) => {
  try {
    const { bucket } = req.params;
    const dir = path.join(UPLOAD_DIR, bucket);

    if (!fs.existsSync(dir)) {
      return res.json({ files: [] });
    }

    const files = fs.readdirSync(dir).map((filename) => {
      const filePath = path.join(dir, filename);
      const stats = fs.statSync(filePath);
      return {
        name: filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      };
    });

    res.json({ files });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

module.exports = router;
