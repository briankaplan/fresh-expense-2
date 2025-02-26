import type { DraggableLocation } from 'react-beautiful-dnd'

export interface CSVData {
  headers: string[]
  rows: string[][]
  preview: string[][]
}

export interface FieldMapping {
  field: keyof CSVHeader
  header: string | null
  confidence: number
  required: boolean
}

export interface DragResult {
  source: DraggableLocation
  destination: DraggableLocation | null
}

export interface CSVHeaderMappingProps {
  headers: string[]
  onMapping: (mapping: Record<string, string>) => void
}

export interface FieldDropZoneProps {
  mapping: FieldMapping
  suggestions: string[]
} 