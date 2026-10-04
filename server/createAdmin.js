const { connectDB } = require('./config/database');
const User = require('./models/User');

async function createAdmin() {
  await connectDB();
  const admin = await User.create({
    name: 'Admin',
    email: process.env.ADMIN_EMAIL || (() => { throw new Error('Set ADMIN_EMAIL before running this script.'); })(),
    password: process.env.ADMIN_PASSWORD || (() => { throw new Error('Set ADMIN_PASSWORD before running this script.'); })(),
    role: 'admin', // adjust if your User model uses a different field/value for role
  });
  console.log('Admin created:', admin.email);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
