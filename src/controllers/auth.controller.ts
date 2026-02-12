import { Request, Response } from 'express';
// BORRA ESTO: import { PrismaClient } from '@prisma/client';
// BORRA ESTO: const prisma = new PrismaClient();

// AGREGA ESTO: Importamos la instancia segura que acabamos de crear
import prisma from '../config/prisma'; 
import { hashPassword, comparePassword, generateToken } from '../services/auth.service';

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
    console.error("🔴 ERROR CRÍTICO EN REGISTER:", error);
    res.status(500).json({ 
        error: 'Error interno al registrar usuario', 
        details: String(error)
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Usamos la misma instancia 'prisma' importada
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user.userId);
    res.json({ token, userId: user.userId });

  } catch (error) {
    console.error("🔴 ERROR CRÍTICO EN LOGIN:", error);
    res.status(500).json({ error: 'Error al procesar el login', details: String(error) });
  }
};