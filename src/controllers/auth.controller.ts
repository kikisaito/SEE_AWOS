import { Request, Response } from 'express';
import prisma from '../config/prisma'; 
import { hashPassword, comparePassword, generateToken } from '../services/auth.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, preferredName } = req.body;
    
    // Validación
    if (!email || !password || !preferredName) {
        return res.status(400).json({ error: 'Faltan datos: email, password o preferredName' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: 'El usuario ya existe' });

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        preferredName
      }
    });

    const token = generateToken(user.userId);
    res.status(201).json({ token, userId: user.userId });

  } catch (error) {
    console.error("ERROR CRÍTICO EN REGISTER:", error);
    res.status(500).json({ 
        error: 'Error interno al registrar usuario', 
        details: String(error)
    });
  }
};










export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

      const user = await prisma.user.findUnique({
      where: { email: email },
    });

    
    // Usamos la misma instancia 'prisma' importada
    const users_find = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas (Usuario no encontrado)' });
    }


    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas (Contraseña incorrecta)' });
    }


    const secret = process.env.JWT_SECRET || 'secreto_temporal';
    const token_users = jwt.sign(
      { userId: user.userId, email: user.email }, 
      secret,
      { expiresIn: '24h' } 
    );

    
res.json({
      message: 'Login exitoso',
      token: token_users,
      user: {
        id: user.userId,
        email: user.email,
        name: user.preferredName
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
