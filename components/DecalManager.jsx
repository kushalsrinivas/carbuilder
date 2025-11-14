import { useState, useRef } from 'react'
import useGameStore from '../store/gameStore'

const DecalManager = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef(null)
  
  const decals = useGameStore((state) => state.decals)
  const selectedDecalId = useGameStore((state) => state.selectedDecalId)
  const placementMode = useGameStore((state) => state.placementMode)
  const addDecal = useGameStore((state) => state.addDecal)
  const deleteDecal = useGameStore((state) => state.deleteDecal)
  const setSelectedDecal = useGameStore((state) => state.setSelectedDecal)
  const setPlacementMode = useGameStore((state) => state.setPlacementMode)
  const clearDecals = useGameStore((state) => state.clearDecals)

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (PNG, JPG, SVG, or WebP)')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setUploadError('File size must be less than 5MB')
      return
    }

    // Clear any previous errors
    setUploadError(null)

    // Read file as data URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target.result
      
      // Add decal to store with temporary placement data
      // Position it in front of the vehicle initially (more visible)
      addDecal({
        imageUrl,
        fileName: file.name,
        position: { x: 0, y: 1, z: 1.5 }, // Position in front of vehicle
        rotation: { x: 0, y: 0, z: 0 }, // Face forward
        scale: { x: 0.5, y: 0.5, z: 0.5 }, // Medium size
        opacity: 1,
        normal: { x: 0, y: 0, z: 1 }, // Facing forward
      })

      // Enable placement mode for the new decal
      setPlacementMode(true)

      console.log('📤 Decal uploaded, placement mode enabled')

      // Show notification
      useGameStore.getState().showNotification({
        message: 'Click on the vehicle to place your decal',
        type: 'info',
        duration: 4000,
      })
    }
    reader.readAsDataURL(file)

    // Reset file input
    event.target.value = ''
  }

  // Handle decal selection
  const handleSelectDecal = (id) => {
    if (selectedDecalId === id) {
      setSelectedDecal(null)
    } else {
      setSelectedDecal(id)
    }
  }

  // Handle decal deletion
  const handleDeleteDecal = (id, event) => {
    event.stopPropagation()
    deleteDecal(id)
    
    useGameStore.getState().showNotification({
      message: 'Decal removed',
      type: 'success',
      duration: 2000,
    })
  }

  // Handle clear all
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all decals?')) {
      clearDecals()
      useGameStore.getState().showNotification({
        message: 'All decals removed',
        type: 'success',
        duration: 2000,
      })
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-4 z-50 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
        title="Manage Decals"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Decals
      </button>

      {/* Decal Manager Panel */}
      {isOpen && (
        <div className="fixed top-32 right-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex justify-between items-center">
            <h3 className="text-white font-bold text-lg">Decal Manager</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded p-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {/* Upload Section */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Decal
              </button>
              {uploadError && (
                <p className="text-red-500 text-sm mt-2">{uploadError}</p>
              )}
            </div>

            {/* Placement Mode Indicator */}
            {placementMode && (
              <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                  🎯 Click on the vehicle to place decal
                </p>
              </div>
            )}

            {/* Decals List */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Decals ({decals.length})
                </h4>
                {decals.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {decals.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">No decals added yet</p>
                  <p className="text-xs mt-1">Upload an image to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {decals.map((decal) => (
                    <div
                      key={decal.id}
                      onClick={() => handleSelectDecal(decal.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedDecalId === decal.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                          <img
                            src={decal.imageUrl}
                            alt="Decal preview"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            {decal.fileName || `Decal ${decal.id.slice(-4)}`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Opacity: {Math.round(decal.opacity * 100)}%
                          </p>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDeleteDecal(decal.id, e)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors flex-shrink-0"
                          title="Delete decal"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DecalManager

