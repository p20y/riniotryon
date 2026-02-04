import { useState, useRef } from 'react'
import { uploadImage } from '../lib/storage'

const ITEMS = [
    { id: 'tshirt-1', name: 'Classic White Tee', category: 't-shirt', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80' },
    { id: 'jacket-1', name: 'Leather Jacket', category: 'jacket', image: 'https://images.unsplash.com/photo-1551028919-ac66e624ec06?auto=format&fit=crop&w=300&q=80' },
    { id: 'dress-1', name: 'Summer Dress', category: 'dress', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=300&q=80' },
    { id: 'hoodie-1', name: 'Urban Hoodie', category: 'hoodie', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80' },
]

export function ItemSelector({ onSelect }) {
    const [selectedId, setSelectedId] = useState(null)
    const [customItem, setCustomItem] = useState(null)
    const fileInputRef = useRef(null)

    const handleSelect = (item) => {
        setSelectedId(item.id)
        onSelect(item)
    }

    const handleCustomUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            // Upload to Supabase (for UI display)
            const publicUrl = await uploadImage(file)

            // Convert to Base64 (for Fashn.ai API)
            const toBase64 = file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
            const base64Data = await toBase64(file)

            const newItem = {
                id: 'custom-' + Date.now(),
                name: 'Custom Garment',
                category: 'auto', // let API detect
                image: publicUrl,
                base64: base64Data
            }

            setCustomItem(newItem)
            handleSelect(newItem)
        } catch (err) {
            console.error(err)
            alert("Failed to upload garment")
        }
    }

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Select Style</h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '1.5rem'
            }}>
                {/* Upload Button */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)',
                        border: '2px dashed var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '180px',
                        background: 'rgba(255,255,255,0.05)'
                    }}
                >
                    <span style={{ fontSize: '2rem' }}>📤</span>
                    <span style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Upload Own</span>
                    <input type="file" ref={fileInputRef} onChange={handleCustomUpload} accept="image/*" hidden />
                </div>

                {customItem && (
                    <div
                        key={customItem.id}
                        onClick={() => handleSelect(customItem)}
                        style={{
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            border: selectedId === customItem.id ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
                            position: 'relative',
                            height: '180px'
                        }}
                    >
                        <img src={customItem.image} alt="Custom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '0.5rem' }}>
                            <p style={{ fontSize: '0.8rem' }}>Custom</p>
                        </div>
                    </div>
                )}

                {ITEMS.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        style={{
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            border: selectedId === item.id ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
                            transition: 'var(--transition-fast)',
                            opacity: selectedId && selectedId !== item.id ? 0.6 : 1,
                            position: 'relative'
                        }}
                    >
                        <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{
                            padding: '0.8rem',
                            background: 'rgba(0,0,0,0.6)',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0
                        }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
