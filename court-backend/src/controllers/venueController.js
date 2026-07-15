import db from '../config/db.js';
import bcrypt from 'bcrypt';

//Create a new venue
export const venues = async(req,res)=>{
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
}

//adding court to the venue
export const addcourt = async(req,res)=>{
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
}