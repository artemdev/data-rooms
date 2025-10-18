import { useState, useRef } from 'react'
import { Pencil } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function RenameEntity({
    renameHandle,
}: {
    renameHandle: (data: { name: string }) => Promise<void>
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        renameHandle({ name })

        setIsOpen(false)
        setName('')
    }

    return (
        <>
            <div
                onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(true)
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="cursor-pointer hover:scale-110 transition-all duration-200 hover:text-yellow-500"
            >
                <Pencil size={16} />
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent
                    onClick={(e) => e.stopPropagation()}
                    showCloseButton={false}
                >
                    <DialogHeader>
                        <DialogTitle>Edit Name</DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            handleSubmit(e)
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4">
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Name
                            </label>
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
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                className="hover:cursor-pointer bg-red-400 text-white hover:bg-red-500"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    handleSubmit(e)
                                }}
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
