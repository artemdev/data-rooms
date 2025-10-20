import { useState, useRef, type Dispatch } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { type TreeAction } from './treeDataReducer'

export default function AddFolder({
    dispatch,
}: {
    dispatch: Dispatch<TreeAction>
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const { id } = useParams()
    const [searchParams] = useSearchParams()

    async function handleCreateFolder() {
        try {
            const response = await fetch(
                import.meta.env.VITE_API_URL + '/folders',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name,
                        data_room_id: id,
                        parent_folder_id: searchParams.get('folderId'),
                    }),
                }
            )

            if (!response.ok) {
                const error = await response.json()

                throw new Error(error.detail)
            }

            const newFolder = await response.json()

            dispatch({
                type: 'ADD',
                parentId: searchParams.get('folderId'),
                item: {
                    id: newFolder.id,
                    name: newFolder.name,
                    description: newFolder.description || '',
                    children: [],
                    isFile: false,
                    contentType: 'folder',
                },
            })

            toast.success('Folder created')

            setIsOpen(false)
        } catch (error: unknown) {
            toast.error('Failed to create folder', {
                description:
                    error instanceof Error ? error.message : 'Unknown error',
            })

            return
        }
    }

    return (
        <div className="cursor-pointer hover:scale-110 transition-all duration-200 hover:text-yellow-500 flex items-center justify-center gap-2">
            <div
                onClick={() => {
                    setIsOpen(true)
                }}
            >
                Add Folder
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent
                    onClick={(e) => e.stopPropagation()}
                    showCloseButton={false}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <DialogHeader>
                        <DialogTitle>Create new folder</DialogTitle>
                        <input
                            ref={inputRef}
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setName(e.target.value)
                            }}
                            onKeyDown={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            placeholder="Enter new name"
                        />
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            className="hover:cursor-pointer bg-red-400 text-white hover:bg-red-500"
                            onClick={(e) => {
                                e.stopPropagation()
                                setIsOpen(false)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleCreateFolder()
                            }}
                        >
                            Create Folder
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
