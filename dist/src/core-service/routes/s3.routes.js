"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const s3_controller_1 = require("../controllers/s3.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
// GET /api/s3/presigned-url
router.get('/presigned-url', auth_middleware_1.authenticateToken, s3_controller_1.getPresignedUrl);
exports.default = router;
//# sourceMappingURL=s3.routes.js.map