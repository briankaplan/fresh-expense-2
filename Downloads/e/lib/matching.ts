interface MatchCriteria {
  amount: number
  date: Date
  merchant?: string
  tolerance?: number // Amount tolerance in percentage
  daysTolerance?: number // Date matching tolerance in days
}

export async function findMatchingStatementEntry(
  criteria: MatchCriteria,
  prisma: any
) {
  const {
    amount,
    date,
    merchant,
    tolerance = 0.01, // 1% default tolerance
    daysTolerance = 3 // 3 days default tolerance
  } = criteria

  // Calculate amount range with tolerance
  const minAmount = amount * (1 - tolerance)
  const maxAmount = amount * (1 + tolerance)

  // Calculate date range
  const startDate = new Date(date)
  startDate.setDate(startDate.getDate() - daysTolerance)
  const endDate = new Date(date)
  endDate.setDate(endDate.getDate() + daysTolerance)

  // Find matching entries
  const matches = await prisma.statementEntry.findMany({
    where: {
      AND: [
        {
          amount: {
            gte: minAmount,
            lte: maxAmount
          }
        },
        {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        {
          receipt: null // Only match entries without receipts
        },
        merchant ? {
          description: {
            contains: merchant,
            mode: 'insensitive'
          }
        } : {}
      ]
    },
    orderBy: [
      {
        date: 'asc'
      }
    ]
  })

  return matches
} 