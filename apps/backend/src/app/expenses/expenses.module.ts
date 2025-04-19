import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ExpensesController } from "./expenses.controller";
import { ExpensesService } from "./expenses.service";
import { Budget, BudgetSchema } from "./schemas/budget.schema";
import { Expense, ExpenseSchema } from "./schemas/expense.schema";

export class ExpensesModule {}
