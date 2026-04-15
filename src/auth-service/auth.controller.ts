import { Request, Response } from 'express';
import prisma from '../shared/config/prisma'; 
import { hashPassword, comparePassword, generateToken } from './auth.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, preferredName } = req.body;
    
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

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas (Usuario no encontrado)' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas (Contraseña incorrecta)' });
    }

    // LÓGICA 2FA:
    // Si el usuario tiene activado 2FA, NO devolvemos el token completo.
    if (user.isTwoFactorEnabled) {
        // Generamos un token temporal muy corto (ej: 5 min) solo para identificarlo en el paso final.
        // O alternativamente, puedes devolver un estado pidiendo el código.
        const secret = process.env.JWT_SECRET || 'secreto_temporal';
        const tempToken = jwt.sign({ userId: user.userId, email: user.email, is2FA_pending: true }, secret, { expiresIn: '5m' });
        
        return res.status(200).json({
            message: 'Requiere 2FA',
            requires2FA: true,
            tempToken: tempToken // El frontend debe guardar esto y enviarlo con el código
        });
    }

    // Si NO tiene 2FA, sigue el flujo normal
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

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { email, preferredName } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Falta email de Google' });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: 'google_oauth_no_password', 
          preferredName: preferredName || 'Usuario de Google',
        }
      });
    }

    const token = generateToken(user.userId);

    res.status(200).json({
      message: 'Login de Google exitoso',
      token,
      user: {
        id: user.userId,
        email: user.email,
        name: user.preferredName,
      }
    });

  } catch (error) {
    console.error('Error crítico en googleLogin:', error);
    res.status(500).json({ 
        error: 'Error interno de Google Login',
        details: String(error)
    });
  }
};

// --- NUEVOS CONTROLADORES 2FA ---

// 1. Generar la semilla y el código QR para activar 2FA
export const generate2FA = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body; // En un entorno real, extraerías el userId del token decodificado de la sesión actual
        
        if (!userId) return res.status(400).json({ error: 'Falta userId' });

        const secret = speakeasy.generateSecret({
            name: `SEE_AWOS (${userId})` // Nombre que aparecerá en Google Authenticator
        });

        // Guardar el secreto en la BD (temporalmente, aún no lo activamos)
        await prisma.user.update({
            where: { userId },
            data: { twoFactorSecret: secret.base32 }
        });

        // Generar la URL del QR
        QRCode.toDataURL(secret.otpauth_url!, (err, dataUrl) => {
            if (err) {
                return res.status(500).json({ error: 'Error generando QR' });
            }
            res.json({
                secret: secret.base32,
                qrCodeUrl: dataUrl
            });
        });

    } catch (error) {
        console.error('Error generando 2FA:', error);
        res.status(500).json({ error: 'Error interno al generar 2FA' });
    }
};

// 2. Verificar el código para confirmar la activación
export const verifyAndEnable2FA = async (req: Request, res: Response) => {
    try {
        const { userId, token } = req.body;
        
        if (!userId || !token) return res.status(400).json({ error: 'Faltan datos' });

        const user = await prisma.user.findUnique({ where: { userId } });
        if (!user || !user.twoFactorSecret) return res.status(404).json({ error: 'Usuario o secreto no encontrado' });

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            await prisma.user.update({
                where: { userId },
                data: { isTwoFactorEnabled: true }
            });
            res.json({ message: '2FA activado correctamente' });
        } else {
            res.status(400).json({ error: 'Código inválido' });
        }

    } catch (error) {
        console.error('Error activando 2FA:', error);
        res.status(500).json({ error: 'Error interno al activar 2FA' });
    }
};

// 3. Paso final del Login (Verificar código 2FA y devolver Token Real)
export const verifyLogin2FA = async (req: Request, res: Response) => {
    try {
        const { tempToken, token2FA } = req.body;
        
        if (!tempToken || !token2FA) return res.status(400).json({ error: 'Faltan datos' });

        const secretEnv = process.env.JWT_SECRET || 'secreto_temporal';
        
        // Decodificar el token temporal
        let decoded: any;
        try {
            decoded = jwt.verify(tempToken, secretEnv);
        } catch (err) {
            return res.status(401).json({ error: 'Token temporal inválido o expirado' });
        }

        if (!decoded.is2FA_pending) return res.status(400).json({ error: 'Flujo de autenticación inválido' });

        const user = await prisma.user.findUnique({ where: { userId: decoded.userId } });
        if (!user || !user.twoFactorSecret) return res.status(404).json({ error: 'Usuario inválido' });

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token2FA,
            window: 1 // Permite un margen de error de +/- 30 segundos
        });

        if (verified) {
            // Generar el token final
             const token_users = jwt.sign(
                { userId: user.userId, email: user.email }, 
                secretEnv,
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
        } else {
            res.status(400).json({ error: 'Código 2FA incorrecto' });
        }

    } catch (error) {
        console.error('Error en verifyLogin2FA:', error);
        res.status(500).json({ error: 'Error interno al verificar 2FA' });
    }
};