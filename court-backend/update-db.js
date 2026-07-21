// Import the database instance from our config file to run queries
import db from './src/config/db.js';

// Main async function to handle database updates
async function updateDatabase() {
    try {
        // Add date and time columns to match_challenges if they aren't already there
        await db.query(`
            ALTER TABLE match_challenges 
            ADD COLUMN IF NOT EXISTS match_date DATE,
            ADD COLUMN IF NOT EXISTS match_time VARCHAR(10);
        `);
        // Log success message for the match_challenges update
        console.log('✅ Scheduling columns added to match_challenges!');

        // Create the solo_bookings table if it doesn't exist yet
        await db.query(`
            CREATE TABLE IF NOT EXISTS solo_bookings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                court_name VARCHAR(100),
                booking_date DATE,
                booking_time VARCHAR(10),
                status VARCHAR(20) DEFAULT 'paid'
            );
        `);
        // Log success message for table creation
        console.log('✅ solo_bookings table created successfully!');

    } catch (err) {
        // Log any database error to the console
        console.error('Error updating database:', err.message);
    } finally {
        // Close the Node.js process and return to terminal
        process.exit();
    }
}

// Run the migration script
updateDatabase();