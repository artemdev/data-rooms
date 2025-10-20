import { type DataItem, type DataItemTransformed } from '@/types'

export function transformToArboristArray(
    items: DataItem[] = []
): DataItemTransformed[] {
    function transformItem(node: DataItem): DataItemTransformed {
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
                    id: file.id,
                    name: file.name,
                    description: file.description,
                    isFile: true,
                    contentType: file.content_type,
                    fileSize: parseInt(file.file_size, 10),
                    createdAt: file.created_at,
                })
            }
        }

        // Build transformed node
        const transformed: DataItemTransformed = {
            id: node.id,
            name: node.name,
            description: node.description,
            children: children.length > 0 ? children : undefined,
            isFile: node.isFile,
        }

        return transformed
    }

    // Map through array and return transformed structure
    return items.map(transformItem)
}
