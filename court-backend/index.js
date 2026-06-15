import express from 'express';
import cors from 'cors';
import db from './db.js';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const app = express();
app.use(cors()); // 2. Tell Express to allow outside requests
app.use(express.json()); // Allows our API to read JSON data

// --- Secure User Registration ---
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if the user already exists in PostgreSQL
        const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'This email is already registered!' });
        }

        // 2. Scramble (Hash) the password securely
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Save the new user to PostgreSQL with the SCRAMBLED password
        const insertQuery = `
            INSERT INTO users (name, email, password) 
            VALUES ($1, $2, $3) 
            RETURNING id, name, email; 
        `;
        // Notice we only return id, name, and email. We NEVER send the password back!
        const result = await db.query(insertQuery, [name, email, hashedPassword]);

        res.status(201).json({
            message: 'User registered successfully!',
            user: result.rows[0]
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Secure User Login ---
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user in PostgreSQL by their email
        const userQuery = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        // If the email doesn't exist, stop here
        if (userQuery.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = userQuery.rows[0];

        // 2. Compare the typed password with the scrambled hash in the database
        const isMatch = await bcrypt.compare(password, user.password);

        // If the hashes don't match, stop here
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // 3. Success! Send back the user info (but NEVER send the password back)
        res.status(200).json({
            message: 'Login successful!',
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- MongoDB Setup ---
const mongoUrl = 'mongodb://localhost:27017';
const mongoClient = new MongoClient(mongoUrl);
let nosqlDb;

async function connectMongo() {
    try {
        await mongoClient.connect();
        nosqlDb = mongoClient.db('matchmaking_db');
        console.log('🍃 Connected to MongoDB (NoSQL)!');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
}
connectMongo();

// 1. Create a new user
app.post('/users', async (req, res) => {
    try {
        const { name, email } = req.body;
        const result = await db.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
            [name, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Create a new venue
app.post('/venues', async (req, res) => {
    try {
        const { name, address } = req.body;
        const result = await db.query(
            'INSERT INTO venues (name, address) VALUES ($1, $2) RETURNING *',
            [name, address]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Add a court to a venue
app.post('/courts', async (req, res) => {
    try {
        const { venue_id, court_number } = req.body;
        const result = await db.query(
            'INSERT INTO courts (venue_id, court_number) VALUES ($1, $2) RETURNING *',
            [venue_id, court_number]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Get all venues WITH their courts
app.get('/venues', async (req, res) => {
    try {
        const query = `
            SELECT venues.name AS venue_name, venues.address, courts.court_number 
            FROM venues
            LEFT JOIN courts ON venues.id = courts.venue_id;
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Book a Court
app.post('/bookings', async (req, res) => {
    try {
        const { user_id, court_id, start_time, end_time } = req.body;

        const requestedStartTime = new Date(start_time);
        const now = new Date();

        if (requestedStartTime < now) {
            return res.status(400).json({ error: "You cannot book a court in the past!" });
        }

        // Step 1: Prevent Double-Booking
        const checkQuery = `
            SELECT id FROM bookings 
            WHERE court_id = $1 
            AND status = 'confirmed'
            AND (start_time < $3 AND end_time > $2)
        `;
        const overlapResult = await db.query(checkQuery, [court_id, start_time, end_time]);

        if (overlapResult.rows.length > 0) {
            return res.status(409).json({ error: 'Sorry! This court is already booked for this time slot.' });
        }

        // Step 2: Insert the new booking
        const insertQuery = `
            INSERT INTO bookings (user_id, court_id, start_time, end_time)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await db.query(insertQuery, [user_id, court_id, start_time, end_time]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Create a Matchmaking Profile (The power of NoSQL!)
app.post('/matchmaking-profiles', async (req, res) => {
    try {
        // In NoSQL, we don't have to extract specific fields. 
        // We just grab the entire raw object the user sends us!
        const profileData = req.body;

        // We select the 'profiles' collection (MongoDB's version of a table).
        // If it doesn't exist, MongoDB magically creates it on the fly!
        const collection = nosqlDb.collection('profiles');
        
        // Insert the dynamic document
        const result = await collection.insertOne(profileData);

        res.status(201).json({
            message: "Matchmaking profile created!",
            documentId: result.insertedId,
            profile: profileData
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Get All Matchmaking Profiles (The power of NoSQL!)
app.get('/matchmaking-profiles', async (req, res) => {
    try {
        const collection = nosqlDb.collection('profiles');
        
        // .find({}) tells MongoDB to get every document in the collection
        // .toArray() turns those documents into a readable JSON array
        const profiles = await collection.find({}).toArray();
        
        res.status(200).json(profiles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- GET MATCHMAKING PROFILES (The "Stitch" Route) ---
// --- GET MATCHMAKING PROFILES (The "Stitch" Route) ---
app.get('/profiles', async (req, res) => {
    try {
        // 1. FIXED: Using your actual mongoClient and database name!
        const database = mongoClient.db('matchmaking_db'); 
        
        // Note: Change 'profiles' if you named your collection something else earlier!
        const collection = database.collection('profiles'); 
        const profiles = await collection.find({}).toArray();

        // 2. Fetch the strict user data (id and name) from PostgreSQL
        const usersQuery = await db.query('SELECT id, name FROM users');
        const users = usersQuery.rows;

        // 3. The Stitch: Combine NoSQL profiles with SQL names
        const stitchedProfiles = profiles.map(profile => {
            // Find the SQL user whose ID matches the MongoDB profile's user_id
            const matchingUser = users.find(u => u.id === profile.user_id);
            
            return {
                ...profile, 
                name: matchingUser ? matchingUser.name : "Unknown Player" 
            };
        });

        // 4. Send the combined data back to React
        res.status(200).json(stitchedProfiles);

    } catch (err) {
        console.error("Error fetching profiles:", err);
        res.status(500).json({ error: 'Failed to fetch matchmaking profiles' });
    }
});

// --- CREATE A NEW MATCH CHALLENGE ---
app.post('/challenge', async (req, res) => {
    try {
        // We are now extracting the date and time from the request!
        const { challenger_id, opponent_id, match_date, match_time } = req.body;

        // Ensure the user actually picked a time before sending the challenge
        if (!match_date || !match_time) {
            return res.status(400).json({ error: 'Please select a date and time.' });
        }

        // We added $3 and $4 to safely inject the new date and time
        const newChallenge = await db.query(
            `INSERT INTO match_challenges (challenger_id, opponent_id, match_date, match_time) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [challenger_id, opponent_id, match_date, match_time]
        );

        res.status(201).json({ 
            message: "Challenge sent successfully!", 
            challenge: newChallenge.rows[0] 
        });
    } catch (err) {
        console.error("Error creating challenge:", err);
        res.status(500).json({ error: 'Failed to send challenge' });
    }
});

// --- CREATE OR UPDATE USER PROFILE (MongoDB) ---
app.post('/profile', async (req, res) => {
    try {
        const { user_id, play_style, skill_level, preferred_hand, favorite_brands } = req.body;

        // 1. Connect to your MongoDB database and collection
        const database = mongoClient.db('matchmaking_db');
        const collection = database.collection('profiles');

        // 2. The data we want to save
        const profileData = {
            user_id: user_id,
            play_style: play_style,
            skill_level: skill_level,
            preferred_hand: preferred_hand,
            favorite_brands: favorite_brands
        };

        // 3. Upsert (Update if exists, Insert if it doesn't)
        await collection.updateOne(
            { user_id: user_id }, // Find the profile by user_id
            { $set: profileData }, // Set the new data
            { upsert: true }       // Create a new document if one isn't found!
        );

        res.status(201).json({ message: "Profile saved successfully!" });

    } catch (err) {
        console.error("Error saving profile:", err);
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

// --- GET PENDING CHALLENGES FOR A USER ---
app.get('/challenges/pending/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // We use a SQL JOIN to get the name of the person who challenged them!
        const pendingChallenges = await db.query(
            `SELECT c.id, c.status, c.created_at, u.name AS challenger_name 
             FROM match_challenges c
             JOIN users u ON c.challenger_id = u.id
             WHERE c.opponent_id = $1 AND c.status = 'pending'`,
            [userId]
        );

        res.status(200).json(pendingChallenges.rows);
    } catch (err) {
        console.error("Error fetching challenges:", err);
        res.status(500).json({ error: 'Failed to fetch pending challenges' });
    }
});

// --- ACCEPT A CHALLENGE ---
app.put('/challenge/:id/accept', async (req, res) => {
    try {
        const challengeId = req.params.id;

        // Update the status from 'pending' to 'accepted'
        const updatedChallenge = await db.query(
            `UPDATE match_challenges 
             SET status = 'accepted' 
             WHERE id = $1 RETURNING *`,
            [challengeId]
        );

        if (updatedChallenge.rows.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        res.status(200).json({ 
            message: "Challenge accepted! Ready for payment.", 
            challenge: updatedChallenge.rows[0] 
        });
    } catch (err) {
        console.error("Error accepting challenge:", err);
        res.status(500).json({ error: 'Failed to accept challenge' });
    }
});

// --- GET ACCEPTED & PAID MATCHES FOR A USER ---
app.get('/matches/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const matches = await db.query(
            `SELECT c.id, c.status, c.created_at, 
                    u1.name AS challenger_name, 
                    u2.name AS opponent_name
             FROM match_challenges c
             JOIN users u1 ON c.challenger_id = u1.id
             JOIN users u2 ON c.opponent_id = u2.id
             WHERE (c.challenger_id = $1 OR c.opponent_id = $1) 
             AND c.status IN ('accepted', 'paid')`, // <-- Now includes paid matches!
            [userId]
        );

        res.status(200).json(matches.rows);
    } catch (err) {
        console.error("Error fetching matches:", err);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});

// --- PROCESS MOCK PAYMENT ---
app.put('/challenge/:id/pay', async (req, res) => {
    try {
        const challengeId = req.params.id;

        const updatedChallenge = await db.query(
            `UPDATE match_challenges 
             SET status = 'paid' 
             WHERE id = $1 RETURNING *`,
            [challengeId]
        );

        if (updatedChallenge.rows.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        res.status(200).json({ 
            message: "Payment successful! Court reserved.", 
            challenge: updatedChallenge.rows[0] 
        });
    } catch (err) {
        console.error("Error processing payment:", err);
        res.status(500).json({ error: 'Failed to process payment' });
    }
});

// --- BOOK A COURT (SOLO) ---
app.post('/book-court', async (req, res) => {
    try {
        const { user_id, court_name, booking_date, booking_time } = req.body;
        
        await db.query(
            `INSERT INTO solo_bookings (user_id, court_name, booking_date, booking_time) 
             VALUES ($1, $2, $3, $4)`,
            [user_id, court_name, booking_date, booking_time]
        );

        res.status(201).json({ message: "Court booked successfully!" });
    } catch (err) {
        console.error("Error in /book-court:", err); // This will log the error to your terminal!
        res.status(500).json({ error: 'Failed to book court' });
    }
});

// --- GET MY SOLO BOOKINGS ---
app.get('/my-bookings/:userId', async (req, res) => {
    try {
        const bookings = await db.query(
            `SELECT * FROM solo_bookings WHERE user_id = $1`,
            [req.params.userId]
        );
        res.json(bookings.rows);
    } catch (err) {
        console.error("Error in /my-bookings:", err);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// --- GET ACCEPTED CHALLENGES FOR CHALLENGER ---
app.get('/challenges/accepted/:challengerId', async (req, res) => {
    try {
        const acceptedChallenges = await db.query(
            `SELECT c.id, u.name AS opponent_name 
             FROM match_challenges c
             JOIN users u ON c.opponent_id = u.id
             WHERE c.challenger_id = $1 AND c.status = 'accepted'`,
            [req.params.challengerId]
        );
        res.json(acceptedChallenges.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch accepted challenges' });
    }
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Court Booking API is running on http://localhost:${PORT}`);
});