import { useState, useRef, useEffect } from 'react'
import { uploadImage } from '../lib/storage'
import { CATALOG, CATEGORIES, GENDERS } from '../data/catalog'

// Helper to fetch image URL and convert to base64
async function imageUrlToBase64(url) {
    try {
        const response = await fetch(url)
        const blob = await response.blob()
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    } catch (error) {
        console.error('Error converting image to base64:', error)
        return null
    }
}

export function ItemSelector({ onSelect }) {
    const [selectedId, setSelectedId] = useState(null)
    const [customItem, setCustomItem] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadingId, setLoadingId] = useState(null)
    const [activeCategory, setActiveCategory] = useState('all')
    const [activeGender, setActiveGender] = useState('all')
    const fileInputRef = useRef(null)

    // Filter catalog based on category and gender
    const filteredItems = CATALOG.filter(item => {
        const matchCategory = activeCategory === 'all' || item.category === activeCategory
        const matchGender = activeGender === 'all' || item.gender === activeGender
        return matchCategory && matchGender
    })

    const handleSelect = async (item) => {
        setSelectedId(item.id)
        setLoadingId(item.id)

        // If item already has base64, use it directly
        if (item.base64) {
            onSelect(item)
            setLoadingId(null)
            return
        }

        // Otherwise, fetch and convert the image URL to base64
        setLoading(true)
        try {
            const base64Data = await imageUrlToBase64(item.image)
            const itemWithBase64 = { ...item, base64: base64Data, category: item.bodyCategory }
            onSelect(itemWithBase64)
        } catch (error) {
            console.error('Failed to load image:', error)
            alert('Failed to load garment image')
        } finally {
            setLoading(false)
            setLoadingId(null)
        }
    }

    const handleCustomUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setLoading(true)
        try {
            // Upload to Supabase (for UI display)
            const publicUrl = await uploadImage(file)

            // Convert to Base64 (for API)
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
                category: 'upper_body', // default, can be changed
                bodyCategory: 'upper_body',
                image: publicUrl,
                base64: base64Data,
                gender: 'all'
            }

            setCustomItem(newItem)
            setSelectedId(newItem.id)
            onSelect(newItem)
        } catch (err) {
            console.error(err)
            alert("Failed to upload garment")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.4rem', fontWeight: '700' }}>
                Choose Your Style
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Browse our collection or upload your own garment
            </p>

            {/* Gender Filter */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {GENDERS.map(gender => (
                    <button
                        key={gender.id}
                        onClick={() => setActiveGender(gender.id)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            background: activeGender === gender.id
                                ? 'var(--color-accent-primary)'
                                : 'rgba(255,255,255,0.1)',
                            color: activeGender === gender.id ? 'white' : 'var(--color-text-secondary)',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'var(--transition-fast)'
                        }}
                    >
                        {gender.name}
                    </button>
                ))}
            </div>

            {/* Category Filter */}
            <div style={{
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem'
            }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: activeCategory === cat.id
                                ? '2px solid var(--color-accent-primary)'
                                : '1px solid var(--color-border)',
                            background: activeCategory === cat.id
                                ? 'rgba(255,77,77,0.1)'
                                : 'transparent',
                            color: activeCategory === cat.id ? 'white' : 'var(--color-text-secondary)',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'var(--transition-fast)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                    </button>
                ))}
            </div>

            {/* Items count */}
            <p style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '1rem'
            }}>
                {filteredItems.length} items available
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '1rem'
            }}>
                {/* Upload Button */}
                <div
                    onClick={() => !loading && fileInputRef.current?.click()}
                    style={{
                        cursor: loading ? 'wait' : 'pointer',
                        borderRadius: 'var(--radius-md)',
                        border: '2px dashed var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '200px',
                        background: 'rgba(255,255,255,0.03)',
                        transition: 'var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                    <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📤</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Upload Own</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        JPG, PNG
                    </span>
                    <input type="file" ref={fileInputRef} onChange={handleCustomUpload} accept="image/*" hidden />
                </div>

                {/* Custom uploaded item */}
                {customItem && (
                    <ItemCard
                        item={customItem}
                        isSelected={selectedId === customItem.id}
                        isLoading={loadingId === customItem.id}
                        onClick={() => handleSelect(customItem)}
                    />
                )}

                {/* Catalog items */}
                {filteredItems.map((item) => (
                    <ItemCard
                        key={item.id}
                        item={item}
                        isSelected={selectedId === item.id}
                        isLoading={loadingId === item.id}
                        onClick={() => handleSelect(item)}
                    />
                ))}
            </div>
        </div>
    )
}

// Separate component for item cards
function ItemCard({ item, isSelected, isLoading, onClick }) {
    const [imageLoaded, setImageLoaded] = useState(false)

    return (
        <div
            onClick={onClick}
            style={{
                cursor: isLoading ? 'wait' : 'pointer',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: isSelected
                    ? '2px solid var(--color-accent-primary)'
                    : '2px solid transparent',
                transition: 'var(--transition-fast)',
                position: 'relative',
                height: '200px',
                background: 'rgba(0,0,0,0.2)',
                opacity: isLoading ? 0.7 : 1
            }}
        >
            {/* Loading indicator */}
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.7)',
                    padding: '10px 20px',
                    borderRadius: '20px',
                    fontSize: '0.8rem'
                }}>
                    Loading...
                </div>
            )}

            {/* Image */}
            <img
                src={item.image}
                alt={item.name}
                onLoad={() => setImageLoaded(true)}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    opacity: imageLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                }}
            />

            {/* Overlay with info */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                padding: '2rem 0.8rem 0.8rem'
            }}>
                <p style={{
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    marginBottom: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {item.name}
                </p>
                {item.description && (
                    <p style={{
                        fontSize: '0.7rem',
                        color: 'var(--color-text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {item.description}
                    </p>
                )}
            </div>

            {/* Selected checkmark */}
            {isSelected && (
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'var(--color-accent-primary)',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px'
                }}>
                    ✓
                </div>
            )}
        </div>
    )
}
