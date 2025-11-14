# 🎨 Vehicle Decal Feature Documentation

## Overview

The Vehicle Decal feature allows users to upload custom images and place them anywhere on their vehicle as customizable decals/stickers. Each decal can be positioned, scaled, rotated, and have its opacity adjusted for complete creative control.

## Features

### ✨ Core Capabilities

1. **Image Upload**
   - Support for PNG, JPG, SVG, and WebP formats
   - Maximum file size: 5MB
   - Instant preview after upload

2. **Click-to-Place**
   - Click anywhere on the vehicle mesh to place decals
   - Automatic surface detection and normal calculation
   - Decals stick to the surface they're placed on

3. **Full Customization**
   - **Scale**: Adjust size from 0.1x to 1.5x
   - **Opacity**: Control transparency from 0% to 100%
   - **Rotation**: Rotate decals from -180° to 180°
   - **Position**: Click to reposition at any time

4. **Decal Management**
   - View all added decals in a list
   - Select decals to edit them
   - Delete individual decals
   - Clear all decals at once

## User Interface

### Decal Manager Panel (Top Right)
- **Toggle Button**: Purple "Decals" button to open/close the panel
- **Upload Button**: Click to upload new image files
- **Decals List**: Shows all added decals with thumbnails
- **Delete Buttons**: Remove individual decals
- **Clear All**: Remove all decals at once

### Decal Editor Panel (Bottom Center)
Appears when a decal is selected:
- **Size Slider**: Adjust decal scale
- **Opacity Slider**: Control transparency
- **Rotation Slider**: Rotate the decal
- **Preview**: Shows selected decal image and info

### Visual Feedback
- **Crosshair Cursor**: Appears in placement mode or when editing
- **Placement Mode Indicator**: Blue banner showing "Click on the vehicle to place decal"
- **Selected Decal Highlight**: Purple border around selected decals in the list

## How to Use

### Adding a Decal

1. Click the **"Decals"** button (top right, purple button)
2. Click **"Upload Decal"** in the panel
3. Select an image file (PNG, JPG, SVG, or WebP)
4. Click anywhere on the vehicle to place the decal
5. The decal will appear at the clicked position

### Editing a Decal

1. Click on a decal in the Decals list to select it
2. The Decal Editor panel appears at the bottom
3. Use the sliders to adjust:
   - **Size**: Make the decal larger or smaller
   - **Opacity**: Make it more or less transparent
   - **Rotation**: Rotate the decal
4. Click on the vehicle again to reposition the decal

### Deleting Decals

- **Single Decal**: Click the trash icon on any decal in the list
- **All Decals**: Click "Clear All" at the top of the decals list
- Confirmation is required for clearing all decals

## Technical Architecture

### Components

#### `DecalManager.jsx`
- Main UI component for decal management
- Handles file upload and validation
- Displays decal list
- Manages selection state

#### `DecalEditor.jsx`
- Transform controls for selected decals
- Real-time slider updates
- Visual feedback for adjustments

#### `DecalOverlay.jsx`
- 3D rendering of decals on vehicle mesh
- Raycasting for click-to-place interaction
- Vehicle mesh detection
- Decal texture loading and rendering

### State Management (gameStore.js)

```javascript
// Decal State
decals: []                    // Array of decal objects
selectedDecalId: null         // Currently selected decal
placementMode: false          // Whether in placement mode

// Actions
addDecal(decalData)          // Add new decal
updateDecal(id, updates)     // Update decal properties
deleteDecal(id)              // Remove decal
setSelectedDecal(id)         // Select decal for editing
setPlacementMode(mode)       // Toggle placement mode
clearDecals()                // Remove all decals
```

### Decal Data Structure

```javascript
{
  id: "decal_1234567890",           // Unique identifier
  imageUrl: "data:image/png...",    // Base64 image data
  fileName: "my-decal.png",         // Original filename
  position: { x: 0, y: 0.5, z: 0.5 }, // 3D position
  rotation: { x: -π/2, y: 0, z: 0 }, // Euler angles (radians)
  scale: { x: 0.3, y: 0.3, z: 0.3 }, // Scale vector
  opacity: 1,                        // 0 to 1
  normal: { x: 0, y: 1, z: 0 }      // Surface normal
}
```

### Vehicle Update Handler Commands

The feature integrates with the AI chat system through these commands:

#### `add_decal`
```javascript
{
  command_type: "add_decal",
  parameters: {
    image_url: "data:image/png;base64,...",
    position: { x: 0, y: 0.5, z: 0.5 },  // optional
    rotation: { x: -1.57, y: 0, z: 0 },   // optional
    scale: { x: 0.3, y: 0.3, z: 0.3 },    // optional
    opacity: 1                             // optional
  }
}
```

#### `update_decal`
```javascript
{
  command_type: "update_decal",
  parameters: {
    decal_id: "decal_1234567890",
    position: { x: 0.1, y: 0.6, z: 0.5 },  // optional
    rotation: { x: -1.57, y: 0, z: 0.5 },   // optional
    scale: { x: 0.5, y: 0.5, z: 0.5 },      // optional
    opacity: 0.8                             // optional
  }
}
```

#### `delete_decal`
```javascript
{
  command_type: "delete_decal",
  parameters: {
    decal_id: "decal_1234567890"
  }
}
```

#### `clear_decals`
```javascript
{
  command_type: "clear_decals",
  parameters: {}
}
```

## 3D Rendering Details

### Decal Rendering
- Uses Three.js `Decal` geometry from `@react-three/drei`
- Decals project onto the vehicle mesh surface
- Textures loaded from base64 data URLs
- Transparent rendering with proper depth sorting

### Material Properties
- `meshStandardMaterial` for PBR rendering
- Transparent mode enabled
- Polygon offset to prevent z-fighting
- Depth write disabled for proper transparency

### Raycasting
- Uses Three.js raycaster for mouse picking
- Detects intersections with vehicle body mesh
- Calculates surface normals for proper orientation
- Converts world space to local decal space

## Best Practices

### For Users
1. **Use High-Quality Images**: PNG files with transparency work best
2. **Start Small**: Begin with smaller decals and scale up as needed
3. **Save Often**: The decal system is integrated with vehicle saves
4. **Use Layers**: Add multiple decals to create complex designs

### For Developers
1. **Performance**: Each decal is a separate mesh - limit to ~20 decals max
2. **Memory**: Base64 images are stored in memory - consider compression
3. **Validation**: Always validate image uploads on the client side
4. **Error Handling**: Gracefully handle missing mesh or failed texture loads

## Troubleshooting

### Decal Not Appearing
- Ensure the vehicle mesh has loaded completely
- Check browser console for texture loading errors
- Verify image format is supported
- Try clicking different areas of the vehicle

### Decal in Wrong Position
- Select the decal and click again to reposition
- Use the rotation slider to adjust orientation
- Scale might be too small - increase size

### Performance Issues
- Limit total number of decals
- Use smaller image file sizes
- Reduce image dimensions before upload
- Clear unused decals

## Future Enhancements

Potential features for future development:
- [ ] Decal templates/presets
- [ ] Text-based decals with custom fonts
- [ ] Color filters and effects
- [ ] Decal layers and z-ordering
- [ ] Batch decal operations
- [ ] Decal library/favorites
- [ ] Export/import decal configurations
- [ ] AI-assisted decal placement

## API Reference

### GameStore Methods

```javascript
// Add a new decal
useGameStore.getState().addDecal({
  imageUrl: "data:image/png;base64,...",
  position: { x, y, z },
  rotation: { x, y, z },
  scale: { x, y, z },
  opacity: 1.0
})

// Update existing decal
useGameStore.getState().updateDecal(decalId, {
  scale: { x: 0.5, y: 0.5, z: 0.5 }
})

// Delete a decal
useGameStore.getState().deleteDecal(decalId)

// Clear all decals
useGameStore.getState().clearDecals()

// Select decal for editing
useGameStore.getState().setSelectedDecal(decalId)

// Enable/disable placement mode
useGameStore.getState().setPlacementMode(true)
```

## Credits

Built for the 4x4 Builder application using:
- React Three Fiber
- Three.js
- @react-three/drei
- Zustand state management

