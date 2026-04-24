import axios from 'axios'
import FormData from 'form-data'

async function uploadMedia(buffer) {
    const form = new FormData()
    form.append('file', buffer, { filename: 'image.jpg' })
    form.append('type', 'permanent')

    const res = await axios.post(
        'https://c.termai.cc/api/upload?key=AIzaBj7z2z3xBjsk',
        form,
        { headers: form.getHeaders() }
    )

    const url = res.data?.status ? res.data?.path : null
    if (!url) throw new Error("Upload gagal")
    return url
}

async function live3d(img, prompt) {
    const imageUrl = await uploadMedia(img)

    const apiUrl = `https://api.zenzxz.my.id/ai/nanobanana?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`
    
    const { data } = await axios.get(apiUrl, { timeout: 300000 })

    if (!data.status || !data.result?.modified_image) {
        throw new Error("Gagal mengedit gambar dari server ZenzXZ")
    }

    return {
        task_id: data.result.task_id,
        image: data.result.modified_image
    }
}

export { live3d }