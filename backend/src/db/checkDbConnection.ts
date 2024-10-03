import { query } from './db';
import fs from 'fs';
import path from 'path';

async function checkDbConnection() {
  try {
    const sqlFile = path.join(__dirname, 'sql/check_connection.sql');
    const sqlQuery = fs.readFileSync(sqlFile, 'utf8');

    console.log('Executing SQL query:', sqlQuery);
    const result = await query(sqlQuery, []);
    console.log('Query result:', result.rows[0]);

    if (result.rows[0].connection_test === 1) {
      console.log('Database connection successful!');
    } else {
      console.log('Database connection test failed.');
    }
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
}

checkDbConnection();