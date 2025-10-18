import { toast } from 'sonner'
import { Files } from 'lucide-react'

import RenameEntity from './RenameEntity'
import DeleteEntity from './DeleteEntity'
import { Folder } from 'lucide-react'
import { type TreeAction } from './treeDataReducer'

import type { NodeApi } from 'react-arborist'
import type { DataItemTransformed } from '@/types'
import { useSearchParams } from 'react-router-dom'
import type { Dispatch } from 'react'

export default function Node({
    node,
    style,
    dragHandle,
    deleteHandle,
    dispatch,
}: {
    node: NodeApi<DataItemTransformed>
    style: React.CSSProperties
    dragHandle?: (el: HTMLDivElement | null) => void
    deleteHandle: (node: NodeApi<DataItemTransformed>) => void
    dispatch: Dispatch<TreeAction>
}) {
    const [searchParams] = useSearchParams()

    return (
        <div
            style={style}
            ref={dragHandle}
            className={`text-start flex items-center gap-2  text-gray-200 hover:cursor-pointer ${
                node.data.id === searchParams.get('folderId')
                    ? 'bg-gray-700'
                    : ''
            }`}
        >
            {node.data.isFile ? (
                <>
                    <Files size={16} />
                    <span className="truncate max-w-[150px]">
                        {node.data.name}
                    </span>
                    <RenameEntity
                        renameHandle={async function ({ name }) {
                            const res = await fetch(
                                import.meta.env.VITE_API_URL +
                                    '/files/' +
                                    node.data.id,
                                {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ name }),
                                }
                            )

                            if (!res.ok) {
                                toast.error(
                                    'Some error happened, file was not renamed.'
                                )
                                return
                            }

                            dispatch({
                                type: 'RENAME',
                                id: node.data.id,
                                newName: name,
                            })

                            toast.success('File renamed')
                        }}
                    />
                    <DeleteEntity
                        handleDelete={() => {
                            deleteHandle(node)
                        }}
                    />
                </>
            ) : (
                <>
                    <Folder size={16} />

                    <span className="truncate max-w-[150px]">
                        {node.data.name}
                    </span>

                    <RenameEntity
                        renameHandle={async function ({ name }) {
                            const res = await fetch(
                                import.meta.env.VITE_API_URL +
                                    '/folders/' +
                                    node.data.id,
                                {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ name }),
                                }
                            )

                            if (!res.ok) {
                                const error = await res.json()

                                toast.error(error.detail)
                                return
                            }

                            dispatch({
                                type: 'RENAME',
                                id: node.data.id,
                                newName: name,
                            })

                            toast.success('Folder renamed')
                        }}
                    />
                    <DeleteEntity handleDelete={() => deleteHandle(node)} />
                </>
            )}
        </div>
    )
}
