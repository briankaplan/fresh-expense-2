import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { uploadToStorage } from '@/lib/storage'; // You'll need to implement this

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable();
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload the file to your storage service (e.g., S3, Cloud Storage)
    const url = await uploadToStorage(file);

    return res.status(200).json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
} 