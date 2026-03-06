"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.status(401).json({ error: '¡Alto ahí! Necesitas iniciar sesión (Falta Token)' });
    }
    const secret = process.env.JWT_SECRET || 'secreto_temporal';
    jsonwebtoken_1.default.verify(token, secret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Tu sesión expiró o el token es falso' });
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=auth.middleware.js.map