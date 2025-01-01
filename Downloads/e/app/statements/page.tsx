'use client'

import { FileUpload } from '@/components/ui/file-upload'

export default function StatementsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Statements</h1>
      <div className="rounded-lg border">
        <div className="p-4">
          <h2 className="font-semibold mb-4">Upload Statement</h2>
          <FileUpload 
            endpoint="/api/statements/upload"
            onUploadComplete={(data) => {
              console.log('Upload complete:', data)
              // Add success notification here
            }}
          />
        </div>
      </div>
    </div>
  )
} 