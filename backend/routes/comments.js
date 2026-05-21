const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const { protect } = require('../middleware/auth');

// ─── GET ALL COMMENTS FOR AN ISSUE ──────────
// GET /api/comments/issue/:issueId
router.get('/issue/:issueId', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: {
        issue_id: req.params.issueId,
        is_deleted: false,
      },
      order: [['createdAt', 'ASC']],
    });

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ─── ADD COMMENT ────────────────────────────
// POST /api/comments
router.post('/', protect, async (req, res) => {
  try {
    const { issue_id, content } = req.body;

    if (!issue_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Issue ID and content are required',
      });
    }

    // Check issue exists
    const issue = await Issue.findByPk(issue_id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Create comment
    const comment = await Comment.create({
      issue_id,
      content,
      author_id: req.user.id,
      author_name: req.user.name,
      author_role: req.user.role,
      is_official: ['admin', 'moderator'].includes(req.user.role),
    });

    // Increase comment count on issue
    await issue.update({
      comment_count: issue.comment_count + 1,
    });

    res.status(201).json({
      success: true,
      message: 'Comment added!',
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ─── DELETE COMMENT ─────────────────────────
// DELETE /api/comments/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Only author or admin can delete
    const isAuthor = comment.author_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    // Soft delete
    await comment.update({
      is_deleted: true,
      content: '[deleted]',
    });

    res.json({
      success: true,
      message: 'Comment deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;