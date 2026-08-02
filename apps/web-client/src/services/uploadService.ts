import { supabase } from './supabaseClient'

/**
 * Secure image upload — goes through the backend (POST /api/uploads/image),
 * which validates magic bytes, size, bucket and role server-side.
 *
 * Direct writes to Supabase Storage from the browser are blocked by RLS
 * (see database/web-server/migrations/restrict_image_uploads_storage.sql),
 * so this helper is the ONLY supported way to upload images.
 */

const API_URL = import.meta.env.VITE_API_URL

export type ImageBucket = 'forum-uploads' | 'avatars' | 'content' | 'admin-assets' | 'medals'

export const uploadImage = async (blob: Blob, bucket: ImageBucket, folder?: string): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
        throw new Error('Debes iniciar sesión para subir imágenes')
    }

    const formData = new FormData()
    formData.append('bucket', bucket)
    if (folder) formData.append('folder', folder)
    formData.append('file', blob)

    const res = await fetch(`${API_URL}/uploads/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
    })

    if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error?.message || `Error al subir la imagen (${res.status})`)
    }

    const json = await res.json()
    return json.data.url as string
}
