import { describe, it, expect } from 'vitest'
import { transformToArboristArray } from './utils'
import type { DataItem } from '@/types'

describe('transformToArboristArray', () => {
    it('should transform empty array', () => {
        const result = transformToArboristArray([])
        expect(result).toEqual([])
    })

    it('should transform folder with files', () => {
        const input: DataItem[] = [
            {
                id: 'folder-1',
                name: 'Documents',
                description: 'My documents',
                file_size: '0',
                created_at: '2024-01-01',
                files: [
                    {
                        id: 'file-1',
                        name: 'report.pdf',
                        description: 'Annual report',
                        file_size: '1024',
                        created_at: '2024-01-02',
                        content_type: 'application/pdf',
                    },
                ],
            },
        ]

        const result = transformToArboristArray(input)

        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({
            id: 'folder-1',
            name: 'Documents',
            description: 'My documents',
            isFile: undefined,
            children: [
                {
                    id: 'file-1',
                    name: 'report.pdf',
                    description: 'Annual report',
                    isFile: true,
                    contentType: 'application/pdf',
                    fileSize: 1024,
                    createdAt: '2024-01-02',
                },
            ],
        })
    })

    it('should transform nested folder structure', () => {
        const input: DataItem[] = [
            {
                id: 'root',
                name: 'Root',
                description: 'Root folder',
                file_size: '0',
                created_at: '2024-01-01',
                folders: [
                    {
                        id: 'subfolder',
                        name: 'Subfolder',
                        description: 'A subfolder',
                        file_size: '0',
                        created_at: '2024-01-02',
                        files: [
                            {
                                id: 'nested-file',
                                name: 'data.json',
                                description: 'JSON data',
                                file_size: '2048',
                                created_at: '2024-01-03',
                                content_type: 'application/json',
                            },
                        ],
                    },
                ],
            },
        ]

        const result = transformToArboristArray(input)

        expect(result[0].children).toHaveLength(1)
        expect(result[0].children?.[0].id).toBe('subfolder')
        expect(result[0].children?.[0].children).toHaveLength(1)
        expect(result[0].children?.[0].children?.[0]).toEqual({
            id: 'nested-file',
            name: 'data.json',
            description: 'JSON data',
            isFile: true,
            contentType: 'application/json',
            fileSize: 2048,
            createdAt: '2024-01-03',
        })
    })
})
