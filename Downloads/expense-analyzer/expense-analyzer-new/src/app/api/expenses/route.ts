import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';

export async function GET() {
  try {
    const expenses = await db.expenses.getAll();
    return NextResponse.json(expenses);
  } catch (error) {
    const { statusCode, ...errorData } = handleApiError(error);
    return NextResponse.json(errorData, { status: statusCode });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const expense = await db.expenses.create(data);
    return NextResponse.json(expense);
  } catch (error) {
    const { statusCode, ...errorData } = handleApiError(error);
    return NextResponse.json(errorData, { status: statusCode });
  }
} 