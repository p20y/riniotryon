import { useState } from 'react'
import { PhotoUpload } from './components/PhotoUpload'
import { ItemSelector } from './components/ItemSelector'
import { ProcessingView } from './components/ProcessingView'
import { ResultView } from './components/ResultView'
import { STYLE_SETTINGS } from './data/catalog'
import './index.css'

function App() {
  const [step, setStep] = useState('upload') // upload, select, processing, result
  const [userPhoto, setUserPhoto] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedStyle, setSelectedStyle] = useState('studio')
  const [generatedImage, setGeneratedImage] = useState(null)
  const [error, setError] = useState(null)

  const handleUpload = (fileOrUrl) => {
    setUserPhoto(fileOrUrl)
    setError(null)
  }

  const handleSelect = (item) => {
    setSelectedItem(item)
  }

  const handleGenerate = async () => {
    setStep('processing')
    setError(null)

    try {
      console.log('Starting generation request...')
      const response = await fetch('http://127.0.0.1:8000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: userPhoto.url,
          image_base64: userPhoto.base64,
          style: selectedStyle,
          garment_url: selectedItem.image,
          garment_base64: selectedItem.base64,
          category: selectedItem.category || selectedItem.bodyCategory || 'upper_body'
        }),
      })
      console.log('Response received:', response.status)

      const data = await response.json()
      console.log('Response data:', data)

      if (data.status === 'success') {
        setGeneratedImage(data.generated_image_url)
        setStep('result')
      } else {
        setError(data.message || 'Something went wrong during generation')
        setStep('select')
      }
    } catch (error) {
      console.error('Generation error:', error)
      setError('Failed to connect to the styling service. Please try again.')
      setStep('select')
    }
  }

  const reset = () => {
    setStep('upload')
    setUserPhoto(null)
    setSelectedItem(null)
    setGeneratedImage(null)
    setError(null)
  }

  const tryAnother = () => {
    setStep('select')
    setSelectedItem(null)
    setGeneratedImage(null)
    setError(null)
  }

  return (
    <div className="app-container">
      {/* Hero Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">✨</span>
          <span className="logo-text">StyleAI</span>
        </div>
        <p className="tagline">Virtual Try-On Powered by AI</p>
      </header>

      {/* Progress Steps */}
      <div className="progress-bar">
        <div className={`progress-step ${step === 'upload' ? 'active' : (step !== 'upload' ? 'completed' : '')}`}>
          <span className="step-number">1</span>
          <span className="step-label">Upload Photo</span>
        </div>
        <div className="progress-line" />
        <div className={`progress-step ${step === 'select' ? 'active' : (step === 'processing' || step === 'result' ? 'completed' : '')}`}>
          <span className="step-number">2</span>
          <span className="step-label">Choose Style</span>
        </div>
        <div className="progress-line" />
        <div className={`progress-step ${step === 'result' ? 'active completed' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Get Results</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner fade-in">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {step === 'upload' && (
          <div className="fade-in">
            <div className="section-header">
              <h2>Upload Your Photo</h2>
              <p>Take or upload a clear photo of yourself for the best results</p>
            </div>
            <PhotoUpload onUpload={handleUpload} />
            {userPhoto && (
              <div className="action-buttons">
                <button
                  className="btn-primary btn-large"
                  onClick={() => setStep('select')}
                >
                  Continue to Styling →
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'select' && (
          <div className="fade-in">
            <div className="section-header">
              <h2>Select Your Look</h2>
              <p>Choose from our curated collection or upload your own garment</p>
            </div>

            {/* User photo preview */}
            <div className="user-preview">
              <img src={userPhoto?.url || userPhoto?.base64} alt="Your photo" />
              <button className="change-photo-btn" onClick={() => setStep('upload')}>
                Change Photo
              </button>
            </div>

            <ItemSelector onSelect={handleSelect} />

            {/* Style Settings */}
            {selectedItem && (
              <div className="style-settings glass-panel fade-in">
                <h4>Photography Style</h4>
                <div className="style-options">
                  {STYLE_SETTINGS.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`style-option ${selectedStyle === style.id ? 'active' : ''}`}
                    >
                      <span className="style-name">{style.name}</span>
                      <span className="style-desc">{style.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button
                className="btn-secondary"
                onClick={() => setStep('upload')}
              >
                ← Back
              </button>
              <button
                className="btn-primary btn-large"
                onClick={handleGenerate}
                disabled={!selectedItem}
              >
                Generate My Look ✨
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="fade-in">
            <ProcessingView
              userPhoto={userPhoto}
              selectedItem={selectedItem}
            />
          </div>
        )}

        {step === 'result' && (
          <div className="fade-in">
            <ResultView
              generatedImage={generatedImage}
              userPhoto={userPhoto}
              selectedItem={selectedItem}
              onTryAnother={tryAnother}
              onStartOver={reset}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Powered by AI • Built for Fashion</p>
      </footer>
    </div>
  )
}

export default App
