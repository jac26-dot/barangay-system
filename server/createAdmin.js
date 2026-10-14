// Creates the first admin account. Run it once, from the server folder:
//
//   $env:ADMIN_NAME  = "Barangay Administrator"
//   $env:ADMIN_EMAIL = "admin@yourbarangay.example"
//   $env:ADMIN_PASSWORD = "<at least 12 characters>"
//   node createAdmin.js
//   Remove-Item Env:ADMIN_PASSWORD
//
// The password is read from the environment and is never written in this
// file, so it can never end up in Git.
const dotenv = require('dotenv');
dotenv.config();
const { connectDB, sequelize } = require('./config/database');
const User = require('./models/User');

const name = (process.env.ADMIN_NAME || 'Administrator').trim();
const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';

function stop(message) {
  console.error(message);
  process.exit(1);
}

(async () => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) stop('Set ADMIN_EMAIL to a valid email address.');
  if (password.length < 12) stop('ADMIN_PASSWORD must be at least 12 characters long.');

  await connectDB();

  const existing = await User.findOne({ where: { email } });
  if (existing) stop('An account with that email already exists. Nothing was changed.');

  // The User model hashes the password automatically before saving.
  await User.create({ name, email, password, role: 'admin', isActive: true, accountStatus: 'Approved' });
  console.log(`Admin account created for ${email}.`);

  await sequelize.close();
})().catch((error) => stop(`Could not create the admin account: ${error.message}`));
