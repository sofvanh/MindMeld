"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the MindMeld backend!' });
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
