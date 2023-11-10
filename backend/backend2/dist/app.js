"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// app.ts
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
app.get('/', (req, res) => {
    res.send('Hello, World! This is a TypeScript app running on Google Cloud Run.');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
