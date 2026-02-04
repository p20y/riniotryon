import { useState } from 'react'
import { PhotoUpload } from './components/PhotoUpload'
import { ItemSelector } from './components/ItemSelector'
import { ProcessingView } from './components/ProcessingView'
import './index.css'

function App() {
  const [step, setStep] = useState('upload') // upload, select, processing, result
  const [userPhoto, setUserPhoto] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)

  const handleUpload = (fileOrUrl) => {
    setUserPhoto(fileOrUrl) // PhotoUpload now passes a URL string
    // In real app: upload to Supabase here
    // Removed auto-advance to let user "Save" manually
  }

  const handleSelect = (item) => {
    setSelectedItem(item)
  }

  const handleGenerate = async () => {
    setStep('processing')

    try {
      // Send JSON payload to FastAPI
      console.log('Starting fetch request...')
      const response = await fetch('http://127.0.0.1:8000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: userPhoto.url,
          image_base64: userPhoto.base64,
          style: selectedItem.name,
          garment_url: selectedItem.image,
          garment_base64: selectedItem.base64,
          category: selectedItem.category
        }),
      })
      console.log('Fetch response received:', response.status)

      const data = await response.json()
      console.log('Response data:', data)

      if (data.status === 'success') {
        setGeneratedImage(data.generated_image_url)
        setStep('result')
      } else {
        alert('Error: ' + (data.message || 'Something went wrong!'))
        setStep('select')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to connect to backend. Is it running?')
      setStep('select')
    }
  }

  const reset = () => {
    setStep('upload')
    setUserPhoto(null)
    setSelectedItem(null)
    setGeneratedImage(null)
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '4rem 1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Virtual <span style={{ color: 'var(--color-accent-primary)' }}>Try-On</span>
        </h1>
      </header>

      <main style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        {step === 'upload' && (
          <div className="fade-in">
            <PhotoUpload onUpload={handleUpload} />
            {userPhoto && (
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button
                  className="btn-primary"
                  onClick={() => setStep('select')}
                  style={{ minWidth: '200px' }}
                >
                  Save & Continue
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'select' && (
          <div className="fade-in">
            <ItemSelector onSelect={handleSelect} />
            <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setStep('upload')} style={{ background: 'transparent', color: 'var(--color-text-secondary)', padding: '12px 24px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                Back
              </button>
              <button
                className="btn-primary"
                onClick={handleGenerate}
                disabled={!selectedItem}
                style={{ opacity: selectedItem ? 1 : 0.5, pointerEvents: selectedItem ? 'auto' : 'none' }}
              >
                Generate Look
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
            <ProcessingView />
          </div>
        )}

        {step === 'result' && (
          <div className="fade-in glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Your Personalized Look</h3>
            <img
              src={generatedImage}
              alt="Generated Result"
              style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-strong)', marginBottom: '2rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                className="btn-primary"
                onClick={() => alert('Email functionality coming next!')}
              >
                Email Me This
              </button>
              <button
                onClick={reset}
                style={{ background: 'transparent', color: 'var(--color-text-primary)', padding: '12px 24px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
              >
                Try Another
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
