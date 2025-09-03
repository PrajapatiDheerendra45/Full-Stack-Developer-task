import dotenv from "dotenv";
// import app from "../a"

import { connectDB } from "./config/db.js";

import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));

connectDB();

dotenv.config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server Connected Successfully..!${PORT}`));
