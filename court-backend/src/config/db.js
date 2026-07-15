// Lets understand and make everything from the scratch
//Imports the node-postgres library, which is the standard driver for interacting with PostgreSQL databases from Node.js.
import pg from 'pg';
//Imports the dotenv package, which is used to load environment variables from a .env file into process.env.
import dotenv from 'dotenv';

/*
Executes the configuration function, which reads your .env file and makes those variables available
in your application's process.env object. This is a security best practice to keep database credentials
out of your source code.
*/
dotenv.config();
//Extracts the Pool class from the pg object. The Pool class manages a collection of database connections.
const { Pool } = pg;

//This creates a new instance of the connection pool. 
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Change this from module.exports
export default {
  query: (text, params) => pool.query(text, params),
};

/*
By wrapping the pool in this exported object, you create a singleton pattern for your database connection.
 You can import this file throughout your project, and every part of your app will share the same pool instance, 
 ensuring you do not exceed your database's connection limit!
*/