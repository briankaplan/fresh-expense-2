import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Transaction } from "../schemas/transaction.schema";

@Injectable()
export class TransactionsService {
    constructor(
        @InjectModel(Transaction.name) private transactionModel: Model<Transaction>
    ) { }

    async create(transaction: Transaction): Promise<Transaction> {
        const createdTransaction = new this.transactionModel(transaction);
        return createdTransaction.save();
    }

    async findAll(query: any = {}): Promise<Transaction[]> {
        return this.transactionModel.find(query).exec();
    }

    async findOne(id: string): Promise<Transaction> {
        const transaction = await this.transactionModel.findById(id).exec();
        if (!transaction) {
            throw new NotFoundException(`Transaction with ID ${id} not found`);
        }
        return transaction;
    }

    async update(id: string, transaction: Transaction): Promise<Transaction> {
        const updatedTransaction = await this.transactionModel
            .findByIdAndUpdate(id, transaction, { new: true })
            .exec();
        if (!updatedTransaction) {
            throw new NotFoundException(`Transaction with ID ${id} not found`);
        }
        return updatedTransaction;
    }

    async remove(id: string): Promise<Transaction> {
        const deletedTransaction = await this.transactionModel.findByIdAndDelete(id).exec();
        if (!deletedTransaction) {
            throw new NotFoundException(`Transaction with ID ${id} not found`);
        }
        return deletedTransaction;
    }
} 