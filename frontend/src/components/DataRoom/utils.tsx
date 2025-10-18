import { type DataItem } from '@/types'

export function transformToArboristArray(items: DataItem[] = []): DataItem[] {
    function transformItem(node: DataItem): DataItem {
        const children = []

        // Recursively transform folders
        if (Array.isArray(node.folders) && node.folders.length > 0) {
            for (const folder of node.folders) {
                children.push(transformItem(folder))
            }
        }

        // Add files as leaf nodes
        if (Array.isArray(node.files) && node.files.length > 0) {
            for (const file of node.files) {
                children.push({
                    ...file,
                    isFile: true,
                    children: undefined,
                })
            }
        }

        // Build transformed node
        const transformed = {
            ...node,
            children: children.length > 0 ? children : undefined,
        }

        delete transformed.folders
        delete transformed.files

        return transformed
    }

    // Map through array and return transformed structure
    return items.map(transformItem)
}
