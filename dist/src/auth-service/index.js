"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.set('trust proxy', 1);
app.use((0, helmet_1.default)());
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 15, // Límite de 150 peticiones por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Se detectó tráfico inusual desde tu conexión. Por seguridad, espera 15 minutos." }
});
app.use(globalLimiter);
// Dominio único: Auth
app.use('/api/auth', auth_routes_1.default);
const PORT = process.env.AUTH_PORT || 3001;
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(` Auth Service corriendo en: http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map