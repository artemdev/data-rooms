import type { DataItemTransformed } from '@/types'

// Action types for tree data operations
export type TreeAction =
    | { type: 'INIT'; data: DataItemTransformed[] }
    | { type: 'ADD'; parentId: string | null; item: DataItemTransformed }
    | { type: 'DELETE'; id: string }
    | { type: 'RENAME'; id: string; newName: string }

// Unified function to add an item (file or folder) to the tree
function addItemDeep(
    arr: DataItemTransformed[] | undefined,
    parentId: string | null,
    newItem: DataItemTransformed
): DataItemTransformed[] | undefined {
    // If parentId is null, add to root level
    if (parentId === null) {
        return [...(arr || []), newItem]
    }

    // Otherwise, find the parent and add to its children
    return arr?.map((item: DataItemTransformed) => {
        // If this item is the parent, add the new item to its children
        if (item.id === parentId) {
            return {
                ...item,
                children: [...(item.children || []), newItem],
            }
        }

        // If the item has children, process them recursively
        if (item.children) {
            return {
                ...item,
                children: addItemDeep(item.children, parentId, newItem),
            }
        }

        return item
    })
}

// Function to delete an item from the tree by ID
function deleteByIdDeep(
    arr: DataItemTransformed[] | undefined,
    idToDelete: string
): DataItemTransformed[] | undefined {
    return arr?.reduce(
        (acc: DataItemTransformed[], item: DataItemTransformed) => {
            // If this item matches the ID — skip it
            if (item.id === idToDelete) {
                return acc
            }

            // If the item has children, process them recursively
            const newItem = { ...item }
            if (item.children) {
                newItem.children = deleteByIdDeep(item.children, idToDelete)
            }

            // Add item (possibly with updated children) to the accumulator
            acc.push(newItem)
            return acc
        },
        []
    )
}

// Function to rename an item in the tree by ID
function renameByIdDeep(
    arr: DataItemTransformed[] | undefined,
    idToRename: string,
    newName: string
): DataItemTransformed[] | undefined {
    return arr?.map((item: DataItemTransformed) => {
        // If this item matches the ID — update its name
        if (item.id === idToRename) {
            return { ...item, name: newName }
        }

        // If the item has children, process them recursively
        if (item.children) {
            return {
                ...item,
                children: renameByIdDeep(item.children, idToRename, newName),
            }
        }

        return item
    })
}

// Main reducer function for tree data operations
export function treeDataReducer(
    state: DataItemTransformed[] | undefined,
    action: TreeAction
): DataItemTransformed[] | undefined {
    switch (action.type) {
        case 'INIT':
            return action.data
        case 'ADD':
            return addItemDeep(state, action.parentId, action.item)
        case 'DELETE':
            return deleteByIdDeep(state, action.id)
        case 'RENAME':
            return renameByIdDeep(state, action.id, action.newName)
        default:
            return state
    }
}
