import cors from "cors";
import express from "express";

import { setupDb } from "./db/setup";
import { connectToDb } from "./db";
import expensesRouter from "./routes/expenses";
import transactionsRouter from "./routes/transactions";

const app = express();

app.use(cors());
app.use(express.json());

// Initialize MongoDB connection and setup
Promise.all([connectToDb(), setupDb()]).catch(console.error);

// Register routes
app.use("/api/transactions", transactionsRouter);
app.use("/api/expenses", expensesRouter);

export default app;
