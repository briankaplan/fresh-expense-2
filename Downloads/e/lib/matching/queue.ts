import Bull from 'bull'
import { prisma } from '@/lib/db'
import { analyzeReceipt } from './index'
import { MatchingCache } from './cache'
import { updateAnalytics } from './analytics'

const matchingQueue = new Bull('receipt-matching', process.env.REDIS_URL!)
const cache = new MatchingCache()

interface MatchingJob {
  receiptId: string
  priority?: number
}

export async function queueMatching(job: MatchingJob) {
  return matchingQueue.add(job, {
    priority: job.priority || 0,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  })
}

// Process jobs in the background
matchingQueue.process(async (job) => {
  const { receiptId } = job.data
  
  try {
    // Get receipt data
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: { items: true }
    })

    if (!receipt) throw new Error('Receipt not found')

    // Run analysis
    const results = await analyzeReceipt(receipt)
    
    // Update receipt with results
    await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        matchingResults: results,
        matchingStatus: 'completed',
        updatedAt: new Date()
      }
    })

    // Update analytics in background
    await updateAnalytics(receipt.merchant, results)

    // Invalidate relevant caches
    await cache.invalidateCache(receipt.merchant)

    return results
  } catch (error) {
    console.error('Matching job failed:', error)
    throw error
  }
}) 