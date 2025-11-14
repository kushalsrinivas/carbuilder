# 🔍 Decal System - Complete Debug Guide

## Current Implementation

I've now implemented the decals using **`@react-three/drei`'s Decal component**, which is the recommended approach for React Three Fiber applications.

---

## How to Debug Step-by-Step

### Step 1: Open Browser Console
Press **F12** or **Cmd+Option+I** (Mac) to open Developer Tools

### Step 2: Upload a Decal
1. Click the purple "Decals" button (top-right)
2. Click "Upload Decal"
3. Select any image file

### Step 3: Check Console Messages

You should see these messages in order:

#### ✅ Expected Messages:

```
📤 Decal uploaded, placement mode enabled

🔍 All meshes in scene: [...]
✅ Found vehicle mesh for decals: {
  name: "...",
  parent: "Body",
  vertices: 12345,
  ...
}

📊 Current decals: 1 [...]
🚗 Vehicle mesh found: true

✅ Decal texture loaded: decal_1234567890

⏳ Waiting for texture or mesh... { hasTexture: true, hasMesh: true }
```

#### ❌ Problem Indicators:

```
⚠️ Could not find vehicle mesh for decals
→ Problem: Can't find the Body mesh
```

```
❌ Error loading decal texture: ...
→ Problem: Image file couldn't load
```

```
⏳ Waiting for texture or mesh... { hasTexture: false }
→ Problem: Texture not loading
```

---

## Detailed Diagnostics

### Diagnostic 1: Check Vehicle Mesh Detection

**Run in console:**
```javascript
// Check if mesh was found
const mesh = useGameStore.getState().decals
console.log('Vehicle mesh system active')

// Manually search for Body meshes
const canvas = document.querySelector('canvas')
const scene = canvas?.__THREE_INSTANCE__?.scene
if (scene) {
  let bodyMeshes = []
  scene.traverse((obj) => {
    if (obj.parent?.name === 'Body' && obj.isMesh) {
      bodyMeshes.push({
        name: obj.name,
        vertices: obj.geometry.attributes.position.count,
        material: obj.material?.type
      })
    }
  })
  console.log('Body meshes found:', bodyMeshes)
}
```

**Expected result:**
- Should show at least 1 mesh with parent name "Body"
- Mesh should have vertices (geometry data)

**If no meshes found:**
- Vehicle model might not be loaded yet
- Body group might have different name
- Check the Vehicle.jsx component structure

### Diagnostic 2: Check Decal State

**Run in console:**
```javascript
const state = useGameStore.getState()
console.log('Decals:', state.decals)
console.log('Selected:', state.selectedDecalId)
console.log('Placement mode:', state.placementMode)
```

**Expected result:**
```javascript
Decals: [{
  id: "decal_...",
  imageUrl: "data:image/png;base64,...",
  position: {x: 0, y: 1, z: 1.5},
  rotation: {x: 0, y: 0, z: 0},
  scale: {x: 0.5, y: 0.5, z: 0.5},
  opacity: 1,
  normal: {x: 0, y: 0, z: 1}
}]
Selected: null
Placement mode: true
```

### Diagnostic 3: Check Texture Loading

**Run in console:**
```javascript
const decals = useGameStore.getState().decals
if (decals.length > 0) {
  const firstDecal = decals[0]
  console.log('Image URL length:', firstDecal.imageUrl.length)
  console.log('Image URL start:', firstDecal.imageUrl.substring(0, 50))
  console.log('Valid data URL?', firstDecal.imageUrl.startsWith('data:image/'))
}
```

**Expected result:**
```
Image URL length: 5000+ (varies by image)
Image URL start: data:image/png;base64,iVBORw0KGgoAAAANSUh...
Valid data URL?: true
```

### Diagnostic 4: Test Decal Placement

**Run in console:**
```javascript
// Click on vehicle after running this
console.log('Ready to place decal - click on vehicle now')
```

Then **click on the vehicle body**. You should see:

```
🎯 Decal placed/moved: {
  decalId: "decal_...",
  position: {x: "0.50", y: "1.20", z: "0.80"},
  normal: {x: "0.00", y: "1.00", z: "0.00"},
  rotation: {x: "0°", y: "0°", z: "0°"}
}
Decal placed! (notification)
```

---

## Common Issues & Solutions

### Issue 1: "Decals not appearing at all"

**Symptoms:**
- Upload works
- No errors in console
- But can't see decal anywhere

**Diagnostics:**
```javascript
// Check if Decal component is rendering
const decals = useGameStore.getState().decals
console.log('Number of decals:', decals.length)

// Check render logs
// Look for: "⏳ Waiting for texture or mesh..."
```

**Solutions:**

1. **Vehicle mesh not found**
   - Check console for: "✅ Found vehicle mesh for decals"
   - If not found, vehicle might use different structure
   
2. **Texture not loading**
   - Check console for: "✅ Decal texture loaded"
   - Try smaller image file (< 1MB)
   - Try different image format (PNG works best)

3. **Decal behind camera**
   - Rotate camera around
   - Initial position is z: 1.5 (front of vehicle)
   - Try moving camera to see from different angles

4. **Scale too small**
   - Select decal and increase size slider
   - Default is 0.5, try 1.0 or larger

### Issue 2: "Decal appears but doesn't wrap to surface"

This means the @react-three/drei Decal component isn't working properly.

**Check:**
```javascript
// Verify drei version
console.log('Checking @react-three/drei version...')
// Should be v9.x or higher
```

**Solutions:**

1. **Update @react-three/drei**
   ```bash
   npm update @react-three/drei
   ```

2. **Check mesh geometry**
   - Decal needs proper geometry with normals
   - Run diagnostic 1 to check mesh details

3. **Try enabling debug mode**
   In `DecalOverlay.jsx`, change:
   ```javascript
   <Decal ... debug={true}>  // Enable debug visualization
   ```

### Issue 3: "Click doesn't place decal"

**Symptoms:**
- Upload works
- Can see decal floating
- Clicking vehicle does nothing

**Diagnostics:**
```javascript
// Check placement mode
console.log('Placement mode:', useGameStore.getState().placementMode)
// Should be true after upload
```

**Solutions:**

1. **Click on body, not wheels**
   - Raycaster only detects Body mesh
   - Click hood, doors, roof
   - NOT wheels, ground, or background

2. **Check vehicle mesh detected**
   - Must show: "🚗 Vehicle mesh found: true"
   - If false, see Issue 1 Solution 1

3. **Re-enable placement mode**
   ```javascript
   useGameStore.getState().setPlacementMode(true)
   console.log('Placement mode re-enabled')
   ```

### Issue 4: "Decal flickers/z-fighting"

**Symptoms:**
- Decal appears but flickers
- Fighting with vehicle surface

**Solutions:**

1. **Already handled in code** with:
   - `polygonOffset: true`
   - `polygonOffsetFactor: -4`
   - Normal offset: `0.001`

2. **If still flickering**, increase offset:
   ```javascript
   // In SingleDecal component
   position.x += decal.normal.x * 0.01  // Increase from 0.001
   ```

### Issue 5: "Decal upside down or wrong orientation"

**Symptoms:**
- Decal appears but rotated incorrectly

**Solutions:**

1. **Use rotation slider**
   - Click decal in list
   - Adjust rotation slider: -180° to 180°

2. **Check normal calculation**
   - Console shows normal when placing
   - Normal should point away from surface
   - Example: Hood top → normal: (0, 1, 0)

---

## Manual Testing Procedure

### Test 1: Basic Upload
1. ☐ Click "Decals" button - panel opens
2. ☐ Click "Upload Decal" - file picker opens
3. ☐ Select image - file uploads
4. ☐ Console shows "Decal uploaded"
5. ☐ Console shows "Texture loaded"
6. ☐ Decal appears somewhere in scene

### Test 2: Mesh Detection
1. ☐ Console shows "All meshes in scene"
2. ☐ Console shows "Found vehicle mesh"
3. ☐ Mesh has "Body" as parent
4. ☐ Mesh has vertices > 0

### Test 3: Placement
1. ☐ Crosshair cursor appears
2. ☐ Click on vehicle hood
3. ☐ Console shows "Decal placed/moved"
4. ☐ Notification "Decal placed!" appears
5. ☐ Decal moves to clicked location

### Test 4: Surface Conforming
1. ☐ Decal on hood follows curve
2. ☐ Decal on door follows panel shape
3. ☐ Decal doesn't float away from surface
4. ☐ Decal wraps around edges

### Test 5: Editing
1. ☐ Click decal in list - gets selected
2. ☐ Editor panel appears at bottom
3. ☐ Size slider changes decal size
4. ☐ Opacity slider changes transparency
5. ☐ Rotation slider rotates decal

---

## Advanced Debugging

### Enable Decal Debug Mode

**In DecalOverlay.jsx:**
```javascript
<Decal
  ...
  debug={true}  // Shows wireframe box
>
```

This shows the projection volume as a wireframe box.

### Add Visual Helpers

**Temporary code to add:**
```javascript
// After the Decal component, add:
{/* Debug helper - shows decal position */}
<mesh position={position.toArray()}>
  <sphereGeometry args={[0.05]} />
  <meshBasicMaterial color="red" />
</mesh>

{/* Debug helper - shows normal direction */}
<arrowHelper
  args={[
    new THREE.Vector3(decal.normal.x, decal.normal.y, decal.normal.z),
    new THREE.Vector3(decal.position.x, decal.position.y, decal.position.z),
    0.5,
    0x00ff00
  ]}
/>
```

This shows:
- Red sphere = decal center position
- Green arrow = surface normal direction

### Log All Decal Renders

**Add to SingleDecal component:**
```javascript
console.log('🎨 Rendering decal:', {
  id: decal.id,
  hasTexture: !!texture,
  hasMesh: !!vehicleMesh,
  position: decal.position,
  scale: decal.scale
})
```

### Check Three.js Scene

**In console:**
```javascript
// Get the Three.js scene
const canvas = document.querySelector('canvas')
const scene = canvas?.__THREE_INSTANCE__?.scene

// Find all decal meshes
let decalMeshes = []
scene.traverse((obj) => {
  if (obj.name.includes('decal') || obj.type === 'Mesh') {
    if (obj.material?.map) {
      decalMeshes.push({
        type: obj.type,
        visible: obj.visible,
        hasMap: !!obj.material.map,
        position: obj.position
      })
    }
  }
})
console.log('Decal meshes in scene:', decalMeshes)
```

---

## Expected Console Output (Success Case)

```
[Upload]
📤 Decal uploaded, placement mode enabled

[Mesh Detection - runs 3 times]
🔍 All meshes in scene: [{ name: "...", parentName: "Body", vertices: 15234 }, ...]
✅ Found vehicle mesh for decals: { name: "Scene", parent: "Body", vertices: 15234, ... }

[State Update]
📊 Current decals: 1 [{ id: "decal_1234567890", imageUrl: "data:image/png;base64...", ... }]
🚗 Vehicle mesh found: true

[Texture Loading]
✅ Decal texture loaded: decal_1234567890

[Render Attempt]
⏳ Waiting for texture or mesh... { hasTexture: true, hasMesh: true, decalId: "decal_1234567890" }

[User clicks vehicle]
🎯 Decal placed/moved: { decalId: "decal_1234567890", position: {...}, normal: {...}, rotation: {...} }
```

---

## Still Not Working?

### Share These Details:

1. **Console output** - Copy all messages
2. **Mesh detection** - Result of Diagnostic 1
3. **Decal state** - Result of Diagnostic 2
4. **Image type** - PNG/JPG/SVG?
5. **Image size** - File size in KB/MB
6. **Three.js version** - Check package.json
7. **@react-three/drei version** - Check package.json

### Try Simple Test Image

Use this tiny test image (red square):
```javascript
// Run in console
useGameStore.getState().addDecal({
  imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0ZGMDAwMCIvPjwvc3ZnPg==',
  fileName: 'test-red-square.svg',
  position: { x: 0, y: 1, z: 1.5 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 0.5, y: 0.5, z: 0.5 },
  opacity: 1,
  normal: { x: 0, y: 0, z: 1 }
})
```

If this red square appears, your image file might be the issue.

---

## Next Steps

1. Run the app
2. Open console (F12)
3. Upload a decal
4. **Copy and share the entire console output**
5. Tell me what you see (or don't see)

I'll help you debug further based on the actual console messages! 🔍🚀

