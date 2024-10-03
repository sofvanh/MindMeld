import { query } from './db';
import fs from 'fs';
import path from 'path';

async function initializeDatabase() {
  try {
    const sqlFile = path.join(__dirname, 'init_tables.sql');
    const sqlCommands = fs.readFileSync(sqlFile, 'utf8');

    await query(sqlCommands, []);
    console.log('Database tables created successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initializeDatabase();