export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      statusCode: 500
    };
  }

  return {
    error: 'An unexpected error occurred',
    statusCode: 500
  };
} 