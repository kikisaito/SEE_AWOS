"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/summary', auth_middleware_1.authenticateToken, dashboard_controller_1.getDashboardSummary);
router.get('/pending-reflections', auth_middleware_1.authenticateToken, dashboard_controller_1.getPendingReflections);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map