import { NodeApi, Tree } from 'react-arborist'
import { toast } from 'sonner'
import { useSearchParams, Link } from 'react-router-dom'
import { Home } from 'lucide-react'

import { isFolder } from './utils'
import { type TreeAction } from './treeDataReducer'
import AddFolder from './AddFolder'
import Node from './Node'

import { type DataItemTransformed } from '@/types'
import type { Dispatch } from 'react'

async function handleFolderDelete(id: string) {
    await fetch(import.meta.env.VITE_API_URL + '/folders/' + id, {
        method: 'DELETE',
    })
}

async function handleFileDelete(id: string) {
    await fetch(import.meta.env.VITE_API_URL + '/files/' + id, {
        method: 'DELETE',
    })
}

export default function Sidebar({
    treeData,
    setSelectedEntity,
    dispatch,
}: {
    treeData: DataItemTransformed[]
    setSelectedEntity: (folder: DataItemTransformed) => void
    dispatch: Dispatch<TreeAction>
}) {
    const [searchParams, setSearchParams] = useSearchParams()

    return (
        <>
            <div className="p-4 sm:p-6 text-xl sm:text-2xl font-bold border-b border-gray-700">
                <AddFolder dispatch={dispatch} />
            </div>

            <nav className="flex-1 p-3 sm:p-4 space-y-3 overflow-auto">
                <Tree
                    data={treeData}
                    width={'100%'}
                    rowHeight={32}
                    paddingBottom={32}
                    onSelect={([node]: NodeApi<DataItemTransformed>[]) => {
                        if (isFolder(node?.data)) {
                            setSearchParams('?folderId=' + node?.data?.id)
                        }
                        setSelectedEntity(node?.data)
                    }}
                >
                    {(props) => (
                        <Node
                            {...props}
                            deleteHandle={(node) => {
                                const deleteAction = isFolder(node.data)
                                    ? handleFolderDelete(node.data.id)
                                    : handleFileDelete(node.data.id)

                                deleteAction
                                    .then(() => {
                                        dispatch({
                                            type: 'DELETE',
                                            id: node.data.id,
                                        })
                                        if (
                                            searchParams.get('folderId') ===
                                            node.data.id
                                        ) {
                                            setSearchParams('')
                                        }

                                        toast.success('Deleted successfully')
                                    })
                                    .catch((error) => {
                                        toast.error(
                                            'Failed to delete',
                                            error?.detail || ''
                                        )
                                    })
                            }}
                            dispatch={dispatch}
                        />
                    )}
                </Tree>
            </nav>

            <div className="p-4 sm:p-6 border-t border-gray-700">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-white hover:text-yellow-500 transition-all duration-200"
                >
                    <Home size={18} className="sm:size-5" />
                    <span className="text-base sm:text-lg font-medium">Home</span>
                </Link>
            </div>
        </>
    )
}
