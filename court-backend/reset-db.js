const db = require('./src/config/db');

async function resetDatabase() {
  try {
    console.log("Wiping database and resetting IDs...");
    
    // TRUNCATE empties the tables.
    // RESTART IDENTITY resets the SERIAL ID counters back to 1.
    // CASCADE ensures linked data in other tables is also cleared safely.
    await db.query('TRUNCATE TABLE users, venues, courts, bookings RESTART IDENTITY CASCADE;');
    
    console.log("✨ Database perfectly wiped! All IDs will now start at 1.");
  } catch (err) {
    console.error("Error resetting database:", err);
  } finally {
    process.exit(); // Closes the script
  }
}

resetDatabase();