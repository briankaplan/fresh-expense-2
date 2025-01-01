'use client'

import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Tag {
  id: string
  name: string
  color: string
}

interface TagInputProps {
  tags: Tag[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tagId: string) => void
}

export function TagInput({ tags, onAddTag, onRemoveTag }: TagInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onAddTag(input.trim())
      setInput('')
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add tag..."
          className="flex-1"
        />
        <Button type="submit" variant="outline" size="sm">
          Add
        </Button>
      </form>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm"
            style={{ backgroundColor: tag.color + '20' }}
          >
            {tag.name}
            <button
              onClick={() => onRemoveTag(tag.id)}
              className="hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
} 