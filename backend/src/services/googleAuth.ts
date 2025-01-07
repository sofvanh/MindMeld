import { OAuth2Client } from 'google-auth-library';
import config from '../config';

export const googleAuthClient = new OAuth2Client(config.googleClientId);