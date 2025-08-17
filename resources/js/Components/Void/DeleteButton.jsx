import React from 'react'
import { Trash2 } from 'lucide-react'

export default function DeleteButton() {
  return (
    <div className="fixed left-4 bottom-6 z-30">
      <div className="flex flex-col items-center group">
        <button
          className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-1"
          style={{
            boxShadow: '0 3px 15px rgba(239, 68, 68, 0.3)'
          }}
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
        <span 
          className="mt-1.5 text-xs font-medium opacity-60 group-hover:opacity-100 transition-opacity duration-300 text-center bg-black bg-opacity-70 text-white px-1.5 py-0.5 rounded text-[9px]"
        >
          Delete
        </span>
      </div>
    </div>
  )
}