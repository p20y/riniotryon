import { useState, useEffect } from 'react'

const LOADING_MESSAGES = [
  "Analyzing your photo...",
  "Understanding garment details...",
  "Matching body proportions...",
  "Applying realistic lighting...",
  "Generating your personalized look...",
  "Adding final touches...",
  "Almost there..."
]

export function ProcessingView({ userPhoto, selectedItem }) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Rotate through messages
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 3000)

    // Animate progress bar (fake progress for UX)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 10
      })
    }, 500)

    return () => {
      clearInterval(messageInterval)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className="processing-container">
      <div className="processing-content glass-panel">
        {/* Image previews */}
        <div className="processing-images">
          <div className="preview-card">
            <img
              src={userPhoto?.url || userPhoto?.base64}
              alt="Your photo"
            />
            <span>Your Photo</span>
          </div>
          <div className="processing-arrow">
            <span>+</span>
          </div>
          <div className="preview-card">
            <img
              src={selectedItem?.image}
              alt={selectedItem?.name}
            />
            <span>{selectedItem?.name}</span>
          </div>
          <div className="processing-arrow">
            <span>=</span>
          </div>
          <div className="preview-card generating">
            <div className="generating-placeholder">
              <div className="spinner-large"></div>
            </div>
            <span>Your New Look</span>
          </div>
        </div>

        {/* Progress section */}
        <div className="processing-status">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="processing-message">{LOADING_MESSAGES[messageIndex]}</p>
        </div>

        {/* Tips while waiting */}
        <div className="processing-tips">
          <h4>Did you know?</h4>
          <p>Our AI analyzes over 100 points on your body to ensure the perfect fit and natural look.</p>
        </div>
      </div>
    </div>
  )
}
