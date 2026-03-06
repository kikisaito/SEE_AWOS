"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const report_routes_1 = __importDefault(require("./report.routes"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.set('trust proxy', 1);
app.use((0, helmet_1.default)());
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 150, // Límite de 150 peticiones por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Se detectó tráfico inusual desde tu conexión. Por seguridad, espera 15 minutos." }
});
app.use(globalLimiter);
// Dominio: Reportes
app.use('/api/reports', report_routes_1.default);
const PORT = process.env.REPORT_PORT || 3003;
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(` Report Service corriendo en: http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map