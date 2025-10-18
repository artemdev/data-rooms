import { useState } from 'react'

import { Trash } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'

export default function DeleteEntity({
    handleDelete,
}: {
    handleDelete: () => void
}) {
    const [isOpen, setIsOpen] = useState(false)

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
                <Trash size={16} />
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent
                    onClick={(e) => e.stopPropagation()}
                    showCloseButton={false}
                >
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this item? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            className="hover:cursor-pointer bg-red-400 text-white hover:bg-red-500"
                            onClick={() => {
                                setIsOpen(false)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer"
                            onClick={() => {
                                handleDelete()
                                setIsOpen(false)
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
