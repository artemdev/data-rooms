import { downloadFile } from './utils'
import { FileText, FileType, Calendar, HardDrive } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { DataItemTransformed } from '@/types'

export default function FileCard({ file }: { file: DataItemTransformed }) {
    const fileFormat = file.contentType

    return (
        <div className="w-1/3 min-w-[300px] max-w-[500px] flex flex-col border-2 border-gray-300 rounded-lg p-8 shadow-lg bg-white">
            <div className="flex flex-col items-center gap-4 mb-6">
                <FileText size={80} className="text-gray-400" />

                <h2 className="text-2xl font-semibold text-gray-800 text-center break-words">
                    {file.name}
                </h2>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 mb-6 flex-1">
                <div className="flex items-center gap-3 text-gray-600">
                    <FileType size={20} />

                    <span className="text-sm">
                        <span className="font-medium">Format:</span>
                        {fileFormat}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                    <HardDrive size={20} />

                    <span className="text-sm">
                        <span className="font-medium">Size:</span>
                        {formatSize(file.file_size)}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                    <Calendar size={20} />
                    <span className="text-sm">
                        <span className="font-medium">Created:</span>{' '}
                        {formatDate(file.created_at)}
                    </span>
                </div>
            </div>

            <Button
                size="lg"
                className="w-full mt-auto cursor-pointer"
                onClick={() => downloadFile(file.id)}
            >
                Download File
            </Button>
        </div>
    )
}

function formatSize(sizeInKB?: number): string {
    if (!sizeInKB) {
        return 'Unknown size'
    }

    const sizeInMB = sizeInKB / 1024 / 1024
    return `${sizeInMB.toFixed(2)} MB`
}

function formatDate(dateString?: string): string {
    if (!dateString) {
        return 'Unknown date'
    }

    const date = new Date(dateString)

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
