-- schema.sql
-- This file sets up our MySQL database and tables for the analytics project

-- Make the database if it doesn’t already exist
CREATE DATABASE IF NOT EXISTS analytics
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Switch to the analytics database
USE analytics;

-- Sessions table: this just keeps track of each unique session id we see
CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Static logs: store one-time info like user agent, language, screen size, etc.
-- saves the whole thing as JSON to keep it flexible
CREATE TABLE IF NOT EXISTS static_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(64) NOT NULL,
  payload JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Performance logs: timing info for page loads
-- breaks out page_path separately so we can filter by it easily
CREATE TABLE IF NOT EXISTS performance_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(64) NOT NULL,
  page_path VARCHAR(512) NULL,
  payload JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_session_id (session_id),
  KEY idx_page_path (page_path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Activity logs: continuous events like clicks, scrolls, errors, etc.
-- keeps type and timestamp as their own columns for quick queries
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(64) NOT NULL,
  type VARCHAR(64) NULL,
  ts BIGINT NULL, -- timestamp in ms since epoch
  payload JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_session_id (session_id),
  KEY idx_type (type),
  KEY idx_ts (ts)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
