import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../services/auth.service';


const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, preferredName } = req.body;

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
    res.status(500).json({ error: 'Error interno en el servidor' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user.userId);
    res.json({ token, userId: user.userId });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};