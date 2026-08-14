import express from 'express';
import crypto from 'crypto';
import Project from '../models/Project.js';
import Invitation from '../models/Invitation.js';
import { protect } from '../middleware/auth.js';
import { sendInvitationEmail } from '../utils/email.js';

const router = express.Router();

// @route   POST /api/projects/:id/invite
// @desc    Invite a user to a project via email
router.post('/:id/invite', protect, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can invite
    if (project.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can send invitations' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    
    // Expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = new Invitation({
      projectId: project._id,
      email,
      token,
      invitedBy: req.user.id,
      expiresAt,
    });

    await invitation.save();

    // The frontend origin (where the link will point)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const inviteLink = `${clientUrl}/invite/${token}`;

    const emailSent = await sendInvitationEmail(email, project.name, inviteLink);

    if (!emailSent) {
      // If email fails in dev without SMTP, we still want to log it
      console.log('--- DEVELOPMENT INVITE LINK ---');
      console.log(inviteLink);
      console.log('-------------------------------');
      return res.status(200).json({ 
        message: 'SMTP not fully configured. Invitation created. Check server console for link.',
        devLink: inviteLink 
      });
    }

    res.status(200).json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/projects/invite/:token
// @desc    Validate an invite token and get project details
// @access  Public
router.get('/invite/:token', async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ 
      token: req.params.token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('projectId', 'name');

    if (!invitation || !invitation.projectId) {
      return res.status(400).json({ message: 'Invalid or expired invitation token' });
    }

    res.status(200).json({ 
      projectName: invitation.projectId.name,
      email: invitation.email,
      invitationId: invitation._id
    });
  } catch (error) {
    console.error('Validate invite error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/projects/invite/:token/accept
// @desc    Accept an invitation (adds user to project members)
// @access  Private
router.post('/invite/:token/accept', protect, async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ 
      token: req.params.token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired invitation token' });
    }

    // Check if user's email matches the invite email? 
    // Usually a good security practice, but we'll just require them to be logged in for now.
    
    const project = await Project.findById(invitation.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project no longer exists' });
    }

    // Don't add if already owner
    if (project.userId.toString() === req.user.id) {
      return res.status(400).json({ message: 'You are already the owner of this project' });
    }

    // Don't add if already member
    if (project.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already a member of this project' });
    }

    // Add user to members and mark invite accepted
    project.members.push(req.user.id);
    await project.save();

    invitation.status = 'accepted';
    await invitation.save();

    res.status(200).json({ 
      message: 'Successfully joined the project',
      projectId: project._id 
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
