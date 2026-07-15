import db from '../config/db.js';
import bcrypt from 'bcrypt';

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