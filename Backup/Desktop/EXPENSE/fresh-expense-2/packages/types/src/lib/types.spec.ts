import { Expense, ExpenseCategory, CreateExpenseDto, User } from './types';

describe('Types', () => {
  it('should have valid Expense type', () => {
    const expense: Expense = {
      id: '1',
      amount: 100,
      description: 'Test expense',
      category: 'food',
      date: '2024-04-07',
      userId: 'user1',
      createdAt: '2024-04-07T00:00:00Z',
      updatedAt: '2024-04-07T00:00:00Z',
    };
    expect(expense).toBeDefined();
  });

  it('should have valid CreateExpenseDto type', () => {
    const dto: CreateExpenseDto = {
      amount: 100,
      description: 'Test expense',
      category: 'food',
      date: '2024-04-07',
    };
    expect(dto).toBeDefined();
  });

  it('should have valid User type', () => {
    const user: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: '2024-04-07T00:00:00Z',
      updatedAt: '2024-04-07T00:00:00Z',
    };
    expect(user).toBeDefined();
  });

  it('should have valid ExpenseCategory type', () => {
    const categories: ExpenseCategory[] = [
      'food',
      'transportation',
      'housing',
      'utilities',
      'entertainment',
      'shopping',
      'health',
      'education',
      'other',
    ];
    expect(categories).toBeDefined();
  });
});
