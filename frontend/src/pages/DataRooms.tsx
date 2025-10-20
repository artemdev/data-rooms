import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Folder, FileText } from 'lucide-react'

import { type DataItem } from '../types/index'

export default function DataRooms() {
    const [data, setData] = useState<DataItem[]>([])
    const [error, setError] = useState<string | null>(null)

    const navigate = useNavigate()

    useEffect(() => {
        fetch(import.meta.env.VITE_API_URL + '/data-rooms')
            .then((res) => {
                if (res.ok) {
                    return res.json()
                } else {
                    throw new Error('Failed to fetch data rooms')
                }
            })
            .then((data) => {
                setData(data)
            })
            .catch((error) => {
                setError(error.message)
            })
    }, [])

    if (error) {
        return <div>{error}</div>
    }

    return (
        <div className="min-h-screen h-screen w-screen bg-gray-800 p-8 overflow-auto">
            <div className="w-full">
                <h1 className="text-4xl font-bold text-white mb-8">
                    Data Rooms
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {data.map((room) => {
                        return (
                            <div
                                key={room.id}
                                onClick={() => navigate(`/rooms/${room.id}`)}
                                className="bg-gray-700 rounded-lg border border-gray-600 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:border-gray-500 hover:bg-gray-650 p-8 flex flex-col min-h-[200px]"
                            >
                                <div className="flex-1">
                                    <h2 className="text-2xl font-semibold text-white mb-3">
                                        {room.name}
                                    </h2>
                                    {room.description && (
                                        <p className="text-base text-gray-300 mb-4">
                                            {room.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-6 pt-6 border-t border-gray-600">
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Folder size={22} />
                                        <span className="text-base font-medium">
                                            {room.folders?.length}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-300">
                                        <FileText size={22} />
                                        <span className="text-base font-medium">
                                            {room.files?.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
