"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recommendation_controller_1 = require("../controllers/recommendation.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticateToken, recommendation_controller_1.getRecommendations);
exports.default = router;
//# sourceMappingURL=recommendation.routes.js.map