import { toast } from 'sonner'
import FileUploadDropzone from './FileUploadDropzone'
import PreviewFolderFiles from './PreviewFolderFiles'
import { type TreeAction } from '../SideBar/treeDataReducer'
import { useSearchParams } from 'react-router-dom'

import type { DataItemTransformed } from '@/types'
import type { Dispatch } from 'react'
import FileCard from './FileCard'

export default function Content({
    selectedEntity,
    dispatch,
}: {
    selectedEntity: DataItemTransformed | undefined
    dispatch: Dispatch<TreeAction>
    treeData: DataItemTransformed[]
}) {
    const [searchParams] = useSearchParams()

    if (!selectedEntity) {
        return (
            <div className="flex-1 w-full flex items-center justify-center">
                <div className="text-2xl font-bold text-gray-500">
                    Please select a folder or file to view
                </div>
            </div>
        )
    }

    if (!selectedEntity?.isFile) {
        return (
            <div>
                <FileUploadDropzone
                    uploadFile={async (file) => {
                        const folderId = searchParams.get('folderId')

                        if (!folderId) {
                            toast.error('Please select a folder first')
                            return
                        }

                        const formData = new FormData()
                        formData.append('file', file)
                        formData.append('name', file.name)
                        formData.append('folder_id', folderId)

                        try {
                            const response = await fetch(
                                import.meta.env.VITE_API_URL + '/files/upload/',
                                {
                                    method: 'POST',
                                    body: formData,
                                }
                            )

                            if (!response.ok) {
                                const error = await response.json()
                                throw new Error(error.detail)
                            }

                            const newFile = await response.json()

                            dispatch({
                                type: 'ADD',
                                parentId: folderId,
                                item: {
                                    id: newFile.id,
                                    name: newFile.name,
                                    description: newFile.description || '',
                                    isFile: true,
                                    contentType: newFile.content_type,
                                    file_size: newFile.file_size,
                                },
                            })

                            toast.success('File uploaded successfully')
                        } catch (error) {
                            toast.error('Failed to upload file,', {
                                description:
                                    error instanceof Error
                                        ? error.message
                                        : 'Unknown error',
                            })
                        }
                    }}
                />
                <div className="">
                    <h2 className="text-3xl font-bold text-gray-500">
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
        <div className="flex-1 flex items-center justify-center">
            <div className="text-2xl font-bold text-gray-500">
                Please select a folder or file to view
            </div>
        </div>
    )
}
