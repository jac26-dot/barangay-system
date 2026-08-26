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

// Render (and most hosting platforms) sit the app behind a reverse
// proxy, which sets the X-Forwarded-For header. Without this,
// express-rate-limit throws a ValidationError on every request.
app.set('trust proxy', 1);

// Middleware
// Allow the admin frontend AND the public resident portal.
// Add any other trusted origins to this list as needed.
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'https://barangay697-eserbisyo.onrender.com',
  'http://localhost:3001', // handy for local portal dev on an alternate port
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. curl, server-to-server, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes (no auth required) — must be registered so public
// endpoints like /api/residents/search-public, /api/residents/public,
// /api/documents/public, and /api/documents/track/:controlNumber work.
app.use('/api', require('./routes/public.routes'));

// Protected routes
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
