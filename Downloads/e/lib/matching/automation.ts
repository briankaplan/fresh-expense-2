import { prisma } from '@/lib/db'
import { queueMatching } from './queue'
import { generateReport } from './analytics'

export async function setupAutomation() {
  // Schedule regular pattern analysis
  setInterval(async () => {
    const merchants = await prisma.merchantAnalytics.findMany({
      where: {
        updatedAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24h ago
        }
      }
    })

    for (const merchant of merchants) {
      const receipts = await prisma.receipt.findMany({
        where: {
          merchant: merchant.merchantName,
          matchingStatus: 'pending'
        },
        orderBy: { date: 'desc' },
        take: 100
      })

      // Queue matching jobs with priority
      for (const receipt of receipts) {
        await queueMatching({
          receiptId: receipt.id,
          priority: 1
        })
      }
    }
  }, 60 * 60 * 1000) // Every hour

  // Generate daily reports
  setInterval(async () => {
    const merchants = await prisma.merchantAnalytics.findMany()
    
    for (const merchant of merchants) {
      const report = await generateReport(merchant.merchantName, {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      })

      await prisma.merchantReports.create({
        data: {
          merchantName: merchant.merchantName,
          report,
          generatedAt: new Date()
        }
      })
    }
  }, 24 * 60 * 60 * 1000) // Daily
} 