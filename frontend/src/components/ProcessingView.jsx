export function ProcessingView() {
    return (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', minWidth: '300px' }}>
            <div className="spinner" style={{
                width: '50px',
                height: '50px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTop: '3px solid var(--color-accent-primary)',
                borderRadius: '50%',
                margin: '0 auto 2rem auto',
                animation: 'spin 1s linear infinite'
            }} />
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Weaving Magic...</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
                Our AI stylists are personalizing your look.
            </p>
        </div>
    )
}
