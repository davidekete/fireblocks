import * as jwt from 'jsonwebtoken';

export class Token {
  constructor(private readonly jwtSecret: string) {}

  /**
   * Generates an access token
   * @param payload
   * @returns access token
   */
  generateAccessToken(payload: object, expiry?: string) {
    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: expiry || '1d',
    });

    return token;
  }
}

/**
 *Confirms the validity of a token
 * @param token
 * @param secret
 * @returns decoded token | error
 */
export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret);
};
