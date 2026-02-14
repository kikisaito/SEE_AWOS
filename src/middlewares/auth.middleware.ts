import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Truco de TypeScript: Definimos que nuestras peticiones pueden traer un usuario
export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ error: '¡Alto ahí! Necesitas iniciar sesión (Falta Token)' });
  }

 
  const secret = process.env.JWT_SECRET || 'secreto_temporal';
  
  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Tu sesión expiró o el token es falso' });
    }

    
    req.user = user;
    
    next(); 
  });
};