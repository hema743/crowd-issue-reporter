const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  issue_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  author_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  author_role: {
    type: DataTypes.STRING(20),
    defaultValue: 'citizen',
  },
  is_official: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'comments',
  timestamps: true,
});

module.exports = Comment;