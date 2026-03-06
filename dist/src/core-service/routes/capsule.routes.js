"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const capsule_controller_1 = require("../controllers/capsule.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/request-upload', auth_middleware_1.authenticateToken, capsule_controller_1.requestUpload);
router.post('/', auth_middleware_1.authenticateToken, capsule_controller_1.createCapsule);
router.get('/', auth_middleware_1.authenticateToken, capsule_controller_1.getCapsules);
router.get('/upload-url', auth_middleware_1.authenticateToken, capsule_controller_1.getPresignedUrl);
router.patch('/:id', auth_middleware_1.authenticateToken, capsule_controller_1.updateCapsule);
router.delete('/:id', auth_middleware_1.authenticateToken, capsule_controller_1.deleteCapsule);
exports.default = router;
//# sourceMappingURL=capsule.routes.js.map