import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { uploadImage } from '../lib/storage'

export function PhotoUpload({ onUpload }) {
    const [preview, setPreview] = useState(null)
    const [mode, setMode] = useState('upload') // 'upload' or 'camera'
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef(null)
    const webcamRef = useRef(null)

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            processFile(file)
        }
    }

    const processFile = async (file) => {
        // Show preview immediately
        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)
        setUploading(true)

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
            onUpload({ url: publicUrl, base64: base64Data })
        } catch (error) {
            console.error(error)
            alert('Upload failed: ' + error.message)
            setPreview(null)
        } finally {
            setUploading(false)
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
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
                    processFile(file)
                })
                .catch(err => console.error("Capture conversion error:", err))
        }
    }, [webcamRef])

    const reset = () => {
        setPreview(null)
        setMode('upload')
        onUpload(null)
    }

    return (
        <div className="photo-upload-container">
            <div className="glass-panel" style={{ padding: '2rem' }}>
                {!preview && (
                    <>
                        {/* Mode Toggle */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            <button
                                onClick={() => setMode('upload')}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '20px',
                                    background: mode === 'upload' ? 'var(--color-accent-gradient)' : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    border: 'none'
                                }}
                            >
                                📁 Upload
                            </button>
                            <button
                                onClick={() => setMode('camera')}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '20px',
                                    background: mode === 'camera' ? 'var(--color-accent-gradient)' : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    border: 'none'
                                }}
                            >
                                📷 Camera
                            </button>
                        </div>

                        {mode === 'upload' && (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                style={{
                                    border: dragActive
                                        ? '2px solid var(--color-accent-primary)'
                                        : '2px dashed var(--color-border)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '4rem 2rem',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'var(--transition-fast)',
                                    backgroundColor: dragActive
                                        ? 'rgba(255,77,106,0.1)'
                                        : 'rgba(255,255,255,0.02)',
                                }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    hidden
                                />
                                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.8 }}>
                                    📸
                                </div>
                                <p style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem'
                                }}>
                                    {dragActive ? 'Drop your photo here' : 'Drop your photo here'}
                                </p>
                                <p style={{
                                    color: 'var(--color-text-secondary)',
                                    fontSize: '0.9rem'
                                }}>
                                    or <span style={{ color: 'var(--color-accent-primary)' }}>click to browse</span>
                                </p>
                                <p style={{
                                    color: 'var(--color-text-muted)',
                                    fontSize: '0.8rem',
                                    marginTop: '1rem'
                                }}>
                                    Supports JPG, PNG • Max 10MB
                                </p>
                            </div>
                        )}

                        {mode === 'camera' && (
                            <div style={{
                                position: 'relative',
                                borderRadius: 'var(--radius-lg)',
                                overflow: 'hidden',
                                aspectRatio: '4/3',
                                background: 'black',
                            }}>
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    screenshotQuality={0.92}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                    videoConstraints={{
                                        facingMode: 'user',
                                        width: 1280,
                                        height: 720
                                    }}
                                />
                                {/* Capture button */}
                                <button
                                    onClick={capture}
                                    style={{
                                        position: 'absolute',
                                        bottom: '20px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: '70px',
                                        height: '70px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        border: '4px solid rgba(255,77,106,0.8)',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>📸</span>
                                </button>
                                {/* Frame guide */}
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '60%',
                                    height: '80%',
                                    border: '2px dashed rgba(255,255,255,0.3)',
                                    borderRadius: 'var(--radius-lg)',
                                    pointerEvents: 'none'
                                }} />
                            </div>
                        )}

                        {/* Tips */}
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(123,97,255,0.1)',
                            borderRadius: 'var(--radius-md)',
                        }}>
                            <p style={{
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: 'var(--color-accent-secondary)',
                                marginBottom: '0.5rem'
                            }}>
                                💡 Tips for best results:
                            </p>
                            <ul style={{
                                fontSize: '0.8rem',
                                color: 'var(--color-text-secondary)',
                                paddingLeft: '1.2rem',
                                lineHeight: '1.8'
                            }}>
                                <li>Stand in good lighting</li>
                                <li>Face the camera directly</li>
                                <li>Wear fitted clothing</li>
                                <li>Use a plain background</li>
                            </ul>
                        </div>
                    </>
                )}

                {preview && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <img
                                src={preview}
                                alt="Preview"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '400px',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: 'var(--shadow-lg)',
                                    display: 'block'
                                }}
                            />
                            {uploading && (
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(0,0,0,0.5)',
                                    borderRadius: 'var(--radius-lg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    gap: '1rem'
                                }}>
                                    <div className="spinner-large"></div>
                                    <p style={{ fontSize: '0.9rem' }}>Processing...</p>
                                </div>
                            )}
                            {!uploading && (
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'var(--color-success)',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem'
                                }}>
                                    ✓
                                </div>
                            )}
                        </div>
                        {!uploading && (
                            <button
                                onClick={reset}
                                style={{
                                    marginTop: '1.5rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    padding: '10px 24px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Change Photo
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
