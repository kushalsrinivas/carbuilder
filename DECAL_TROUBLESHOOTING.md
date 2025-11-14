# 🔧 Decal Feature Troubleshooting Guide

## Quick Diagnostic Checklist

### ✅ Step 1: Verify the Decal Button Exists
- Look for a **purple "Decals" button** in the top-right corner
- If you don't see it, the DecalManager component may not be loaded

### ✅ Step 2: Upload a Test Decal
1. Click the "Decals" button
2. Click "Upload Decal"
3. Select any image file (PNG, JPG, etc.)
4. **Check the browser console** (F12) for messages

### ✅ Step 3: Check Console Messages

You should see these console messages after uploading:

```
📤 Decal uploaded, placement mode enabled
📊 Current decals: 1 [...]
🚗 Vehicle mesh found: true
✅ Decal texture loaded: decal_1234567890
```

### ✅ Step 4: Look for the Decal

**Where to look:**
- The decal should appear **in front of the vehicle** initially
- It will be a flat plane with your image
- Position: x: 0, y: 1, z: 1.5 (in front, at medium height)

**Not seeing it?**
- Try rotating the camera around
- Check if it's behind the vehicle
- Look at the console for any errors

### ✅ Step 5: Click to Place

1. Click anywhere on the **vehicle body** (not ground, not wheels)
2. Watch the console for: `🎯 Decal placed/moved:`
3. A success notification should appear: "Decal placed!"

---

## Common Issues & Solutions

### Issue 1: "Can't see the decal after uploading"

**Symptoms:**
- Uploaded image successfully
- No visual decal appears
- Console shows texture loaded

**Solutions:**

1. **Check Camera Angle**
   - Rotate camera to look at the front of the vehicle
   - The decal initially appears at z: 1.5 (front)

2. **Check Console for Texture Loading**
   ```
   ✅ Decal texture loaded: decal_xxxxx
   ```
   If you see this, the decal IS rendering, just might be off-screen

3. **Check Decal Scale**
   - Open DecalEditor (click decal in list)
   - Increase size slider to make it more visible

4. **Check Opacity**
   - Make sure opacity isn't set to 0%
   - Default should be 100%

### Issue 2: "Click on vehicle doesn't work"

**Symptoms:**
- Upload works
- Clicking vehicle does nothing
- No console messages when clicking

**Solutions:**

1. **Verify Placement Mode**
   ```javascript
   // In console, check:
   console.log('Placement mode:', useGameStore.getState().placementMode)
   // Should be true after upload
   ```

2. **Check Vehicle Mesh Detection**
   ```
   🚗 Vehicle mesh found: true
   ```
   If false, the raycasting can't find the vehicle

3. **Click on Body, Not Wheels**
   - Click the vehicle body/hood/doors
   - NOT the wheels, ground, or background

4. **Check for Console Errors**
   - Look for red error messages
   - Common: "Cannot read property of undefined"

### Issue 3: "Decal appears but in wrong location"

**Symptoms:**
- Decal is visible
- But positioned incorrectly (floating, inside vehicle, etc.)

**Solutions:**

1. **Reposition the Decal**
   - Click on the decal in the list to select it
   - Click a different spot on the vehicle
   - The decal will move to the new click location

2. **Check Rotation**
   - Use the Rotation slider in DecalEditor
   - Adjust -180° to 180° to fix orientation

3. **Check Normal Offset**
   - Decals are offset by 0.01 units from surface
   - This prevents z-fighting (flickering)

### Issue 4: "Decal is flickering/z-fighting"

**Symptoms:**
- Decal appears and disappears rapidly
- Looks like it's fighting with vehicle paint

**Solutions:**

1. **This is Already Fixed**
   - The code includes polygon offset
   - And a normal-based position offset
   
2. **If Still Flickering:**
   - Increase the offset in DecalOverlay.jsx:
   ```javascript
   const offsetPosition = [
     decal.position.x + (decal.normal?.x || 0) * 0.02, // Increase from 0.01
     decal.position.y + (decal.normal?.y || 0) * 0.02,
     decal.position.z + (decal.normal?.z || 0) * 0.02
   ]
   ```

### Issue 5: "Texture not loading"

**Symptoms:**
- Console shows: `❌ Error loading decal texture:`
- No image appears

**Solutions:**

1. **Check Image Format**
   - Supported: PNG, JPG, SVG, WebP
   - Try a different image

2. **Check File Size**
   - Must be under 5MB
   - Try compressing the image

3. **Check Base64 Encoding**
   ```javascript
   // In console, after upload:
   const decals = useGameStore.getState().decals
   console.log(decals[0].imageUrl.substring(0, 100))
   // Should start with: data:image/png;base64,...
   ```

### Issue 6: "DecalManager panel not showing"

**Symptoms:**
- Can't find the Decals button
- Or button doesn't open panel

**Solutions:**

1. **Check Component Import**
   - Verify `App.jsx` imports DecalManager:
   ```javascript
   import DecalManager from "./DecalManager"
   ```

2. **Check Component Rendering**
   - Verify `App.jsx` includes:
   ```javascript
   <DecalManager />
   ```

3. **Check Z-Index**
   - Panel has `z-50`, should be on top
   - Check browser dev tools for overlapping elements

---

## Debug Console Commands

Open browser console (F12) and try these:

### Check Current State
```javascript
// Get all decals
console.log('Decals:', useGameStore.getState().decals)

// Get selected decal
console.log('Selected:', useGameStore.getState().selectedDecalId)

// Get placement mode
console.log('Placement mode:', useGameStore.getState().placementMode)
```

### Manually Add Test Decal
```javascript
// Add a test decal with a simple color
useGameStore.getState().addDecal({
  imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0ZGMDAwMCIvPjwvc3ZnPg==',
  fileName: 'test-red-square.svg',
  position: { x: 0, y: 1, z: 1.5 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 0.5, y: 0.5, z: 0.5 },
  opacity: 1,
  normal: { x: 0, y: 0, z: 1 }
})

console.log('Added red square test decal')
```

### Check Vehicle Mesh
```javascript
// Find vehicle mesh in scene
const scene = document.querySelector('canvas').__THREE_INSTANCE__?.scene
if (scene) {
  scene.traverse((obj) => {
    if (obj.isMesh && obj.parent?.name === 'Body') {
      console.log('Found vehicle mesh:', obj)
    }
  })
}
```

### Force Enable Placement Mode
```javascript
useGameStore.getState().setPlacementMode(true)
console.log('Placement mode enabled')
```

---

## Visual Debug Mode

Want to see what's happening? Add this to DecalOverlay.jsx temporarily:

```javascript
// In SingleDecal component, add a wireframe helper
return (
  <>
    <mesh
      ref={meshRef}
      position={offsetPosition}
      rotation={[decal.rotation.x, decal.rotation.y, decal.rotation.z]}
      scale={[decal.scale.x, decal.scale.y, decal.scale.z]}
      renderOrder={1}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        opacity={decal.opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
        depthTest={true}
        polygonOffset={true}
        polygonOffsetFactor={-4}
        polygonOffsetUnits={-4}
      />
    </mesh>
    
    {/* Debug wireframe */}
    <mesh
      position={offsetPosition}
      rotation={[decal.rotation.x, decal.rotation.y, decal.rotation.z]}
      scale={[decal.scale.x, decal.scale.y, decal.scale.z]}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="red" wireframe={true} />
    </mesh>
  </>
)
```

This will show a red wireframe outline of where the decal should be.

---

## Still Not Working?

### Checklist:
- [ ] Browser console shows no errors
- [ ] DecalManager button visible
- [ ] Can upload images without error
- [ ] Console shows "Decal texture loaded"
- [ ] Console shows "Vehicle mesh found: true"
- [ ] Tried clicking different parts of vehicle
- [ ] Tried rotating camera around vehicle
- [ ] Tried with different image files
- [ ] Checked all solutions above

### Next Steps:

1. **Share Console Logs**
   - Copy all console messages related to decals
   - Look for any errors (red text)

2. **Check Browser Compatibility**
   - Recommended: Chrome, Edge, Firefox
   - WebGL must be enabled
   - Check: https://get.webgl.org/

3. **Verify Three.js Version**
   - The decal feature uses Three.js plane geometry
   - Should work with Three.js r140+

4. **Test with Simple Image**
   - Create a solid color PNG (100x100px)
   - Upload that instead of complex image
   - If simple works, original image may have issues

---

## Performance Issues

### "Too many decals, app is slow"

**Solutions:**
1. Delete unused decals
2. Reduce image file sizes
3. Limit to ~20 decals maximum
4. Consider using smaller textures

### "Decals lag when editing"

**Solutions:**
1. Close DecalEditor when not in use
2. Don't adjust sliders too rapidly
3. Check GPU usage in browser task manager

---

## Contact / Report Issues

If problems persist:
1. Document all console messages
2. Note browser and OS version
3. Include steps to reproduce
4. Include sample image if relevant

**Browser Console Export:**
- Right-click console → Save as...
- Or copy/paste all output

---

## Quick Reference

### File Locations
- UI: `components/DecalManager.jsx`
- Editor: `components/DecalEditor.jsx`
- 3D: `components/DecalOverlay.jsx`
- State: `store/gameStore.js`

### Console Messages Guide
- ✅ = Success
- ⚠️ = Warning
- ❌ = Error
- 📊 = State info
- 🎯 = Placement action
- 📤 = Upload action
- 🚗 = Vehicle detection

---

**Good luck! The decals should work with these fixes.** 🚀

