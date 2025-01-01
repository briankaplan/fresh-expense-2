import { Ai } from '@cloudflare/ai'

const ai = new Ai(process.env.CLOUDFLARE_AI_TOKEN!)

interface ExtractedReceipt {
  merchant: {
    name: string
    category: string
    confidence: number
  }
  transaction: {
    total: number
    tax?: number
    tip?: number
    paymentMethod?: string
    currency: string
    date: string
  }
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
    category?: string
  }>
  metadata: {
    receiptType: string
    confidence: number
    fraudProbability: number
    qualityScore: number
    warnings: string[]
  }
}

export async function extractReceiptData(imageUrl: string) {
  try {
    // Download image from URL
    const response = await fetch(imageUrl)
    const imageBuffer = await response.arrayBuffer()

    // Parallel processing with different models
    const [
      ocrResult,
      imageAnalysis,
      fraudDetection
    ] = await Promise.all([
      // Basic OCR
      ai.run('@cf/ocr', { image: imageBuffer }),
      
      // Image quality and authenticity analysis
      ai.run('@cf/image-classification', { image: imageBuffer }),
      
      // Fraud detection model
      ai.run('@cf/image-classification', {
        image: imageBuffer,
        model: 'fraud-detection'
      })
    ])

    // Enhanced prompt for better extraction
    const extractionPrompt = `
      Analyze this receipt and extract the following information in JSON format:
      
      Receipt Text:
      ${ocrResult.text}
      
      Requirements:
      1. Identify the merchant name and categorize the business type
      2. Extract all line items with quantities and prices
      3. Calculate total amount, tax, and tip if present
      4. Detect currency and payment method
      5. Identify any special offers or discounts
      6. Flag any suspicious patterns or inconsistencies
      7. Categorize each line item
      
      Format the response as valid JSON matching the ExtractedReceipt interface.
    `

    // Use Llama 2 for intelligent extraction
    const extracted = await ai.run('@cf/llm', {
      prompt: extractionPrompt,
      model: '@cf/meta/llama-2-7b-chat-int8'
    })

    // Validate amounts and dates
    const validationPrompt = `
      Verify the following aspects of this receipt:
      1. Do the line items sum up to the total?
      2. Is the tax calculation correct?
      3. Is the date recent and valid?
      4. Are the prices reasonable for these items?
      5. Are there any duplicate items?
      
      Receipt Data:
      ${extracted.response}
      
      Provide a list of warnings if any issues are found.
    `

    const validation = await ai.run('@cf/llm', {
      prompt: validationPrompt,
      model: '@cf/meta/llama-2-7b-chat-int8'
    })

    // Calculate quality and confidence scores
    const qualityScore = calculateQualityScore({
      imageQuality: imageAnalysis.confidence,
      ocrConfidence: ocrResult.confidence,
      fraudScore: fraudDetection.confidence,
      validationWarnings: validation.response
    })

    // Combine and structure all results
    const parsedData = JSON.parse(extracted.response)
    return {
      ...parsedData,
      metadata: {
        ...parsedData.metadata,
        qualityScore,
        fraudProbability: fraudDetection.confidence,
        warnings: parseWarnings(validation.response)
      }
    }
  } catch (error) {
    console.error('Cloudflare AI processing error:', error)
    throw error
  }
}

function calculateQualityScore(params: {
  imageQuality: number
  ocrConfidence: number
  fraudScore: number
  validationWarnings: string
}): number {
  const {
    imageQuality,
    ocrConfidence,
    fraudScore,
    validationWarnings
  } = params

  // Base score from image quality and OCR confidence
  let score = (imageQuality + ocrConfidence) / 2

  // Reduce score based on fraud probability
  score *= (1 - fraudScore)

  // Reduce score for each validation warning
  const warningCount = (validationWarnings.match(/warning/gi) || []).length
  score *= Math.max(0, 1 - (warningCount * 0.1))

  return Math.round(score * 100) / 100
}

function parseWarnings(validationResponse: string): string[] {
  // Extract warnings from validation response
  const warnings: string[] = []
  const lines = validationResponse.split('\n')
  
  for (const line of lines) {
    if (line.toLowerCase().includes('warning') || 
        line.toLowerCase().includes('error') ||
        line.toLowerCase().includes('issue')) {
      warnings.push(line.trim())
    }
  }

  return warnings
} 