const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { Op } = require('sequelize');

// ─── GET ALL ISSUES ─────────────────────────
// GET /api/issues
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      severity,
      search,
      sort = 'createdAt',
    } = req.query;

    // Build filter
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (severity) where.severity = severity;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Issue.findAndCountAll({
      where,
      order: [
        sort === 'votes'
          ? ['upvote_count', 'DESC']
          : ['createdAt', 'DESC'],
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ─── GET SINGLE ISSUE ───────────────────────
// GET /api/issues/:id
// GET single issue
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Increase view count only once using increment
    await Issue.increment('views', { 
      by: 1, 
      where: { id: req.params.id } 
    });

    // Fetch fresh issue after increment
    const updatedIssue = await Issue.findByPk(req.params.id);

    // Increase view count
    await issue.update({ views: issue.views + 1 });

   res.json({ success: true, data: updatedIssue });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ─── CREATE ISSUE ───────────────────────────
// POST /api/issues
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      severity,
      location,
      city,
      is_anonymous,
    } = req.body;

    // Check required fields
    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields',
      });
    }

    // Image URL if uploaded
    const image_url = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const issue = await Issue.create({
      title,
      description,
      category,
      severity: severity || 'medium',
      location,
      city: city || '',
      image_url,
      reported_by: req.user.id,
      reporter_name:
        is_anonymous === 'true' ? 'Anonymous' : req.user.name,
      is_anonymous: is_anonymous === 'true',
    });

    // Increase user's reported count
    await req.user.update({
      issues_reported: req.user.issues_reported + 1,
    });

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully!',
      data: issue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ─── UPDATE ISSUE STATUS ────────────────────
// PUT /api/issues/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Only admin/moderator or the reporter can update
    const isOwner = issue.reported_by === req.user.id;
    const isAdmin = ['admin', 'moderator'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this issue',
      });
    }

    const { title, description, status, severity } = req.body;
    await issue.update({ title, description, status, severity });

    res.json({
      success: true,
      message: 'Issue updated!',
      data: issue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ─── UPVOTE ISSUE ───────────────────────────
// POST /api/issues/:id/vote
router.post('/:id/vote', protect, async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    await issue.update({
      upvote_count: issue.upvote_count + 1,
    });

    res.json({
      success: true,
      message: 'Upvoted!',
      upvote_count: issue.upvote_count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ─── DELETE ISSUE ───────────────────────────
// DELETE /api/issues/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    const isOwner = issue.reported_by === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this issue',
      });
    }

    await issue.destroy();

    res.json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;