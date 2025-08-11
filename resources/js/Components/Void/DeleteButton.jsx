import React from 'react'
import { Trash2 } from 'lucide-react'

export default function DeleteButton() {
  return (
    <div className="fixed left5 bottom-8 z-30">
      <div className="flex flex-col items-center group">
        <button
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-1"
          style={{
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)'
          }}
        >
          <Trash2 className="w-6 h-6 text-white" />
        </button>
        <span 
          className="mt-2 text-xs font-medium opacity-70 group-hover:opacity-100 transition-opacity duration-300 text-center bg-black bg-opacity-70 text-white px-2 py-1 rounded"
        >
          Delete
        </span>
      </div>
    </div>
  )
}