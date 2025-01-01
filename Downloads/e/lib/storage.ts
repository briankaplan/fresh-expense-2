import { S3 } from 'aws-sdk'

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

export async function uploadFile(file: File, path: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: `${path}/${file.name}`,
    Body: buffer,
    ContentType: file.type,
  }

  const result = await s3.upload(params).promise()
  return result.Location
} 