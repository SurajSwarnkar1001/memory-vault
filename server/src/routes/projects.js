import express from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Entry from '../models/Entry.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth protection middleware to all project routes
router.use(protect);

// @route   GET /api/projects
// @desc    Get all projects for the authenticated user, with entry count and last updated timestamp
router.get('/', async (req, res) => {
  try {
    const userIdObj = new mongoose.Types.ObjectId(req.user.id);
    
    // Aggregation to fetch projects along with counts and last entry dates
    const projects = await Project.aggregate([
      { $match: { $or: [{ userId: userIdObj }, { members: userIdObj }] } },
      {
        $lookup: {
          from: 'entries',
          localField: '_id',
          foreignField: 'projectId',
          as: 'entries',
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          color: 1,
          archived: 1,
          createdAt: 1,
          updatedAt: 1,
          entryCount: { $size: '$entries' },
          lastUpdated: { 
            $cond: {
              if: { $gt: [{ $size: '$entries' }, 0] },
              then: { $max: '$entries.entryDate' },
              else: '$updatedAt'
            }
          },
        },
      },
      { $sort: { updatedAt: -1 } },
    ]);

    res.json(projects);
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ message: 'Error retrieving projects' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
router.post('/', async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const newProject = new Project({
      userId: req.user.id,
      name,
      description: description || '',
      color: color || '#3b82f6',
    });

    const savedProject = await newProject.save();
    
    // Return format matching the list project items structure
    res.status(201).json({
      ...savedProject.toObject(),
      entryCount: 0,
      lastUpdated: savedProject.updatedAt,
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Error creating project' });
  }
});

// @route   PATCH /api/projects/:id
// @desc    Update an existing project
router.patch('/:id', async (req, res) => {
  try {
    const { name, description, color, archived } = req.body;
    
    let project = await Project.findOne({ 
      _id: req.params.id, 
      $or: [{ userId: req.user.id }, { members: req.user.id }] 
    });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (color !== undefined) project.color = color;
    if (archived !== undefined) project.archived = archived;

    const updatedProject = await project.save();
    
    // Fetch counts to return consistent response
    const entryCount = await Entry.countDocuments({ projectId: project._id });
    const lastEntry = await Entry.findOne({ projectId: project._id }).sort({ entryDate: -1 });
    
    res.json({
      ...updatedProject.toObject(),
      entryCount,
      lastUpdated: lastEntry ? lastEntry.entryDate : updatedProject.updatedAt,
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Error updating project' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project and all associated entries
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete associated entries as well
    await Entry.deleteMany({ projectId: req.params.id });

    res.json({ message: 'Project and all associated entries deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
});

export default router;
