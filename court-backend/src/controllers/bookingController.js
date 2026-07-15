import db from '../config/db.js';
import bcrypt from 'bcrypt';

export const bookacourt=async(req,res)=>{
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
}