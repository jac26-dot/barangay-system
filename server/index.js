const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const { connectDB } = require('./config/database');
const User = require('./models/User');
const Resident = require('./models/Resident');
const Document = require('./models/Document');

// Associations
Document.belongsTo(Resident, { foreignKey: 'residentId' });
Resident.hasMany(Document, { foreignKey: 'residentId' });
const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/residents', require('./routes/resident.routes'));
app.use('/api/documents', require('./routes/document.routes'));
app.use('/api/blotter',   require('./routes/blotter.routes'));
app.use('/api/officials', require('./routes/official.routes'));
app.use('/api/users',     require('./routes/user.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Barangay Management System API is running.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});