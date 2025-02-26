import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tooltip } from '../ui/tooltip'
import { 
  ArrowRight, Wand2, AlertCircle, CheckCircle2, 
  GripHorizontal, ArrowLeftRight 
} from 'lucide-react'
import type { CSVHeader } from '@/lib/validation'
import type { 
  FieldMapping, 
  DragResult, 
  CSVHeaderMappingProps,
  FieldDropZoneProps 
} from '@/types/csv'

const FIELD_DESCRIPTIONS: Record<keyof CSVHeader, string> = {
  date: 'When the expense occurred',
  amount: 'How much was spent',
  description: 'What the expense was for',
  category: 'Type of expense',
  merchant: 'Where the expense occurred',
  receipt: 'Link to receipt image'
}

export function CSVHeaderMapping({ headers, onMapping }: CSVHeaderMappingProps) {
  const [mappings, setMappings] = useState<FieldMapping[]>([])
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({})
  const [unmappedHeaders, setUnmappedHeaders] = useState<string[]>([])

  // Initialize with required fields first, then optional
  useEffect(() => {
    const initial: FieldMapping[] = [
      { field: 'date', header: null, confidence: 0, required: true },
      { field: 'amount', header: null, confidence: 0, required: true },
      { field: 'description', header: null, confidence: 0, required: true },
      { field: 'category', header: null, confidence: 0, required: false },
      { field: 'merchant', header: null, confidence: 0, required: false },
      { field: 'receipt', header: null, confidence: 0, required: false },
    ]
    setMappings(initial)
    setUnmappedHeaders(headers)
    generateSuggestions(headers, initial)
  }, [headers])

  const generateSuggestions = (headers: string[], fields: FieldMapping[]) => {
    const newSuggestions: Record<string, string[]> = {}
    
    fields.forEach(({ field }) => {
      const suggestions = headers.map(header => ({
        header,
        score: calculateMatchScore(field, header)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.header)
      
      newSuggestions[field] = suggestions
    })

    setSuggestions(newSuggestions)
  }

  const calculateMatchScore = (field: string, header: string): number => {
    const normalizedHeader = header.toLowerCase()
    const normalizedField = field.toLowerCase()
    
    // Direct match
    if (normalizedHeader === normalizedField) return 1
    // Contains field name
    if (normalizedHeader.includes(normalizedField)) return 0.8
    // Field name contains header
    if (normalizedField.includes(normalizedHeader)) return 0.6
    
    // Specific field matches
    switch (field) {
      case 'date':
        if (/date|when|time/i.test(header)) return 0.7
        break
      case 'amount':
        if (/amount|cost|price|paid|payment|\$|sum|total/i.test(header)) return 0.7
        break
      case 'description':
        if (/desc|what|item|detail|name/i.test(header)) return 0.7
        break
      case 'merchant':
        if (/merchant|vendor|store|where|shop|business/i.test(header)) return 0.7
        break
    }
    
    return 0
  }

  const handleDragEnd = (result: DragResult) => {
    if (!result.destination) return

    const { source, destination } = result
    
    // Update mappings
    const newMappings = [...mappings]
    const targetField = newMappings.find(m => m.field === destination.droppableId)
    if (targetField) {
      const headerValue = source.droppableId === 'unmapped' 
        ? unmappedHeaders[source.index]
        : mappings.find(m => m.field === source.droppableId)?.header

      if (headerValue) {
        // Remove from previous mapping if exists
        newMappings.forEach(m => {
          if (m.header === headerValue) {
            m.header = null
            m.confidence = 0
          }
        })

        // Add to new mapping
        targetField.header = headerValue
        targetField.confidence = calculateMatchScore(targetField.field, headerValue)

        setMappings(newMappings)
        updateUnmappedHeaders(newMappings)
        
        // Call onMapping with updated mappings
        const validMappings = newMappings
          .filter((m): m is FieldMapping & { header: string } => m.header !== null)
          .reduce((acc, { field, header }) => ({
            ...acc,
            [field]: header
          }), {} as Record<string, string>)
        onMapping(validMappings)
      }
    }
  }

  const updateUnmappedHeaders = (currentMappings: FieldMapping[]) => {
    const mapped = new Set(currentMappings.map(m => m.header).filter(Boolean))
    setUnmappedHeaders(headers.filter(h => !mapped.has(h)))
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-8">
        {/* Smart Mapping Button */}
        <motion.div 
          className="flex justify-center"
          whileHover={{ scale: 1.02 }}
        >
          <button
            onClick={() => {/* Auto-map using suggestions */}}
            className="group flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full hover:bg-primary/10 transition-colors"
          >
            <Wand2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Auto-map Fields</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Required Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Required Fields
              <Badge variant="destructive" className="text-xs">Must Map</Badge>
            </h3>
            {mappings.filter(m => m.required).map((mapping) => (
              <FieldDropZone
                key={mapping.field}
                mapping={mapping}
                suggestions={suggestions[mapping.field]}
              />
            ))}
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Optional Fields
              <Badge variant="secondary" className="text-xs">Nice to Have</Badge>
            </h3>
            {mappings.filter(m => !m.required).map((mapping) => (
              <FieldDropZone
                key={mapping.field}
                mapping={mapping}
                suggestions={suggestions[mapping.field]}
              />
            ))}
          </div>
        </div>

        {/* Unmapped Headers */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Available Columns</h3>
          <Droppable droppableId="unmapped" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-wrap gap-2"
              >
                <AnimatePresence>
                  {unmappedHeaders.map((header, index) => (
                    <Draggable key={header} draggableId={header} index={index}>
                      {(provided) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="px-3 py-1.5 bg-muted rounded-full text-sm font-medium cursor-grab active:cursor-grabbing"
                        >
                          {header}
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </DragDropContext>
  )
}

function FieldDropZone({ mapping, suggestions }: FieldDropZoneProps) {
  return (
    <Droppable droppableId={mapping.field}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`p-4 transition-colors ${
            snapshot.isDraggingOver ? 'bg-primary/5' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Tooltip content={FIELD_DESCRIPTIONS[mapping.field]}>
              <h4 className="text-sm font-medium cursor-help">
                {mapping.field.charAt(0).toUpperCase() + mapping.field.slice(1)}
              </h4>
            </Tooltip>
            {mapping.header && (
              <Badge variant="outline" className="text-xs">
                {Math.round(mapping.confidence * 100)}% match
              </Badge>
            )}
          </div>

          {mapping.header ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-2 bg-primary/5 rounded-md"
            >
              <GripHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{mapping.header}</span>
              <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
            </motion.div>
          ) : (
            <div className="border-2 border-dashed rounded-md p-4 text-center text-muted-foreground">
              <ArrowLeftRight className="w-4 h-4 mx-auto mb-2" />
              <p className="text-sm">Drag a column here</p>
              {suggestions.length > 0 && (
                <div className="mt-2 text-xs">
                  Suggestions: {suggestions.join(', ')}
                </div>
              )}
            </div>
          )}
          {provided.placeholder}
        </Card>
      )}
    </Droppable>
  )
} 