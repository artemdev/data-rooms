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
            <div className="flex flex-col items-center justify-center gap-4">
                <FolderOpen size={80} className="text-gray-400" />
                <p className="text-xl text-gray-500 font-medium">
                    Folder is empty, please add a file.
                </p>
            </div>
        )
    }

    return (
        <div className="flex gap-6 flex-wrap">
            {folder.children.map((file: DataItemTransformed) => {
                if (!file.isFile) {
                    return
                }

                return <FileCard key={file.id} file={file} />
            })}
        </div>
    )
}
