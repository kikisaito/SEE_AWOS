"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
// MVP Simplificado
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/login', auth_controller_1.login); // Ruta duplicada para login, se puede eliminar o modificar según sea necesario, aun no borro nada pq sigo revisando los demas archivos al final hare limpiado de todo
router.post('/googleLogin', auth_controller_1.googleLogin);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map