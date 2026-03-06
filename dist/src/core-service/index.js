"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const crisis_routes_1 = __importDefault(require("./routes/crisis.routes"));
const capsule_routes_1 = __importDefault(require("./routes/capsule.routes"));
const victory_routes_1 = __importDefault(require("./routes/victory.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const recommendation_routes_1 = __importDefault(require("./routes/recommendation.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const s3_routes_1 = __importDefault(require("./routes/s3.routes"));
const telemetry_routes_1 = __importDefault(require("./routes/telemetry.routes"));
const catalog_routes_1 = __importDefault(require("./routes/catalog.routes"));
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
// Dominio: Funcionalidad Principal
app.use('/api/crisis', crisis_routes_1.default);
app.use('/api/capsules', capsule_routes_1.default);
app.use('/api/victories', victory_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/recommendations', recommendation_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/s3', s3_routes_1.default);
app.use('/api/telemetry', telemetry_routes_1.default);
app.use('/api/catalogs', catalog_routes_1.default);
const PORT = process.env.CORE_PORT || 3002;
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(` Core Service corriendo en: http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map