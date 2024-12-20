'use client';

import { useState } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { format } from 'date-fns';
import { Receipt, Upload, Briefcase, User, GripVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Expense } from '@prisma/client';

interface ExpenseTableProps {
  expenses: Array<Expense>;
  onUploadReceipt: (expenseId: string, file: File) => Promise<void>;
  onUpdateExpense: (expenseId: string, update: Partial<Expense>) => Promise<void>;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  onUploadReceipt,
  onUpdateExpense,
}) => {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const dragControls = useDragControls();

  const handleFileChange = async (expenseId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingId(expenseId);
      await onUploadReceipt(expenseId, file);
    } catch (error) {
      console.error('Failed to upload receipt:', error);
    } finally {
      setUploadingId(null);
    }
  };

  const handleExpenseTypeChange = async (expenseId: string, type: 'business' | 'personal') => {
    try {
      await onUpdateExpense(expenseId, { expenseType: type });
      toast.success(`Marked as ${type}`);
    } catch (error) {
      toast.error('Failed to update expense type');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, expenseId: string) => {
    if (e.key === 'b') {
      handleExpenseTypeChange(expenseId, 'business');
    } else if (e.key === 'p') {
      handleExpenseTypeChange(expenseId, 'personal');
    }
  };

  const handleDragStart = (expenseId: string) => {
    setDraggedId(expenseId);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent) => {
    if (!draggedId) return;

    // Get drop zone elements
    const businessZone = document.getElementById('business-drop-zone');
    const personalZone = document.getElementById('personal-drop-zone');

    // Get pointer position
    const { clientX, clientY } = 'touches' in event 
      ? event.touches[0] 
      : event;

    // Check which zone we're over
    if (businessZone?.getBoundingClientRect().contains(clientX, clientY)) {
      handleExpenseTypeChange(draggedId, 'business');
    } else if (personalZone?.getBoundingClientRect().contains(clientX, clientY)) {
      handleExpenseTypeChange(draggedId, 'personal');
    }

    setDraggedId(null);
  };

  return (
    <div className="relative bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Drop Zones */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="flex h-full">
          <div
            id="business-drop-zone"
            className={`w-1/2 border-r border-dashed transition-colors ${
              draggedId ? 'border-blue-400 bg-blue-50/50' : 'border-transparent'
            }`}
          />
          <div
            id="personal-drop-zone"
            className={`w-1/2 border-l border-dashed transition-colors ${
              draggedId ? 'border-green-400 bg-green-50/50' : 'border-transparent'
            }`}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receipt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => (
              <Reorder.Item
                key={expense.id}
                value={expense}
                dragListener={false}
                dragControls={dragControls}
                onDragStart={() => handleDragStart(expense.id)}
                onDragEnd={handleDragEnd}
                as={motion.tr}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                tabIndex={0}
                onKeyDown={(e) => handleKeyPress(e, expense.id)}
                onClick={() => setSelectedId(expense.id)}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedId === expense.id ? 'bg-blue-50' : ''
                } ${draggedId === expense.id ? 'opacity-50' : ''}`}
              >
                <td className="w-8 px-2 py-4">
                  <div
                    className="cursor-move"
                    onPointerDown={(e) => dragControls.start(e)}
                  >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(expense.date), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {expense.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${expense.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {expense.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    expense.status === 'matched'
                      ? 'bg-green-100 text-green-800'
                      : expense.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {expense.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {expense.hasReceipt ? (
                    <Receipt className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(expense.id, e)}
                        className="hidden"
                        id={`receipt-${expense.id}`}
                      />
                      <label
                        htmlFor={`receipt-${expense.id}`}
                        className="cursor-pointer flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload</span>
                      </label>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExpenseTypeChange(expense.id, 'business');
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        expense.expenseType === 'business' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'hover:bg-gray-100 text-gray-400'
                      }`}
                      title="Mark as business expense (B)"
                    >
                      <Briefcase className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExpenseTypeChange(expense.id, 'personal');
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        expense.expenseType === 'personal' 
                          ? 'bg-green-100 text-green-600' 
                          : 'hover:bg-gray-100 text-gray-400'
                      }`}
                      title="Mark as personal expense (P)"
                    >
                      <User className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </Reorder.Item>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visual feedback while dragging */}
      {draggedId && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-4">
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Briefcase className="w-4 h-4" />
              <span>Drop for Business</span>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="flex items-center gap-2 text-green-600">
              <User className="w-4 h-4" />
              <span>Drop for Personal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 