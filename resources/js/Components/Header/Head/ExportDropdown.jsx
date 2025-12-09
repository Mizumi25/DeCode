import React from 'react'
import { FileCode } from 'lucide-react'
import { useHeaderStore } from '@/stores/useHeaderStore'

const ExportDropdown = ({ projectUuid, projectName, onExportStart, onExportComplete }) => {
  const { openExportModal } = useHeaderStore()

  return (
    <button
      onClick={openExportModal}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors bg-pink-100 dark:bg-pink-900/30 hover:bg-pink-200 dark:hover:bg-pink-900/50 border-pink-200 dark:border-pink-800"
    >
      <FileCode className="w-3 h-3 text-pink-600 dark:text-pink-400" />
      <span className="text-[10px] font-medium text-pink-600 dark:text-pink-400">
        Export
      </span>
    </button>
  )
}

export default ExportDropdown
