import { useState } from 'react'

const ITEMS = [
    { id: 'tshirt-1', name: 'Classic White Tee', category: 't-shirt', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80' },
    { id: 'jacket-1', name: 'Leather Jacket', category: 'jacket', image: 'https://images.unsplash.com/photo-1551028919-ac66e624ec06?auto=format&fit=crop&w=300&q=80' },
    { id: 'dress-1', name: 'Summer Dress', category: 'dress', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=300&q=80' },
    { id: 'hoodie-1', name: 'Urban Hoodie', category: 'hoodie', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80' },
]

export function ItemSelector({ onSelect }) {
    const [selectedId, setSelectedId] = useState(null)

    const handleSelect = (item) => {
        setSelectedId(item.id)
        onSelect(item)
    }

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Select Style</h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '1.5rem'
            }}>
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
