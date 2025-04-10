import express from 'express';
import cors from 'cors';
import { connectToDb } from './db';
import { setupDb } from './db/setup';
import transactionsRouter from './routes/transactions';
import expensesRouter from './routes/expenses';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize MongoDB connection and setup
Promise.all([
  connectToDb(),
  setupDb()
]).catch(console.error);

// Register routes
app.use('/api/transactions', transactionsRouter);
app.use('/api/expenses', expensesRouter);

export default app; 