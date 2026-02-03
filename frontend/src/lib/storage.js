import { supabase } from './supabaseClient'

export const uploadImage = async (file) => {
    try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { data, error } = await supabase.storage
            .from('user-uploads')
            .upload(filePath, file)

        if (error) {
            throw error
        }

        const { data: { publicUrl } } = supabase.storage
            .from('user-uploads')
            .getPublicUrl(filePath)

        return publicUrl
    } catch (error) {
        console.error('Error uploading image: ', error.message)
        throw error
    }
}
