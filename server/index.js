const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes (no auth required)
const publicRoutes = require('./routes/public.routes');
app.use('/api', publicRoutes);

// Protected routes
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/residents', require('./routes/resident.routes'));
app.use('/api/documents', require('./routes/document.routes'));
app.use('/api/blotter',   require('./routes/blotter.routes'));
app.use('/api/officials', require('./routes/official.routes'));
app.use('/api/users',     require('./routes/user.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

app.get('/', (req, res) => {
  res.json({ message: 'Barangay Management System API is running.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

const { connectDB } = require('./config/database');
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
