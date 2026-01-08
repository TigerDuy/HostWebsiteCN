/**
 * Script chuyển đổi MySQL dump sang PostgreSQL
 * Chạy: node convert_mysql_to_postgres.js
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'cookingdb.sql');
const outputFile = path.join(__dirname, 'cookingdb_postgres_full.sql');

console.log('📖 Đọc file MySQL dump...');
let sql = fs.readFileSync(inputFile, 'utf8');

console.log('🔄 Chuyển đổi sang PostgreSQL...');

// Schema PostgreSQL
const schema = `-- =============================================
-- CookShare Database - PostgreSQL Version (Render.com)
-- Bao gồm Schema + Dữ liệu
-- =============================================

-- Xóa các bảng cũ nếu tồn tại (theo thứ tự dependency)
DROP TABLE IF EXISTS user_broadcast_read CASCADE;
DROP TABLE IF EXISTS user_report_quota CASCADE;
DROP TABLE IF EXISTS user_theme_preferences CASCADE;
DROP TABLE IF EXISTS step_images CASCADE;
DROP TABLE IF EXISTS recipe_violation_history CASCADE;
DROP TABLE IF EXISTS recipe_views CASCADE;
DROP TABLE IF EXISTS recipe_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS favorite CASCADE;
DROP TABLE IF EXISTS danh_gia CASCADE;
DROP TABLE IF EXISTS comment_violation_history CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS broadcast_notifications CASCADE;
DROP TABLE IF EXISTS binh_luan CASCADE;
DROP TABLE IF EXISTS bao_cao CASCADE;
DROP TABLE IF EXISTS admin_hidden_recipes CASCADE;
DROP TABLE IF EXISTS cong_thuc CASCADE;
DROP TABLE IF EXISTS nguoi_dung CASCADE;

-- Xóa các ENUM types cũ
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS report_type_enum CASCADE;
DROP TYPE IF EXISTS target_type CASCADE;
DROP TYPE IF EXISTS category_type CASCADE;
DROP TYPE IF EXISTS cuisine_type CASCADE;

-- =============================================
-- TẠO ENUM TYPES
-- =============================================
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE report_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE report_type_enum AS ENUM ('user_report', 'admin_hide');
CREATE TYPE target_type AS ENUM ('recipe', 'comment', 'user');
CREATE TYPE category_type AS ENUM ('main', 'appetizer', 'dessert', 'drink', 'soup', 'salad', 'snack', 'other');
CREATE TYPE cuisine_type AS ENUM ('vietnam', 'korea', 'japan', 'china', 'thailand', 'italy', 'france', 'usa', 'other');

-- =============================================
-- BẢNG NGƯỜI DÙNG
-- =============================================
CREATE TABLE nguoi_dung (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'user',
  avatar_url VARCHAR(500),
  bio TEXT,
  is_posting_blocked BOOLEAN DEFAULT FALSE,
  posting_blocked_until TIMESTAMP DEFAULT NULL,
  is_commenting_blocked BOOLEAN DEFAULT FALSE,
  commenting_blocked_until TIMESTAMP DEFAULT NULL,
  is_reporting_blocked BOOLEAN DEFAULT FALSE,
  reporting_blocked_until TIMESTAMP DEFAULT NULL,
  monthly_post_violations INTEGER DEFAULT 0,
  monthly_comment_violations INTEGER DEFAULT 0,
  monthly_rejected_reports INTEGER DEFAULT 0,
  last_violation_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  password_reset_at TIMESTAMP DEFAULT NULL
);

-- =============================================
-- BẢNG CÔNG THỨC
-- =============================================
CREATE TABLE cong_thuc (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  ingredients TEXT NOT NULL,
  steps TEXT NOT NULL,
  cook_time VARCHAR(100) DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  servings VARCHAR(100) DEFAULT '0',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  views INTEGER DEFAULT 0,
  violation_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  hidden_at TIMESTAMP DEFAULT NULL,
  category category_type DEFAULT 'other',
  cuisine cuisine_type DEFAULT 'other'
);

-- =============================================
-- BẢNG TAGS
-- =============================================
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG RECIPE_TAGS
-- =============================================
CREATE TABLE recipe_tags (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(recipe_id, tag_id)
);

-- =============================================
-- BẢNG ADMIN ẨN BÀI VIẾT
-- =============================================
CREATE TABLE admin_hidden_recipes (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  hidden_by INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  unhidden_by INTEGER DEFAULT NULL REFERENCES nguoi_dung(id) ON DELETE SET NULL,
  unhidden_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG BÁO CÁO
-- =============================================
CREATE TABLE bao_cao (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER DEFAULT NULL,
  user_id INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status report_status DEFAULT 'pending',
  rejected_reason TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_by INTEGER DEFAULT NULL REFERENCES nguoi_dung(id) ON DELETE SET NULL,
  processed_at TIMESTAMP DEFAULT NULL,
  report_type report_type_enum DEFAULT 'user_report',
  image_url VARCHAR(500) DEFAULT NULL,
  target_type target_type DEFAULT 'recipe',
  comment_id INTEGER DEFAULT NULL,
  reported_user_id INTEGER DEFAULT NULL
);

-- =============================================
-- BẢNG BÌNH LUẬN
-- =============================================
CREATE TABLE binh_luan (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  parent_id INTEGER DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  parent_comment_id INTEGER DEFAULT NULL
);

-- =============================================
-- BẢNG THÔNG BÁO BROADCAST
-- =============================================
CREATE TABLE broadcast_notifications (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG LIKE BÌNH LUẬN
-- =============================================
CREATE TABLE comment_likes (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER NOT NULL REFERENCES binh_luan(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id)
);

-- =============================================
-- BẢNG LỊCH SỬ VI PHẠM BÌNH LUẬN
-- =============================================
CREATE TABLE comment_violation_history (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  report_id INTEGER NOT NULL,
  violated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG ĐÁNH GIÁ
-- =============================================
CREATE TABLE danh_gia (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(recipe_id, user_id)
);

-- =============================================
-- BẢNG YÊU THÍCH
-- =============================================
CREATE TABLE favorite (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, recipe_id)
);

-- =============================================
-- BẢNG THEO DÕI
-- =============================================
CREATE TABLE follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);

-- =============================================
-- BẢNG THÔNG BÁO
-- =============================================
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'system',
  message TEXT NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sender_role VARCHAR(20) DEFAULT NULL,
  metadata JSONB DEFAULT NULL
);

-- =============================================
-- BẢNG LƯỢT XEM CÔNG THỨC
-- =============================================
CREATE TABLE recipe_views (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  client_ip VARCHAR(45) NOT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG LỊCH SỬ VI PHẠM BÀI VIẾT
-- =============================================
CREATE TABLE recipe_violation_history (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  report_id INTEGER NOT NULL,
  violated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG ẢNH CÁC BƯỚC
-- =============================================
CREATE TABLE step_images (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES cong_thuc(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BẢNG QUOTA BÁO CÁO
-- =============================================
CREATE TABLE user_report_quota (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  report_type target_type NOT NULL,
  remaining_reports INTEGER DEFAULT 3,
  last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, report_type)
);

-- =============================================
-- BẢNG USER ĐÃ ĐỌC BROADCAST
-- =============================================
CREATE TABLE user_broadcast_read (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  broadcast_id INTEGER NOT NULL REFERENCES broadcast_notifications(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, broadcast_id)
);

-- =============================================
-- BẢNG USER THEME PREFERENCES
-- =============================================
CREATE TABLE user_theme_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  primary_color VARCHAR(7) DEFAULT '#ff7f50',
  background_image TEXT DEFAULT NULL,
  theme_name VARCHAR(100) DEFAULT NULL,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_cong_thuc_user_id ON cong_thuc(user_id);
CREATE INDEX idx_binh_luan_recipe_id ON binh_luan(recipe_id);
CREATE INDEX idx_favorite_recipe_id ON favorite(recipe_id);
CREATE INDEX idx_danh_gia_recipe_id ON danh_gia(recipe_id);
CREATE INDEX idx_bao_cao_status ON bao_cao(status);
CREATE INDEX idx_bao_cao_target_type ON bao_cao(target_type);
CREATE INDEX idx_notifications_receiver ON notifications(receiver_id);
CREATE INDEX idx_recipe_views_lookup ON recipe_views(recipe_id, client_ip, created_at);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_recipe_tags_recipe ON recipe_tags(recipe_id);
CREATE INDEX idx_recipe_tags_tag ON recipe_tags(tag_id);

`;

// Xác định các cột boolean cho từng bảng (theo tên cột)
const booleanColumnsByTable = {
  'nguoi_dung': ['is_posting_blocked', 'is_commenting_blocked', 'is_reporting_blocked'],
  'cong_thuc': ['is_hidden'],
  'admin_hidden_recipes': ['is_active'],
  'notifications': ['is_read'],
  'user_theme_preferences': ['is_shared']
};


// Improved parser that correctly handles parentheses inside strings
function parseInsertStatement(stmt) {
  // Extract table name and columns
  const headerMatch = stmt.match(/INSERT INTO `(\w+)`\s*\(([^)]+)\)\s*VALUES\s*/i);
  if (!headerMatch) return null;
  
  const tableName = headerMatch[1].toLowerCase();
  const columns = headerMatch[2].replace(/`/g, '').split(',').map(c => c.trim());
  
  // Get the VALUES part
  const valuesStart = stmt.indexOf('VALUES') + 6;
  let valuesStr = stmt.substring(valuesStart).trim();
  if (valuesStr.endsWith(';')) valuesStr = valuesStr.slice(0, -1);
  
  // Parse rows - track string state to ignore parentheses inside strings
  const rows = [];
  let i = 0;
  
  while (i < valuesStr.length) {
    // Skip whitespace and commas between rows
    while (i < valuesStr.length && (valuesStr[i] === ' ' || valuesStr[i] === '\n' || valuesStr[i] === '\r' || valuesStr[i] === '\t' || valuesStr[i] === ',')) {
      i++;
    }
    
    if (i >= valuesStr.length) break;
    if (valuesStr[i] !== '(') {
      i++;
      continue;
    }
    
    // Found start of a row
    let rowStart = i;
    let depth = 0;
    let inString = false;
    let stringChar = null;
    
    while (i < valuesStr.length) {
      const char = valuesStr[i];
      const prevChar = i > 0 ? valuesStr[i - 1] : '';
      
      if (!inString) {
        if (char === "'" || char === '"') {
          inString = true;
          stringChar = char;
        } else if (char === '(') {
          depth++;
        } else if (char === ')') {
          depth--;
          if (depth === 0) {
            // End of row
            rows.push(valuesStr.substring(rowStart, i + 1));
            i++;
            break;
          }
        }
      } else {
        // Inside string
        if (char === stringChar && prevChar !== '\\') {
          // Check for escaped quote ''
          if (i + 1 < valuesStr.length && valuesStr[i + 1] === stringChar) {
            i++; // Skip the escaped quote
          } else {
            inString = false;
            stringChar = null;
          }
        }
      }
      i++;
    }
  }
  
  return { tableName, columns, rows };
}

// Parse values from a single row string like "(1, 'text', NULL)"
function parseRowValues(rowStr) {
  // Remove outer parentheses
  let inner = rowStr.trim();
  if (inner.startsWith('(')) inner = inner.slice(1);
  if (inner.endsWith(')')) inner = inner.slice(0, -1);
  
  const values = [];
  let current = '';
  let inString = false;
  let stringChar = null;
  
  for (let i = 0; i < inner.length; i++) {
    const char = inner[i];
    const prevChar = i > 0 ? inner[i - 1] : '';
    
    if (!inString) {
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
        current += char;
      } else if (char === ',') {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    } else {
      current += char;
      if (char === stringChar && prevChar !== '\\') {
        // Check for escaped quote ''
        if (i + 1 < inner.length && inner[i + 1] === stringChar) {
          current += inner[i + 1];
          i++; // Skip the escaped quote
        } else {
          inString = false;
          stringChar = null;
        }
      }
    }
  }
  
  if (current.trim()) {
    values.push(current.trim());
  }
  
  return values;
}

// Convert a single value for PostgreSQL
function convertValue(val, isBoolean) {
  if (val === 'NULL' || val === 'null') return 'NULL';
  
  // Handle boolean conversion
  if (isBoolean) {
    if (val === '0') return 'FALSE';
    if (val === '1') return 'TRUE';
  }
  
  // Handle string values
  if (val.startsWith("'") && val.endsWith("'")) {
    let str = val.slice(1, -1);
    // Convert MySQL escapes to PostgreSQL
    str = str.replace(/\\r\\n/g, ' ');
    str = str.replace(/\\r/g, ' ');
    str = str.replace(/\\n/g, ' ');
    str = str.replace(/\\'/g, "''");
    str = str.replace(/\\"/g, '"');
    str = str.replace(/\\\\/g, '\\');
    return "'" + str + "'";
  }
  
  return val;
}

// Find all INSERT statements - handle multi-line statements
const insertStatements = [];
let currentStmt = '';
let inInsert = false;

const lines = sql.split('\n');
for (const line of lines) {
  if (line.match(/^INSERT INTO `/i)) {
    inInsert = true;
    currentStmt = line;
  } else if (inInsert) {
    currentStmt += '\n' + line;
  }
  
  if (inInsert && line.trim().endsWith(';')) {
    insertStatements.push(currentStmt);
    currentStmt = '';
    inInsert = false;
  }
}

console.log(`📊 Tìm thấy ${insertStatements.length} INSERT statements`);

// Table order for dependencies
const tableOrder = [
  'nguoi_dung', 'cong_thuc', 'tags', 'recipe_tags', 'admin_hidden_recipes',
  'bao_cao', 'binh_luan', 'broadcast_notifications', 'comment_likes',
  'comment_violation_history', 'danh_gia', 'favorite', 'follow', 'follows',
  'notifications', 'recipe_views', 'recipe_violation_history', 'step_images',
  'user_report_quota', 'user_broadcast_read', 'user_theme_preferences'
];

// Sort inserts by table order
const sortedInserts = [];
for (const table of tableOrder) {
  for (const stmt of insertStatements) {
    const tableMatch = stmt.match(/INSERT INTO `(\w+)`/i);
    if (tableMatch && tableMatch[1].toLowerCase() === table) {
      sortedInserts.push(stmt);
    }
  }
}

// Add any remaining inserts
for (const stmt of insertStatements) {
  const tableMatch = stmt.match(/INSERT INTO `(\w+)`/i);
  if (tableMatch && !tableOrder.includes(tableMatch[1].toLowerCase())) {
    sortedInserts.push(stmt);
  }
}

// Convert each INSERT statement
let output = schema + '\n-- =============================================\n-- DỮ LIỆU\n-- =============================================\n\n';

let convertedCount = 0;

for (const stmt of sortedInserts) {
  const parsed = parseInsertStatement(stmt);
  if (!parsed || parsed.rows.length === 0) continue;
  
  let tableName = parsed.tableName;
  const columns = parsed.columns;
  
  // Rename follow to follows
  if (tableName === 'follow') tableName = 'follows';
  
  // Find boolean column indices
  const boolCols = booleanColumnsByTable[tableName] || [];
  const boolIndices = columns.map((col, idx) => boolCols.includes(col) ? idx : -1).filter(i => i >= 0);
  
  // Convert each row
  const convertedRows = [];
  
  for (const row of parsed.rows) {
    const values = parseRowValues(row);
    
    // Validate row - first value should be a number (id)
    if (values.length > 0 && !/^\d+$/.test(values[0].trim())) {
      console.log(`⚠️ Skipping invalid row in ${tableName}: ${row.substring(0, 50)}...`);
      continue;
    }
    
    const convertedValues = values.map((val, idx) => {
      return convertValue(val, boolIndices.includes(idx));
    });
    
    convertedRows.push('(' + convertedValues.join(', ') + ')');
  }
  
  if (convertedRows.length > 0) {
    output += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n${convertedRows.join(',\n')};\n\n`;
    convertedCount++;
  }
}

// Add sequence resets
output += `
-- =============================================
-- RESET SEQUENCES
-- =============================================
SELECT setval('nguoi_dung_id_seq', COALESCE((SELECT MAX(id) FROM nguoi_dung), 1));
SELECT setval('cong_thuc_id_seq', COALESCE((SELECT MAX(id) FROM cong_thuc), 1));
SELECT setval('tags_id_seq', COALESCE((SELECT MAX(id) FROM tags), 1));
SELECT setval('recipe_tags_id_seq', COALESCE((SELECT MAX(id) FROM recipe_tags), 1));
SELECT setval('admin_hidden_recipes_id_seq', COALESCE((SELECT MAX(id) FROM admin_hidden_recipes), 1));
SELECT setval('bao_cao_id_seq', COALESCE((SELECT MAX(id) FROM bao_cao), 1));
SELECT setval('binh_luan_id_seq', COALESCE((SELECT MAX(id) FROM binh_luan), 1));
SELECT setval('broadcast_notifications_id_seq', COALESCE((SELECT MAX(id) FROM broadcast_notifications), 1));
SELECT setval('comment_likes_id_seq', COALESCE((SELECT MAX(id) FROM comment_likes), 1));
SELECT setval('danh_gia_id_seq', COALESCE((SELECT MAX(id) FROM danh_gia), 1));
SELECT setval('favorite_id_seq', COALESCE((SELECT MAX(id) FROM favorite), 1));
SELECT setval('follows_id_seq', COALESCE((SELECT MAX(id) FROM follows), 1));
SELECT setval('notifications_id_seq', COALESCE((SELECT MAX(id) FROM notifications), 1));
SELECT setval('recipe_views_id_seq', COALESCE((SELECT MAX(id) FROM recipe_views), 1));
SELECT setval('step_images_id_seq', COALESCE((SELECT MAX(id) FROM step_images), 1));
SELECT setval('user_report_quota_id_seq', COALESCE((SELECT MAX(id) FROM user_report_quota), 1));
SELECT setval('user_theme_preferences_id_seq', COALESCE((SELECT MAX(id) FROM user_theme_preferences), 1));
`;

// Post-processing: Clean up any remaining escape sequences
console.log('🧹 Cleaning up escape sequences...');
output = output.replace(/\\r\\n/g, ' ');
output = output.replace(/\\r/g, ' ');
output = output.replace(/\\n/g, ' ');

// Write file
console.log('💾 Ghi file PostgreSQL...');
fs.writeFileSync(outputFile, output, 'utf8');

console.log(`✅ Hoàn thành! File output: ${outputFile}`);
console.log(`📊 Đã chuyển đổi ${convertedCount} INSERT statements`);
