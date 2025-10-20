import { describe, it, expect } from 'vitest'
import { isFolder, findByIdDeep } from './utils'
import type { DataItemTransformed } from '@/types'

describe('isFolder', () => {
    it('should return true for folder (non-file)', () => {
        const folder: DataItemTransformed = {
            id: '1',
            name: 'Documents',
            description: 'Folder',
            isFile: false,
        }
        expect(isFolder(folder)).toBe(true)
    })

    it('should return false for file', () => {
        const file: DataItemTransformed = {
            id: '2',
            name: 'report.pdf',
            description: 'File',
            isFile: true,
        }
        expect(isFolder(file)).toBe(false)
    })

    it('should return false for undefined', () => {
        expect(isFolder(undefined)).toBeFalsy()
    })
})

describe('findByIdDeep', () => {
    const testTree: DataItemTransformed[] = [
        {
            id: 'root-1',
            name: 'Root Folder 1',
            description: 'First root',
            children: [
                {
                    id: 'child-1',
                    name: 'Child 1',
                    description: 'First child',
                },
                {
                    id: 'child-2',
                    name: 'Child 2',
                    description: 'Second child',
                    children: [
                        {
                            id: 'grandchild-1',
                            name: 'Grandchild 1',
                            description: 'Nested deep',
                        },
                    ],
                },
            ],
        },
        {
            id: 'root-2',
            name: 'Root Folder 2',
            description: 'Second root',
        },
    ]

    it('should find root level item', () => {
        const result = findByIdDeep(testTree, 'root-1')
        expect(result?.name).toBe('Root Folder 1')
    })

    it('should find nested child', () => {
        const result = findByIdDeep(testTree, 'child-2')
        expect(result?.name).toBe('Child 2')
    })

    it('should find deeply nested item', () => {
        const result = findByIdDeep(testTree, 'grandchild-1')
        expect(result?.name).toBe('Grandchild 1')
    })

    it('should return undefined for non-existent id', () => {
        const result = findByIdDeep(testTree, 'non-existent')
        expect(result).toBeUndefined()
    })

    it('should return undefined for null id', () => {
        const result = findByIdDeep(testTree, null)
        expect(result).toBeUndefined()
    })

    it('should return undefined for undefined array', () => {
        const result = findByIdDeep(undefined, 'some-id')
        expect(result).toBeUndefined()
    })
})
