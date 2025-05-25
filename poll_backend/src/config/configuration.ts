import { registerAs } from '@nestjs/config';

export default registerAs('secrets', () => ({
  jwtSecret: process.env.JWT_SECRET,
  dbPassword: process.env.DB_PASSWORD,
  encryptionKey: process.env.ENCRYPTION_KEY,
}));
