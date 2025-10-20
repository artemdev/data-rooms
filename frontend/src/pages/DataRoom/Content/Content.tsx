import FileUploadDropzone from './FileUploadDropzone'
import PreviewFolderFiles from './PreviewFolderFiles'
import FileCard from './FileCard'

import type { DataItemTransformed } from '@/types'
import type { Dispatch } from 'react'
import { type TreeAction } from '../SideBar/treeDataReducer'

export default function Content({
    selectedEntity,
    dispatch,
}: {
    selectedEntity: DataItemTransformed | undefined
    dispatch: Dispatch<TreeAction>
    treeData: DataItemTransformed[]
}) {
    if (!selectedEntity) {
        return (
            <div className="flex-1 w-full flex items-center justify-center px-4">
                <div className="text-xl md:text-2xl font-bold text-gray-500 text-center">
                    Please select a folder or file to view
                </div>
            </div>
        )
    }

    if (!selectedEntity?.isFile) {
        return (
            <div className="w-full">
                <FileUploadDropzone dispatch={dispatch} />
                <div className="mt-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-500">
                        <PreviewFolderFiles folder={selectedEntity} />
                    </h2>
                </div>
            </div>
        )
    }

    if (selectedEntity?.isFile) {
        return (
            <div className="flex-1 w-full">
                <div className="h-full w-full flex items-center justify-center">
                    <FileCard file={selectedEntity} />
                </div>
            </div>
        )
    }
    return (
        <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-xl md:text-2xl font-bold text-gray-500 text-center">
                Please select a folder or file to view
            </div>
        </div>
    )
}
