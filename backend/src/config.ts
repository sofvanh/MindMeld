const environment = process.env.NODE_ENV || 'development';

// .env files are only used in development environments
if (environment === 'development') {
  require('dotenv').config();
  // TODO: Check if essential database credentials are set
}

interface Config {
  nodeEnv: string;
  port: number;
  backendUrl: string;
  frontendUrl: string;
  openAIKey: string;
  db: {
    user: string;
    host: string;
    name: string;
    password: string;
    port: number;
  };
}

const config: Config = {
  nodeEnv: environment,
  port: parseInt(process.env.PORT || '3001', 10),
  backendUrl: process.env.BACKEND_URL || 'http://localhost',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  openAIKey: process.env.OPENAI_API_KEY || '',
  db: {
    user: process.env.DB_USER || '',
    host: process.env.DB_HOST || '',
    name: process.env.DB_NAME || '',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '5432', 10),
  },
};

export default config;