"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const telemetry_controller_1 = require("../controllers/telemetry.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
// POST /api/telemetry/snapshot
router.post('/snapshot', auth_middleware_1.authenticateToken, telemetry_controller_1.exportDailySnapshot);
exports.default = router;
//# sourceMappingURL=telemetry.routes.js.map