import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const hashPassword = async (pass: string) => await bcrypt.hash(pass, 10);
export const comparePassword = async (pass: string, hash: string) => await bcrypt.compare(pass, hash);
export const generateToken = (userId: string) => 
  jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });