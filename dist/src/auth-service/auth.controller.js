"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = exports.login = exports.register = void 0;
const prisma_1 = __importDefault(require("../shared/config/prisma"));
const auth_service_1 = require("./auth.service");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = async (req, res) => {
    try {
        const { email, password, preferredName } = req.body;
        if (!email || !password || !preferredName) {
            return res.status(400).json({ error: 'Faltan datos: email, password o preferredName' });
        }
        const userExists = await prisma_1.default.user.findUnique({ where: { email } });
        if (userExists)
            return res.status(400).json({ error: 'El usuario ya existe' });
        const hashedPassword = await (0, auth_service_1.hashPassword)(password);
        const user = await prisma_1.default.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                preferredName
            }
        });
        const token = (0, auth_service_1.generateToken)(user.userId);
        res.status(201).json({ token, userId: user.userId });
    }
    catch (error) {
        console.error("ERROR CRÍTICO EN REGISTER:", error);
        res.status(500).json({
            error: 'Error interno al registrar usuario',
            details: String(error)
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.default.user.findUnique({
            where: { email: email },
        });
        // Usamos la misma instancia 'prisma' importada
        const users_find = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas (Usuario no encontrado)' });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas (Contraseña incorrecta)' });
        }
        const secret = process.env.JWT_SECRET || 'secreto_temporal';
        const token_users = jsonwebtoken_1.default.sign({ userId: user.userId, email: user.email }, secret, { expiresIn: '24h' });
        res.json({
            message: 'Login exitoso',
            token: token_users,
            user: {
                id: user.userId,
                email: user.email,
                name: user.preferredName
            }
        });
    }
    catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.login = login;
const googleLogin = async (req, res) => {
    try {
        const { email, preferredName } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Falta email de Google' });
        }
        let user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma_1.default.user.create({
                data: {
                    email,
                    passwordHash: 'google_oauth_no_password',
                    preferredName: preferredName || 'Usuario de Google',
                }
            });
        }
        const token = (0, auth_service_1.generateToken)(user.userId);
        res.status(200).json({
            message: 'Login de Google exitoso',
            token,
            user: {
                id: user.userId,
                email: user.email,
                name: user.preferredName,
            }
        });
    }
    catch (error) {
        console.error('Error crítico en googleLogin:', error);
        res.status(500).json({
            error: 'Error interno de Google Login',
            details: String(error)
        });
    }
};
exports.googleLogin = googleLogin;
//# sourceMappingURL=auth.controller.js.map