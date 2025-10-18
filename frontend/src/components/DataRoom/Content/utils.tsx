import { toast } from 'sonner'

export async function downloadFile(fileId: string) {
    try {
        const response = await fetch(
            import.meta.env.VITE_API_URL + '/files/' + fileId + '/download'
        )
        if (!response.ok) {
            throw new Error('Failed to download file')
        }

        const blob = await response.blob()

        const url = URL.createObjectURL(blob)
        window.open(url)
    } catch (error) {
        toast.error('Failed to download file', {
            description:
                error instanceof Error ? error.message : 'Unknown error',
        })
    }
}
