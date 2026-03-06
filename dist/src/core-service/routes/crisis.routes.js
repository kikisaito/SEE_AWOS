"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crisis_controller_1 = require("../controllers/crisis.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authenticateToken, crisis_controller_1.startCrisis);
router.put('/:id/end', auth_middleware_1.authenticateToken, crisis_controller_1.updateCrisis);
router.patch('/:id/progress', auth_middleware_1.authenticateToken, crisis_controller_1.updateCrisisProgress);
router.put('/:id/reflection', auth_middleware_1.authenticateToken, crisis_controller_1.saveCrisisReflection);
exports.default = router;
//# sourceMappingURL=crisis.routes.js.map