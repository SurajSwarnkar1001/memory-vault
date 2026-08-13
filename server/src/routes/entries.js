import express from 'express';
import mongoose from 'mongoose';
import Entry from '../models/Entry.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { 
  getUploadPresignedUrl, 
  getDownloadPresignedUrl, 
  deleteFileFromR2 
} from '../utils/s3.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// @route   GET /api/projects/:id/entries
// @desc    Get entries for a specific project with filtering and search options
router.get('/:id/entries', async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    // Verify project belongs to user
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Build filter query
    const filter = { projectId, userId };

    const { type, tag, from, to, search } = req.query;

    if (type) {
      filter.type = type;
    }

    if (tag) {
      filter.tags = tag; // MongoDB matches elements in array automatically
    }

    // Date range filter
    if (from || to) {
      filter.entryDate = {};
      if (from) {
        filter.entryDate.$gte = new Date(from);
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.entryDate.$lte = toDate;
      }
    }

    // Search query
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      filter.$or = [
        { title: searchRegex },
        { textContent: searchRegex },
        { fileName: searchRegex }
      ];
    }

    const entries = await Entry.find(filter).sort({ entryDate: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Fetch entries error:', error);
    res.status(500).json({ message: 'Error retrieving entries' });
  }
});

// @route   POST /api/projects/:id/entries
// @desc    Create a simple text or link entry (no file upload)
router.post('/:id/entries', async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { type, title, textContent, tags, entryDate } = req.body;

    if (!type || !['text', 'link'].includes(type)) {
      return res.status(400).json({ message: 'Valid entry type (text or link) is required' });
    }

    if (!textContent) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Verify project ownership
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const newEntry = new Entry({
      projectId,
      userId,
      type,
      title: title || '',
      textContent,
      tags: Array.isArray(tags) ? tags.map(t => t.trim().toLowerCase()).filter(Boolean) : [],
      entryDate: entryDate ? new Date(entryDate) : new Date(),
    });

    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ message: 'Error creating entry' });
  }
});

// @route   POST /api/projects/:id/entries/upload-url
// @desc    Request a presigned PUT URL for media upload to Cloudflare R2
router.post('/:id/entries/upload-url', async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { fileName, mimeType } = req.body;

    if (!fileName || !mimeType) {
      return res.status(400).json({ message: 'Filename and mime type are required' });
    }

    // Verify project ownership
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Fetch user details to get the name for a readable folder structure
    const userObj = await User.findById(userId);
    const userNameClean = userObj ? userObj.name.replace(/[^a-zA-Z0-9_-]/g, '_') : userId.toString();
    const projectNameClean = project.name.replace(/[^a-zA-Z0-9_-]/g, '_');

    // Generate unique R2 object key: userName/projectName/timestamp_random_fileName
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const fileKey = `${userNameClean}/${projectNameClean}/${fileId}_${cleanFileName}`;

    // Get presigned PUT URL from S3 helper
    const uploadUrl = await getUploadPresignedUrl(fileKey, mimeType);

    res.json({
      uploadUrl,
      fileKey,
    });
  } catch (error) {
    console.error('Generate presigned URL error:', error);
    res.status(500).json({ message: 'Error generating upload URL' });
  }
});

// @route   POST /api/projects/:id/entries/confirm-upload
// @desc    Save timeline entry details after R2 upload completes
router.post('/:id/entries/confirm-upload', async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { 
      type, 
      title, 
      tags, 
      entryDate,
      fileKey, 
      fileName, 
      fileSize, 
      mimeType 
    } = req.body;

    if (!type || !['voice', 'audio', 'video', 'image'].includes(type)) {
      return res.status(400).json({ message: 'Valid media type is required' });
    }

    if (!fileKey || !fileName) {
      return res.status(400).json({ message: 'Upload details are missing' });
    }

    // Verify project ownership
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const newEntry = new Entry({
      projectId,
      userId,
      type,
      title: title || '',
      fileKey,
      fileName,
      fileSize,
      mimeType,
      tags: Array.isArray(tags) ? tags.map(t => t.trim().toLowerCase()).filter(Boolean) : [],
      entryDate: entryDate ? new Date(entryDate) : new Date(),
    });

    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    console.error('Confirm upload error:', error);
    res.status(500).json({ message: 'Error saving entry record' });
  }
});

// NOTE: The following routes operate directly on entries and are mounted at /api/entries

// @route   GET /api/entries/:id/view-url
// @desc    Generate a temporary presigned GET URL to view/download private files
router.get('/entries/:id/view-url', async (req, res) => {
  try {
    const entryId = req.params.id;
    const userId = req.user.id;

    const entry = await Entry.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    if (!entry.fileKey) {
      return res.status(400).json({ message: 'This entry does not contain a file' });
    }

    const downloadUrl = await getDownloadPresignedUrl(entry.fileKey);
    res.json({ url: downloadUrl });
  } catch (error) {
    console.error('Generate view URL error:', error);
    res.status(500).json({ message: 'Error generating view URL' });
  }
});

// @route   PATCH /api/entries/:id
// @desc    Update metadata of an entry
router.patch('/entries/:id', async (req, res) => {
  try {
    const entryId = req.params.id;
    const userId = req.user.id;
    const { title, textContent, tags, entryDate } = req.body;

    const entry = await Entry.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    if (title !== undefined) entry.title = title;
    if (textContent !== undefined) entry.textContent = textContent;
    if (entryDate !== undefined) entry.entryDate = new Date(entryDate);
    if (tags !== undefined) {
      entry.tags = Array.isArray(tags) ? tags.map(t => t.trim().toLowerCase()).filter(Boolean) : [];
    }

    const updatedEntry = await entry.save();
    res.json(updatedEntry);
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ message: 'Error updating entry' });
  }
});

// @route   DELETE /api/entries/:id
// @desc    Delete an entry and its R2 file if it exists
router.delete('/entries/:id', async (req, res) => {
  try {
    const entryId = req.params.id;
    const userId = req.user.id;

    const entry = await Entry.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Delete file from Cloudflare R2 if it exists
    if (entry.fileKey) {
      try {
        await deleteFileFromR2(entry.fileKey);
      } catch (r2Error) {
        console.error(`Failed to delete file ${entry.fileKey} from R2:`, r2Error);
        // Continue deleting database record even if R2 cleanup fails
      }
    }

    await Entry.deleteOne({ _id: entryId });
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ message: 'Error deleting entry' });
  }
});

export default router;
