
// Simple JSON-file "database". No external database server needed to get started.
// Each collection is stored as its own .json file inside /data.
// Good enough for a small business site; can be swapped for a real database later
// without changing the route files much (same read/write function names).

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

function filePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readCollection(collection) {
  const file = filePath(collection);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]', 'utf-8');
  }
  const raw = fs.readFileSync(file, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function writeCollection(collection, records) {
  const file = filePath(collection);
  fs.writeFileSync(file, JSON.stringify(records, null, 2), 'utf-8');
}

function insert(collection, record) {
  const records = readCollection(collection);
  records.push(record);
  writeCollection(collection, records);
  return record;
}

function findAll(collection) {
  return readCollection(collection);
}

function findOne(collection, predicate) {
  const records = readCollection(collection);
  return records.find(predicate);
}

function updateOne(collection, predicate, updates) {
  const records = readCollection(collection);
  const idx = records.findIndex(predicate);
  if (idx === -1) return null;
  records[idx] = { ...records[idx], ...updates };
  writeCollection(collection, records);
  return records[idx];
}

module.exports = { insert, findAll, findOne, updateOne };
