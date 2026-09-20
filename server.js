const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/**
 * Read search history from db.json file database
 */
function readHistory() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]), 'utf8');
    return [];
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

/**
 * Save search history to db.json file database
 */
function writeHistory(history) {
  fs.writeFileSync(DB_FILE, JSON.stringify(history, null, 2), 'utf8');
}

// API Endpoints

// GET /api/history - Retrieve recent weather search history
app.get('/api/history', (req, res) => {
  const history = readHistory();
  res.json({ success: true, history: history.slice(0, 5) });
});

// POST /api/history - Save new weather search item to database
app.post('/api/history', (req, res) => {
  const { city, temp, time } = req.body;

  if (!city || !temp) {
    return res.status(400).json({ success: false, message: 'City and Temp are required' });
  }

  let history = readHistory();

  // Remove existing entry for same city to prevent duplicate entries
  history = history.filter(item => item.city.toLowerCase() !== city.toLowerCase());

  // Insert new search item at the start
  const newEntry = {
    city,
    temp,
    time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  history.unshift(newEntry);

  // Keep top 5 searches
  if (history.length > 5) {
    history = history.slice(0, 5);
  }

  writeHistory(history);
  res.json({ success: true, history });
});

// DELETE /api/history - Clear database search history
app.delete('/api/history', (req, res) => {
  writeHistory([]);
  res.json({ success: true, message: 'History cleared successfully' });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🌤️ Weather App Server running at http://localhost:${PORT}`);
});
