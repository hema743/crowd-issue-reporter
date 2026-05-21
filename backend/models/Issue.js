const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Issue = sequelize.define('Issue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM(
      'roads', 'water', 'electricity', 'garbage',
      'sanitation', 'parks', 'lights', 'drainage',
      'buildings', 'other'
    ),
    allowNull: false,
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM(
      'open', 'acknowledged', 'in_progress', 'resolved', 'rejected'
    ),
    defaultValue: 'open',
  },
  location: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    defaultValue: '',
  },
  image_url: {
    type: DataTypes.STRING(500),
    defaultValue: null,
  },
  upvote_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  comment_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_anonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  reported_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reporter_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'issues',
  timestamps: true,
});

module.exports = Issue;