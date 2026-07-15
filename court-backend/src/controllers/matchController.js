import db from '../config/db.js';
import bcrypt from 'bcrypt';

export const matchmakingprofile = async(req,res)=>{
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
}

export const getallmatches = async(req,res)=>{
    try {
        const collection = nosqlDb.collection('profiles');
        
        // .find({}) tells MongoDB to get every document in the collection
        // .toArray() turns those documents into a readable JSON array
        const profiles = await collection.find({}).toArray();
        
        res.status(200).json(profiles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const matchingprofiles = async(req,res)=>{
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
}