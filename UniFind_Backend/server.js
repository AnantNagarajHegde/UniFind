const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = 5000; // Changed to match frontend

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('Front-End'));


// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage }); // Use storage configuration

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'Lost_and_found'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected to MySQL database');
});

// Middleware to check if user is admin
function isAdmin(req, res, next) {
  // Extract user ID from authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const userId = authHeader.split(' ')[1];

  // Check if user is admin
  const query = 'SELECT User_Type FROM User WHERE User_ID = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error checking admin status:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0 || results[0].User_Type.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    next();
  });
}

// GET route to fetch all claims for admin
app.get('/api/claims', isAdmin, (req, res) => {
  const query = `
    SELECT 
      c.Claim_ID,
      c.Found_Item_ID,
      c.User_ID,
      c.Claimant_ID,
      c.Description,
      c.Status,
      c.Verification_Details,
      c.Claim_Date,
      CONCAT(u.First_Name, ' ', u.Last_Name) AS Claimant_Name,
      f.Item_Name,
      f.Found_Date
    FROM Claim c
    JOIN User u ON c.Claimant_ID = u.User_ID
    JOIN Found_Item f ON c.Found_Item_ID = f.Found_Item_ID
    ORDER BY c.Claim_Date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching claims:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});

// POST route to update a claim status (approve/reject)
app.post('/api/claims/:id', isAdmin, (req, res) => {
  const claimId = req.params.id;
  const { status, verificationDetails } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // Start a transaction to ensure data consistency
  db.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Update the claim status
    const updateClaimQuery = `
      UPDATE Claim 
      SET Status = ?, Verification_Details = ?
      WHERE Claim_ID = ?
    `;

    db.query(updateClaimQuery, [status, verificationDetails, claimId], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error updating claim:', err);
          res.status(500).json({ error: 'Database error' });
        });
      }

      if (result.affectedRows === 0) {
        return db.rollback(() => {
          res.status(404).json({ error: 'Claim not found' });
        });
      }

      // If approved, update the found item status
      if (status === 'Approved') {
        const updateItemQuery = `
          UPDATE Found_Item 
          SET Status = 'Claimed', Claimed_By = (
            SELECT Claimant_ID FROM Claim WHERE Claim_ID = ?
          )
          WHERE Found_Item_ID = (
            SELECT Found_Item_ID FROM Claim WHERE Claim_ID = ?
          )
        `;

        db.query(updateItemQuery, [claimId, claimId], (err, updateResult) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error updating found item status:', err);
              res.status(500).json({ error: 'Failed to update item status' });
            });
          }

          // Commit the transaction
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error('Error committing transaction:', err);
                res.status(500).json({ error: 'Database error' });
              });
            }

            res.json({
              message: `Claim ${claimId} has been ${status.toLowerCase()}`,
              itemUpdated: status === 'Approved' ? updateResult.affectedRows > 0 : false
            });
          });
        });
      } else {
        // If rejected, just commit the claim update
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error committing transaction:', err);
              res.status(500).json({ error: 'Database error' });
            });
          }

          res.json({ message: `Claim ${claimId} has been ${status.toLowerCase()}` });
        });
      }
    });
  });
});

// Sample route
app.get('/', (req, res) => {
  res.send('Hello from the backend 👋');
});

// POST route to add a lost item
app.post('/api/lost-items', upload.single('Photo_Path'), async (req, res) => {
  const {
    Reported_By, Category_ID: categoryName, Location_ID: locationName, Item_Name, Description,
    Lost_Date, Lost_Time, Color, Features, Status
  } = req.body;
  const Photo_Path = req.file ? req.file.path : 'http://localhost:5000/uploads/image_not_available.avif';

  try {
    // Get Category_ID
    const [categoryRows] = await db.promise().query(
      'SELECT Category_ID FROM Category WHERE Category_Name = ?', [categoryName]
    );
    if (categoryRows.length === 0) {
      return res.status(400).json({ error: 'Invalid category name' });
    }
    const categoryId = categoryRows[0].Category_ID;

    // Get Location_ID
    const [locationRows] = await db.promise().query(
      'SELECT Location_ID FROM Location WHERE Building_Name = ?', [locationName]
    );
    if (locationRows.length === 0) {
      return res.status(400).json({ error: 'Invalid location name' });
    }
    const locationId = locationRows[0].Location_ID;

    // Insert lost item
    const query = `
      INSERT INTO Lost_Item 
      (Reported_By, Category_ID, Location_ID, Item_Name, Description, Lost_Date, Lost_Time, Color, Features, Photo_Path, Status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      Reported_By, categoryId, locationId, Item_Name, Description,
      Lost_Date, Lost_Time || null, Color, Features, Photo_Path, Status || 'Open'
    ];

    const [result] = await db.promise().query(query, values);
    res.status(201).json({ message: 'Lost item reported successfully', Lost_Item_ID: result.insertId });
  } catch (err) {
    console.error('Error inserting lost item:', err);
    res.status(500).json({ error: 'Failed to report lost item' });
  }
});

// POST route to add a found item
app.post('/api/found-items', upload.single('Photo_Path'), async (req, res) => {
  const {
    Reported_By, Category_ID: categoryName, Location_ID: locationName, Item_Name, Description,
    Found_Date, Found_Time, Color, Features, Status
  } = req.body;
  const Photo_Path = req.file ? req.file.path : 'http://localhost:5000/uploads/image_not_available.avif';

  try {
    // Get Category_ID
    const [categoryRows] = await db.promise().query(
      'SELECT Category_ID FROM Category WHERE Category_Name = ?', [categoryName]
    );
    if (categoryRows.length === 0) {
      return res.status(400).json({ error: 'Invalid category name' });
    }
    const categoryId = categoryRows[0].Category_ID;

    // Get Location_ID
    const [locationRows] = await db.promise().query(
      'SELECT Location_ID FROM Location WHERE Building_Name = ?', [locationName]
    );
    if (locationRows.length === 0) {
      return res.status(400).json({ error: 'Invalid location name' });
    }
    const locationId = locationRows[0].Location_ID;

    // Insert found item
    const query = `
      INSERT INTO Found_Item 
      (Reported_By, Category_ID, Location_ID, Item_Name, Description, Found_Date, Found_Time, Color, Features, Photo_Path, Status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      Reported_By, categoryId, locationId, Item_Name, Description,
      Found_Date, Found_Time || null, Color, Features, Photo_Path, Status || 'Unclaimed'
    ];

    const [result] = await db.promise().query(query, values);
    res.status(201).json({ message: 'Found item reported successfully', Found_Item_ID: result.insertId });
  } catch (err) {
    console.error('Error inserting found item:', err);
    res.status(500).json({ error: 'Failed to report found item' });
  }
});

// GET route to search lost items
app.get('/api/lost-items', async (req, res) => {
  const { category, location, date, status, keyword } = req.query;
  let query = `
    SELECT li.*, c.Category_Name, l.Building_Name, u.First_Name, u.Last_Name
    FROM Lost_Item li
    JOIN Category c ON li.Category_ID = c.Category_ID
    JOIN Location l ON li.Location_ID = l.Location_ID
    JOIN User u ON li.Reported_By = u.User_ID
    WHERE 1=1
  `;
  const values = [];

  if (category) {
    query += ' AND c.Category_Name = ?';
    values.push(category);
  }
  if (location) {
    query += ' AND l.Building_Name LIKE ?';
    values.push(`%${location}%`);
  }
  if (date) {
    query += ' AND li.Lost_Date >= ?';
    values.push(date);
  }
  if (status) {
    query += ' AND li.Status = ?';
    values.push(status);
  }
  if (keyword) {
    query += ' AND (li.Item_Name LIKE ? OR li.Description LIKE ?)';
    values.push(`%${keyword}%`, `%${keyword}%`);
  }

  try {
    const [results] = await db.promise().query(query, values);
    const items = results.map(item => ({
      ...item,
      Photo_Path: item.Photo_Path ? `http://localhost:5000/${item.Photo_Path}` : null
    }));
    res.json(items);
  } catch (err) {
    console.error('Error fetching lost items:', err);
    res.status(500).json({ error: 'Failed to fetch lost items' });
  }
});

// GET route to search found items
app.get('/api/found-items', async (req, res) => {
  const { category, location, date, status, keyword } = req.query;
  let query = `
      SELECT fi.*, c.Category_Name, l.Building_Name, u.First_Name, u.Last_Name
      FROM Found_Item fi
      LEFT JOIN Category c ON fi.Category_ID = c.Category_ID
      LEFT JOIN Location l ON fi.Location_ID = l.Location_ID
      LEFT JOIN User u ON fi.Reported_By = u.User_ID
      WHERE fi.Status != 'Claimed'
    `;
  const values = [];

  if (category) {
    query += ' AND c.Category_Name = ?';
    values.push(category);
  }
  if (location) {
    query += ' AND l.Building_Name LIKE ?';
    values.push(`%${location}%`);
  }
  if (date) {
    query += ' AND fi.Found_Date >= ?';
    values.push(date);
  }
  if (status) {
    // Map 'found' to 'Unclaimed'
    const dbStatus = status.toLowerCase() === 'found' ? 'Unclaimed' : status;
    query += ' AND fi.Status = ?';
    values.push(dbStatus);
  }
  if (keyword) {
    query += ' AND (fi.Item_Name LIKE ? OR fi.Description LIKE ?)';
    values.push(`%${keyword}%`, `%${keyword}%`);
  }

  try {
    const [results] = await db.promise().query(query, values);
    const items = results.map(item => ({
      ...item,
      Photo_Path: item.Photo_Path ? `http://localhost:5000/${item.Photo_Path}` : null
    }));
    res.json(items);
  } catch (err) {
    console.error('Error fetching found items:', err);
    res.status(500).json({ error: 'Failed to fetch found items' });
  }
});

// Routes for categories and locations
app.get('/api/categories', async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM Category');
    res.json(results);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/locations', async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM Location');
    res.json(results);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

app.post("/api/claim", (req, res) => {
  const {
    User_ID,
    Found_Item_ID,
    Description,
    Claimant_ID,
    Verification_Details
  } = req.body;

  const sql = `
    INSERT INTO Claim (User_ID, Found_Item_ID, Description, Claimant_ID, Verification_Details)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.execute(sql, [User_ID, Found_Item_ID, Description, Claimant_ID, Verification_Details], (err, result) => {
    if (err) {
      console.error("Error inserting claim:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ success: true, claimId: result.insertId });
  });
});

// SIGN UP a new user
app.post('/api/signup', async (req, res) => {
  const {
    First_Name, Last_Name, Email, Phone, User_Type, Department, Password
  } = req.body;

  const query = `
    INSERT INTO User (First_Name, Last_Name, Email, Phone, User_Type, Department, Password)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [First_Name, Last_Name, Email, Phone, User_Type, Department, Password];

  try {
    const [result] = await db.promise().query(query, values);
    res.status(201).json({ message: 'Signup successful', userId: result.insertId });
  } catch (err) {
    console.error('❌ Signup failed:', err);
    res.status(500).json({ error: 'Signup failed', details: err.message });
  }
});

// LOGIN an existing user
app.post('/api/login', async (req, res) => {
  const { Email, Password } = req.body;

  const query = `
    SELECT * FROM User WHERE Email = ? AND Password = ?
  `;

  try {
    const [results] = await db.promise().query(query, [Email, Password]);
    if (results.length > 0) {
      res.status(200).json({ message: 'Login successful', user: results[0] });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('❌ Login failed:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST route to submit feedback
app.post('/api/feedback', async (req, res) => {
  const { User_ID, Message, Rating, Feedback_Type } = req.body;

  const query = `
    INSERT INTO Feedback (User_ID, Message, Rating, Feedback_Type, Status)
    VALUES (?, ?, ?, ?, 'New')
  `;
  const values = [User_ID || null, Message, Rating || null, Feedback_Type || null];

  try {
    const [result] = await db.promise().query(query, values);
    res.status(201).json({ message: 'Feedback submitted successfully', Feedback_ID: result.insertId });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

app.get('/api/lost-items/:id/contact-details', async (req, res) => {
  const lostItemId = req.params.id;
  try {
    const query = `
      SELECT u.Email, u.Phone, CONCAT(u.First_Name, ' ', u.Last_Name) AS Reporter_Name
      FROM Lost_Item li
      JOIN User u ON li.Reported_By = u.User_ID
      WHERE li.Lost_Item_ID = ?
    `;
    const [results] = await db.promise().query(query, [lostItemId]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Lost item or reporter not found' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching contact details:', err);
    res.status(500).json({ error: 'Failed to fetch contact details' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});