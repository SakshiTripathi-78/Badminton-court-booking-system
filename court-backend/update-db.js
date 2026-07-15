import db from './src/config/db.js';

async function updateDatabase() {
    try {
        // Your previous scheduling change
        await db.query(`
            ALTER TABLE match_challenges 
            ADD COLUMN IF NOT EXISTS match_date DATE,
            ADD COLUMN IF NOT EXISTS match_time VARCHAR(10);
        `);
        console.log('✅ Scheduling columns added to match_challenges!');

        // Add this specific block to create your solo booking table
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
        console.log('✅ solo_bookings table created successfully!');

    } catch (err) {
        console.error('Error updating database:', err.message);
    } finally {
        process.exit();
    }
}

updateDatabase();