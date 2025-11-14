# 🔧 Decal Mesh Detection Fix

## Problem

After refactoring to use `DecalGeometry`, the system couldn't find the vehicle mesh, showing:
- ❌ "Could not find vehicle mesh for decals"
- ❌ "Vehicle mesh found: false"

## Root Cause

The original mesh detection logic was looking for meshes with **direct parent** named "Body":

```javascript
if (object.parent?.name === 'Body') {
  foundMesh = object
}
```

**However**, the actual scene hierarchy is:

```
RigidBody
  └── group name='Vehicle'
      └── group name='Body'          <-- This is just a wrapper group
          └── Gltf                    <-- GLTF loader creates its own structure
              └── Scene
                  └── Mesh (actual geometry)  <-- We need this!
```

The "Body" group is **not** the direct parent of the mesh - it's an ancestor several levels up!

## Solution

Changed the detection to **traverse up the parent chain** looking for the "Body" ancestor:

```javascript
// Look for meshes that are descendants of a 'Body' group
let current = object.parent
let isInBody = false
let depth = 0

while (current && depth < 10) {
  if (current.name === 'Body') {
    isInBody = true
    break
  }
  current = current.parent
  depth++
}

if (isInBody && vertexCount > 100) {
  // This mesh is under the Body group!
  foundMesh = object
}
```

### Key Improvements

1. **Ancestor Search**: Walks up the parent chain up to 10 levels
2. **Vertex Filter**: Only considers meshes with >100 vertices (filters out tiny helper meshes)
3. **Largest Mesh**: Picks the mesh with the most vertices (main body)
4. **Better Logging**: Shows top 3 candidate meshes for debugging

## Code Changes

**File:** `components/DecalOverlay.jsx`

**Lines:** 25-87

**Changes:**
- ✅ Added ancestor traversal loop
- ✅ Added vertex count minimum (>100)
- ✅ Improved console logging with candidates
- ✅ Better error messages

## Testing

After this fix, you should see in console:

```
🔍 Found candidate vehicle meshes: 5
Top 3 candidates: [
  { name: "Body_Mesh", vertices: 2847, parent: "Scene" },
  { name: "Hood_Mesh", vertices: 1523, parent: "Scene" },
  { name: "Door_Mesh", vertices: 982, parent: "Scene" }
]
✅ Found vehicle mesh for decals: {
  name: "Body_Mesh",
  parent: "Scene",
  vertices: 2847,
  ...
}
```

## Why This Works

The GLTF loader creates a structure like:

```
<Gltf src="vehicle.glb" />
    ↓ creates ↓
Group
  └── Scene (from GLTF)
      ├── Mesh (body)
      ├── Mesh (hood)
      └── Mesh (door)
```

These meshes are **descendants** of the "Body" group (defined in Vehicle.jsx line 132), but not direct children. By traversing up the parent chain, we can find any mesh that's somewhere under the "Body" group.

## Alternative Approaches Considered

### 1. Name-based matching
```javascript
if (object.name.includes('body') || object.name.includes('Body'))
```
❌ Problem: GLTF mesh names are unpredictable

### 2. Tag-based system
```javascript
<group name='Body' userData={{ isVehicleBody: true }}>
```
❌ Problem: Requires modifying Vehicle component

### 3. Direct scene.getObjectByName()
```javascript
const bodyGroup = scene.getObjectByName('Body')
```
❌ Problem: Returns the group, not the mesh

### 4. Ancestor traversal (CHOSEN) ✅
```javascript
while (current && depth < 10) {
  if (current.name === 'Body') { ... }
}
```
✅ Works with any GLTF structure  
✅ No modifications needed  
✅ Robust and flexible

## Impact

- ✅ **Fixes** "Could not find vehicle mesh" error
- ✅ **Enables** decal placement on vehicle
- ✅ **Improves** debugging with better logging
- ✅ **Maintains** backward compatibility

## Related Issues

This fix addresses the mesh detection issue that appeared after the DecalGeometry refactor. The old `@react-three/drei` Decal component likely handled this internally with its own mesh finding logic.

---

**Status:** ✅ Fixed  
**Date:** 2025-11-14  
**Commit:** Mesh detection now uses ancestor traversal

