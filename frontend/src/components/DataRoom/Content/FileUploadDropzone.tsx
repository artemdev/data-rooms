import { useDropzone } from 'react-dropzone'
import { FileText, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams } from 'react-router-dom'

import type { Dispatch } from 'react'
import { type TreeAction } from '../SideBar/treeDataReducer'

export default function FileUploadDropzone({
    dispatch,
}: {
    dispatch: Dispatch<TreeAction>
}) {
    const [searchParams] = useSearchParams()

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0]

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
                    import.meta.env.VITE_API_URL + '/files/upload',
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
                        fileSize: newFile.file_size,
                        createdAt: newFile.created_at,
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
        },

        accept: {
            'application/pdf': ['.pdf'],
        },
    })

    return (
        <div
            {...getRootProps()}
            className={`
                h-[25vh] mb-8 rounded-lg border-2 border-dashed 
                transition-all duration-300 ease-in-out cursor-pointer
                flex flex-col items-center justify-center gap-4
                ${
                    isDragActive
                        ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg'
                        : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 hover:shadow-md'
                }
            `}
        >
            <input {...getInputProps()} />

            <div
                className={`
                p-4 rounded-full transition-all duration-300
                ${
                    isDragActive
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                }
            `}
            >
                {isDragActive ? (
                    <FileText className="w-12 h-12" />
                ) : (
                    <Upload className="w-12 h-12" />
                )}
            </div>

            <div className="text-center px-4">
                {isDragActive ? (
                    <p className="text-lg font-semibold text-blue-600">
                        Drop the PDF here
                    </p>
                ) : (
                    <>
                        <p className="text-lg font-semibold text-gray-700 mb-1">
                            Drag & drop PDF files here
                        </p>
                        <p className="text-sm text-gray-500">
                            or click to browse files
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}
