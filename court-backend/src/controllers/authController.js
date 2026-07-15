import db from '../config/db.js';
import bcrypt from 'bcrypt';

export const register = async(req,res)=>{
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
}

export const login =  async(req,res)=>{
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
}