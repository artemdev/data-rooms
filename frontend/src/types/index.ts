export type DataItem = {
    id: string
    name: string
    description: string
    folders?: DataItem[]
    files?: DataItem[]
    isFile?: boolean
}

export type DataItemTransformed = {
    id: string
    name: string
    description: string
    children?: DataItemTransformed[]
    isFile?: boolean
    size?: number // size in KB
    created_at?: string
    format?: string
}
