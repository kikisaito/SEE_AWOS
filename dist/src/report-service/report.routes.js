"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("./report.controller");
const auth_middleware_1 = require("../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/clinical', auth_middleware_1.authenticateToken, report_controller_1.generateClinicalReport);
exports.default = router;
//# sourceMappingURL=report.routes.js.map