import { FolderOpen } from 'lucide-react'
import FileCard from './FileCard'

import type { DataItemTransformed } from '@/types'

export default function PreviewFolderFiles({
    folder,
}: {
    folder: DataItemTransformed | undefined
}) {
    if (!folder?.children) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
                <FolderOpen size={60} className="text-gray-400 sm:size-20" />
                <p className="text-base sm:text-xl text-gray-500 font-medium text-center px-4">
                    Folder is empty, please add a file.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {folder.children.map((file: DataItemTransformed) => {
                if (!file.isFile) {
                    return
                }

                return <FileCard key={file.id} file={file} />
            })}
        </div>
    )
}
