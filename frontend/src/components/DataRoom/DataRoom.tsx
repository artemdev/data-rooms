import { useState, useEffect, useReducer } from 'react'
import { toast } from 'sonner'
import { useParams } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'

import { transformToArboristArray } from './utils'
import { findByIdDeep } from './SideBar/utils'
import { treeDataReducer } from './SideBar/treeDataReducer'

import Content from './Content'
import Sidebar from './SideBar'
import { Spinner } from '@/components/ui/spinner'

import { type DataItem, type DataItemTransformed } from '@/types'

export default function DataRoom() {
    const { id } = useParams()
    const [loading, setLoading] = useState<boolean>(true)
    const [treeData, dispatch] = useReducer(treeDataReducer, undefined)
    const [searchParams] = useSearchParams()
    const [selectedEntity, setSelectedEntity] = useState<
        DataItemTransformed | undefined
    >()

    useEffect(() => {
        setSelectedEntity(
            searchParams.get('folderId')
                ? findByIdDeep(treeData, searchParams.get('folderId'))
                : undefined
        )
    }, [searchParams, treeData])

    useEffect(() => {
        fetch(import.meta.env.VITE_API_URL + '/data-rooms/' + id)
            .then((res) => res.json())
            .then((room: DataItem) => {
                const transformedDataItems = transformToArboristArray([
                    ...(room.folders || []),
                    ...(room.files || []),
                ])

                dispatch({
                    type: 'INIT',
                    data: transformedDataItems,
                })
            })

            .catch(() => {
                toast.error('Failed to fetch data')
            })
            .finally(() => setLoading(false))
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen h-screen w-screen bg-gray-100 flex items-center justify-center">
                <Spinner variant="circle" className="size-16 text-gray-500" />
            </div>
        )
    }

    if (!treeData || treeData.length === 0) {
        return <div>Room is empty</div>
    }

    return (
        <div className="h-screen w-screen flex flex-col lg:flex-row">
            <aside className="sidebar w-full lg:w-80 lg:h-full bg-gray-800 text-white flex flex-col lg:fixed lg:inset-y-0 lg:left-0 overflow-auto">
                <Sidebar
                    treeData={treeData}
                    dispatch={dispatch}
                    setSelectedEntity={setSelectedEntity}
                />
            </aside>

            <main className="content flex-1 bg-gray-100 p-4 lg:p-8 lg:ml-80 overflow-auto flex flex-col w-full">
                <Content
                    selectedEntity={selectedEntity}
                    dispatch={dispatch}
                    treeData={treeData}
                />
            </main>
        </div>
    )
}
