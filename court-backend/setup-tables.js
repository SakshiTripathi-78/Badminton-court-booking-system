const db = require('./db');

async function createTables() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS venues (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        address TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS courts (
        id SERIAL PRIMARY KEY,
        venue_id INT REFERENCES venues(id) ON DELETE CASCADE,
        court_number VARCHAR(50) NOT NULL,
        UNIQUE(venue_id, court_number)
    );

    CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        court_id INT REFERENCES courts(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed'
    );
  `;

  try {
    console.log("Creating tables...");
    await db.query(schema);
    console.log("Tables created successfully! Your relational database is ready.");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    process.exit();
  }
}

createTables();