import type { DataItem, DataItemTransformed } from '@/types'

export function isFolder(node: DataItem | DataItemTransformed | undefined) {
    return node && !node.isFile
}

export function findByIdDeep(
    arr: DataItemTransformed[] | undefined,
    idToFind: string | null
): DataItemTransformed | undefined {
    if (!arr || !idToFind) {
        return undefined
    }

    for (const item of arr) {
        // If this item matches the ID, return it
        if (item.id === idToFind) {
            return item
        }

        // If the item has children, search recursively
        if (item.children) {
            const found = findByIdDeep(item.children, idToFind)
            if (found) {
                return found
            }
        }
    }

    return undefined
}
