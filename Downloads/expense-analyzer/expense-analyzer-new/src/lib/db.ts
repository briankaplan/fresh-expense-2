'use client';

import { prisma } from './prisma';
import { Expense, Receipt } from '@/types';

export const db = {
  expenses: {
    async getAll() {
      return await prisma.expense.findMany({
        orderBy: { date: 'desc' }
      });
    },

    async getById(id: string) {
      return await prisma.expense.findUnique({
        where: { id }
      });
    },

    async create(data: Omit<Expense, 'id'>) {
      return await prisma.expense.create({
        data
      });
    },

    async update(id: string, data: Partial<Expense>) {
      return await prisma.expense.update({
        where: { id },
        data
      });
    },

    async delete(id: string) {
      return await prisma.expense.delete({
        where: { id }
      });
    }
  },

  receipts: {
    async getAll() {
      return await prisma.receipt.findMany({
        orderBy: { date: 'desc' }
      });
    },

    async getById(id: string) {
      return await prisma.receipt.findUnique({
        where: { id }
      });
    },

    async create(data: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>) {
      return await prisma.receipt.create({
        data
      });
    },

    async update(id: string, data: Partial<Receipt>) {
      return await prisma.receipt.update({
        where: { id },
        data
      });
    },

    async delete(id: string) {
      return await prisma.receipt.delete({
        where: { id }
      });
    }
  }
}; 