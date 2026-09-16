const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    // One-time, idempotent fix: allow resident records to be archived
    // (instead of a hard delete) when they have related document
    // requests or a linked account. Safe to run on every deploy —
    // Postgres skips it if the value already exists.
    try {
      await sequelize.query("ALTER TYPE enum_residents_status ADD VALUE IF NOT EXISTS 'Archived'");
    } catch (enumError) {
      console.error('Could not add "Archived" to resident status enum:', enumError.message);
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
