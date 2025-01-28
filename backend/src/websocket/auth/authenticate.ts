import config from '../../config';
import { findOrCreateUser } from '../../db/operations/userOperations';
import { User } from '../../.shared/types';
import { SocketHandler } from '../../backendTypes';
import { googleAuthClient } from '../../services/googleAuth';

interface AuthenticateData {
  token: string;
}

interface AuthenticateResponse {
  user: User;
}

export const handleAuthenticate: SocketHandler<AuthenticateData, AuthenticateResponse> = async (socket, io, { token }) => {
  const ticket = await googleAuthClient.verifyIdToken({
    idToken: token,
    audience: config.googleClientId
  })

  const payload = ticket.getPayload();
  if (!payload?.email || !payload?.sub) {
    return {
      success: false,
      error: 'Invalid token payload'
    }
  }

  const dbUser = await findOrCreateUser(payload.sub, payload.email);
  const user: User = {
    id: dbUser.id,
    googleId: dbUser.google_id,
    email: dbUser.email
  };
  socket.data.user = user;

  return {
    success: true,
    data: { user }
  };
}
