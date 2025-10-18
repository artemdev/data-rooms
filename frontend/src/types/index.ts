export type DataItem = {
    id: string
    name: string
    description: string
    folders?: DataItem[]
    files?: DataItem[]
    isFile?: boolean
    content_type?: string
}

export type DataItemTransformed = {
    id: string
    name: string
    description: string
    children?: DataItemTransformed[]
    isFile?: boolean
    fileSize?: number // size in bites
    createdAt?: string
    format?: string
    contentType?: string
}
