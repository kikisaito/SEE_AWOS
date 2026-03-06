"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catalog_controller_1 = require("../controllers/catalog.controller");
const router = (0, express_1.Router)();
router.get('/emotions', catalog_controller_1.getEmotions);
router.get('/evaluations', catalog_controller_1.getEvaluations);
exports.default = router;
//# sourceMappingURL=catalog.routes.js.map