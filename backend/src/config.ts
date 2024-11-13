interface Config {
  nodeEnv: string;
  port: number;
  backendUrl: string;
  frontendUrl: string;
  openAIKey: string;
  googleClientId: string;
  db: {
    user: string;
    host: string;
    name: string;
    password: string;
    port: number;
  };
}

const environment = process.env.NODE_ENV || 'development';
let host: string;

// TODO: Check if essential database credentials are set!
if (environment === 'development') {
  // .env files are only used in development environments
  require('dotenv').config();
  console.log("Using development config");
  host = process.env.DB_HOST || '';
} else {
  console.log("Using production config");
  const cloudSqlConnectionName = process.env.CLOUD_SQL_CONNECTION_NAME || '';
  host = `/cloudsql/${cloudSqlConnectionName}`;
}

const config: Config = {
  nodeEnv: environment,
  port: parseInt(process.env.PORT || '3001', 10),
  backendUrl: process.env.BACKEND_URL || 'http://localhost',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  openAIKey: process.env.OPENAI_API_KEY || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  db: {
    user: process.env.DB_USER || '',
    host,
    name: process.env.DB_NAME || '',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '5432', 10),
  },
};

export default config;