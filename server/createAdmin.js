const { connectDB } = require('./config/database');
const User = require('./models/User');

async function createAdmin() {
  await connectDB();
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@barangay.com',
    password: 'Admin123!',
    role: 'admin', // adjust if your User model uses a different field/value for role
  });
  console.log('Admin created:', admin.email);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});