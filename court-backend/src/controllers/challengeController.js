import db from '../config/db.js';
import bcrypt from 'bcrypt';

export const newmatchchallenge= async(req,res)=>{
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
}

export const pendingchallenges = async(req,res)=>{
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
}