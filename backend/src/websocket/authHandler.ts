import { OAuth2Client } from 'google-auth-library';
import config from '../config';
import { findOrCreateUser } from '../db/operations/userOperations';
import { Socket } from 'socket.io';

export const client = new OAuth2Client(config.googleClientId);

export const handleAuthenticate = async (socket: Socket, token: string, callback?: Function) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) throw new Error('No email in token');
    if (!payload?.sub) throw new Error('No sub in token');

    const user = await findOrCreateUser(payload.sub, payload.email);
    socket.data.user = user;
    callback?.({ success: true, user });
  } catch (error) {
    console.error('Authentication error:', error);
    callback?.({ success: false, error: 'Authentication failed' });
  }
}

export const handleLogout = (socket: Socket, callback?: Function) => {
  socket.data.user = null;
  callback?.();
};