// app.js
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

// 1) Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// 2) Initialize the SQLite DB
const db = new sqlite3.Database(path.join(__dirname, 'mail-tracker.db'), (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS pixels (
        id TEXT PRIMARY KEY,
        name TEXT,
        createdAt TEXT
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pixelId TEXT,
        time TEXT,
        ip TEXT,
        userAgent TEXT
      )
    `);
  }
});

// Middleware to set dynamic baseUrl for EJS templates
app.use((req, res, next) => {
  const protocol = req.protocol; // 'http' or 'https'
  const host = req.get('host'); // e.g. 'localhost:3000'
  res.locals.baseUrl = `${protocol}://${host}`;
  next();
});

// 3) Dashboard route: list pixels with open counts
app.get('/', (req, res) => {
  const query = `
    SELECT p.*, COUNT(l.id) AS openCount
    FROM pixels p
    LEFT JOIN logs l ON p.id = l.pixelId
    GROUP BY p.id
    ORDER BY p.createdAt DESC
  `;
  db.all(query, [], (err, pixels) => {
    if (err) {
      return res.status(500).send('Error querying pixels.');
    }
    res.render('index', { pixels });
  });
});

// 4) Create a new pixel
app.post('/create', (req, res) => {
  const { name } = req.body;
  const pixelId = uuidv4();
  const createdAt = new Date().toISOString();

  const insertPixel = 'INSERT INTO pixels (id, name, createdAt) VALUES (?, ?, ?)';
  db.run(insertPixel, [pixelId, name || `Pixel-${pixelId.slice(0, 8)}`, createdAt], (err) => {
    if (err) {
      console.error('Error inserting pixel:', err);
      return res.status(500).send('Error creating pixel.');
    }
    res.redirect('/');
  });
});

// 5) Tracker route: logs the open, then sends actual pixel.png
app.get('/tracker/:id.png', (req, res) => {
  const pixelId = req.params.id;

  // Check if pixel exists
  const selectPixel = 'SELECT * FROM pixels WHERE id = ?';
  db.get(selectPixel, [pixelId], (err, pixel) => {
    if (err) {
      console.error('Error looking up pixel:', err);
      return res.status(500).send('Error retrieving pixel.');
    }
    if (!pixel) {
      return res.status(404).send('Pixel not found');
    }

    // Log open event
    const time = new Date().toISOString();
    const ip = req.ip;
    const userAgent = req.headers['user-agent'] || '';

    const insertLog = 'INSERT INTO logs (pixelId, time, ip, userAgent) VALUES (?, ?, ?, ?)';
    db.run(insertLog, [pixelId, time, ip, userAgent], (logErr) => {
      if (logErr) {
        console.error('Error inserting log:', logErr);
      }
      // Send actual pixel.png from /public/images/pixel.png
      res.sendFile(path.join(__dirname, 'public', 'images', 'pixel.png'), (fsErr) => {
        if (fsErr) {
          console.error('Error sending pixel.png:', fsErr);
          res.status(fsErr.status || 500).end();
        }
      });
    });
  });
});

// 6) View logs for a specific pixel
app.get('/logs/:id', (req, res) => {
  const pixelId = req.params.id;

  const selectPixel = 'SELECT * FROM pixels WHERE id = ?';
  db.get(selectPixel, [pixelId], (err, pixel) => {
    if (err) {
      console.error('Error retrieving pixel:', err);
      return res.status(500).send('Error retrieving pixel.');
    }
    if (!pixel) {
      return res.status(404).send('Pixel not found');
    }

    const selectLogs = 'SELECT * FROM logs WHERE pixelId = ? ORDER BY time DESC';
    db.all(selectLogs, [pixelId], (logsErr, logs) => {
      if (logsErr) {
        console.error('Error retrieving logs:', logsErr);
        return res.status(500).send('Error retrieving logs.');
      }

      const uniqueIps = new Set(logs.map(l => l.ip)).size;
      res.render('logs', { pixel, logs, uniqueIps });
    });
  });
});

// 7) Delete a pixel and its logs
app.post('/delete/:id', (req, res) => {
  const pixelId = req.params.id;
  db.run('DELETE FROM logs WHERE pixelId = ?', [pixelId], (err) => {
    if (err) {
      console.error('Error deleting logs:', err);
    }
    db.run('DELETE FROM pixels WHERE id = ?', [pixelId], (delErr) => {
      if (delErr) {
        console.error('Error deleting pixel:', delErr);
        return res.status(500).send('Error deleting pixel.');
      }
      res.redirect('/');
    });
  });
});

// 8) Start server
const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
