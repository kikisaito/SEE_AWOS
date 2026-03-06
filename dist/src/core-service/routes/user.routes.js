"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
// GET /api/users/profile
router.get('/profile', user_controller_1.getProfile);
// PUT /api/users/profile
router.put('/profile', user_controller_1.updateProfile);
// DELETE /api/users/profile
router.delete('/profile', user_controller_1.deleteAccount);
exports.default = router;
//# sourceMappingURL=user.routes.js.map