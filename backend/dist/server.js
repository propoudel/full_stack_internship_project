"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const companyRoutes_1 = __importDefault(require("./routes/companyRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
// Routes
app.use("/api/v1", routes_1.default);
app.use("/api/v1/auth", authRoute_1.default);
app.use("/api/v1/companies", companyRoutes_1.default);
// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
