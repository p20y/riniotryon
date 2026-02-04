import { supabase } from './supabaseClient'

export const uploadImage = async (file) => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
        // Fallback: Return local object URL if Supabase not configured
        console.warn('Supabase not configured, using local URL')
        return URL.createObjectURL(file)
    }

    try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `uploads/${fileName}`

        const { data, error } = await supabase.storage
            .from('user-uploads')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            throw error
        }

        const { data: { publicUrl } } = supabase.storage
            .from('user-uploads')
            .getPublicUrl(filePath)

        return publicUrl
    } catch (error) {
        console.error('Error uploading image: ', error.message)
        // Fallback to local URL on error
        console.warn('Upload failed, using local URL')
        return URL.createObjectURL(file)
    }
}
