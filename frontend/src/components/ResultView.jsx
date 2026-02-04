import { useState } from 'react'

export function ResultView({ generatedImage, userPhoto, selectedItem, onTryAnother, onStartOver }) {
  const [showComparison, setShowComparison] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      // Convert data URL to blob and download
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `styleai-look-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download failed:', err)
      alert('Failed to download image')
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const response = await fetch(generatedImage)
        const blob = await response.blob()
        const file = new File([blob], 'styleai-look.png', { type: 'image/png' })
        await navigator.share({
          title: 'My StyleAI Look',
          text: 'Check out my new look created with StyleAI!',
          files: [file]
        })
      } catch (err) {
        console.log('Share cancelled or failed')
      }
    } else {
      // Fallback: copy link or show share options
      alert('Sharing is not supported on this device. Try downloading the image instead.')
    }
  }

  return (
    <div className="result-container">
      <div className="result-header">
        <h2>Your New Look is Ready!</h2>
        <p>Here's how you'd look wearing {selectedItem?.name}</p>
      </div>

      <div className="result-content">
        {/* Main generated image */}
        <div className="result-main glass-panel">
          <div className="result-image-container">
            {showComparison ? (
              <div className="comparison-view">
                <div className="comparison-image">
                  <img src={userPhoto?.url || userPhoto?.base64} alt="Original" />
                  <span className="comparison-label">Before</span>
                </div>
                <div className="comparison-image">
                  <img src={generatedImage} alt="Generated" />
                  <span className="comparison-label">After</span>
                </div>
              </div>
            ) : (
              <img
                src={generatedImage}
                alt="Your styled look"
                className="result-image"
              />
            )}
          </div>

          {/* Toggle comparison */}
          <button
            className="comparison-toggle"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? '📷 Single View' : '🔄 Compare Before/After'}
          </button>
        </div>

        {/* Sidebar with info and actions */}
        <div className="result-sidebar">
          {/* Selected item info */}
          <div className="item-info glass-panel">
            <img src={selectedItem?.image} alt={selectedItem?.name} />
            <div className="item-details">
              <h4>{selectedItem?.name}</h4>
              <p>{selectedItem?.description}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="result-actions">
            <button
              className="btn-primary btn-large"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? 'Downloading...' : '📥 Download Image'}
            </button>

            <button
              className="btn-secondary"
              onClick={handleShare}
            >
              📤 Share
            </button>

            <button
              className="btn-outline"
              onClick={onTryAnother}
            >
              👗 Try Another Style
            </button>

            <button
              className="btn-text"
              onClick={onStartOver}
            >
              📸 Start Over with New Photo
            </button>
          </div>

          {/* Feedback section */}
          <div className="feedback-section glass-panel">
            <p>How did we do?</p>
            <div className="feedback-buttons">
              <button className="feedback-btn" onClick={() => alert('Thanks for your feedback!')}>👍</button>
              <button className="feedback-btn" onClick={() => alert('Thanks for your feedback!')}>👎</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
