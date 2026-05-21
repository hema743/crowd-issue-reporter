const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const User = require('../models/User');
const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

// ─── GET DASHBOARD STATS ────────────────────
// GET /api/stats
router.get('/', async (req, res) => {
  try {
    // Count totals
    const total = await Issue.count();
    const open = await Issue.count({ where: { status: 'open' } });
    const inProgress = await Issue.count({ where: { status: 'in_progress' } });
    const resolved = await Issue.count({ where: { status: 'resolved' } });
    const totalUsers = await User.count();

    // Resolution rate
    const resolutionRate = total > 0
      ? Math.round((resolved / total) * 100)
      : 0;

    // Issues by category
    const byCategory = await sequelize.query(
      `SELECT category, COUNT(*) as count 
       FROM issues 
       GROUP BY category 
       ORDER BY count DESC`,
      { type: QueryTypes.SELECT }
    );

    // Issues by severity
    const bySeverity = await sequelize.query(
      `SELECT severity, COUNT(*) as count 
       FROM issues 
       GROUP BY severity`,
      { type: QueryTypes.SELECT }
    );

    // Issues by status
    const byStatus = await sequelize.query(
      `SELECT status, COUNT(*) as count 
       FROM issues 
       GROUP BY status`,
      { type: QueryTypes.SELECT }
    );

    // Recent 7 days trend
    const recentTrend = await sequelize.query(
      `SELECT DATE(createdAt) as date, COUNT(*) as count 
       FROM issues 
       WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(createdAt) 
       ORDER BY date ASC`,
      { type: QueryTypes.SELECT }
    );

    // Top reporters
    const topReporters = await sequelize.query(
      `SELECT reporter_name, COUNT(*) as count 
       FROM issues 
       WHERE is_anonymous = false
       GROUP BY reporter_name 
       ORDER BY count DESC 
       LIMIT 5`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      success: true,
      data: {
        overview: {
          total,
          open,
          inProgress,
          resolved,
          totalUsers,
          resolutionRate,
        },
        byCategory,
        bySeverity,
        byStatus,
        recentTrend,
        topReporters,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;