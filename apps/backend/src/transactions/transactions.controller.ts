import { Controller, Get, Post, Body, Put, Param, Delete, Query } from "@nestjs/common";

import { TransactionsService } from "./transactions.service";
import { Transaction } from "../schemas/transaction.schema";

@Controller("transactions")
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    async create(@Body() transaction: Transaction) {
        return this.transactionsService.create(transaction);
    }

    @Get()
    async findAll(@Query() query: any) {
        return this.transactionsService.findAll(query);
    }

    @Get(":id")
    async findOne(@Param("id") id: string) {
        return this.transactionsService.findOne(id);
    }

    @Put(":id")
    async update(@Param("id") id: string, @Body() transaction: Transaction) {
        return this.transactionsService.update(id, transaction);
    }

    @Delete(":id")
    async remove(@Param("id") id: string) {
        return this.transactionsService.remove(id);
    }
} 