import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'

export function PhotoUpload({ onUpload }) {
    const [preview, setPreview] = useState(null)
    const [mode, setMode] = useState('upload') // 'upload' or 'camera'
    const fileInputRef = useRef(null)
    const webcamRef = useRef(null)

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            processFile(file)
        }
    }

    const processFile = (file) => {
        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)
        onUpload(file)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) {
            processFile(file)
        }
    }

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot()
        if (imageSrc) {
            setPreview(imageSrc)
            // Convert base64 to file
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" })
                    onUpload(file)
                })
            setMode('preview')
        }
    }, [webcamRef, onUpload])

    const retake = () => {
        setPreview(null)
        setMode('camera')
        onUpload(null)
    }

    const reset = () => {
        setPreview(null)
        setMode('upload')
        onUpload(null)
    }

    return (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>
                {preview ? 'Photo Ready' : 'Upload or Capture'}
            </h3>

            {!preview && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => setMode('upload')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-sm)',
                            background: mode === 'upload' ? 'rgba(255,255,255,0.1)' : 'transparent',
                            color: mode === 'upload' ? 'white' : 'var(--color-text-secondary)',
                            border: '1px solid transparent'
                        }}
                    >
                        Upload File
                    </button>
                    <button
                        onClick={() => setMode('camera')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-sm)',
                            background: mode === 'camera' ? 'rgba(255,255,255,0.1)' : 'transparent',
                            color: mode === 'camera' ? 'white' : 'var(--color-text-secondary)',
                            border: '1px solid transparent'
                        }}
                    >
                        Use Camera
                    </button>
                </div>
            )}

            {preview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '400px',
                            borderRadius: 'var(--radius-sm)',
                            boxShadow: 'var(--shadow-strong)',
                            display: 'block'
                        }}
                    />
                    <button
                        onClick={reset}
                        style={{
                            marginTop: '1rem',
                            background: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}
                    >
                        Change Photo
                    </button>
                </div>
            ) : (
                <>
                    {mode === 'upload' && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            style={{
                                border: '2px dashed var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '3rem 1rem',
                                cursor: 'pointer',
                                transition: 'var(--transition-fast)',
                                backgroundColor: 'rgba(255,255,255,0.02)',
                            }}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                hidden
                            />
                            <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}>📸</div>
                            <p style={{ color: 'var(--color-text-secondary)' }}>
                                Drag & Drop or <span style={{ color: 'var(--color-accent-primary)' }}>Click to Upload</span>
                            </p>
                        </div>
                    )}

                    {mode === 'camera' && (
                        <div style={{
                            position: 'relative',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            aspectRatio: '16/9',
                            background: 'black',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <button
                                onClick={capture}
                                style={{
                                    position: 'absolute',
                                    bottom: '20px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    border: '4px solid rgba(0,0,0,0.2)',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
