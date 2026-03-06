"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const victory_controller_1 = require("../controllers/victory.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/types', auth_middleware_1.authenticateToken, victory_controller_1.getVictoryTypes);
router.post('/', auth_middleware_1.authenticateToken, victory_controller_1.registerVictories);
exports.default = router;
//# sourceMappingURL=victory.routes.js.map