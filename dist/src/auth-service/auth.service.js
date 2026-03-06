"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const hashPassword = async (pass) => await bcryptjs_1.default.hash(pass, 10);
exports.hashPassword = hashPassword;
const comparePassword = async (pass, hash) => await bcryptjs_1.default.compare(pass, hash);
exports.comparePassword = comparePassword;
const generateToken = (userId) => jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
exports.generateToken = generateToken;
//# sourceMappingURL=auth.service.js.map