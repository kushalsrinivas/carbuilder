# DecalGeometry Quick Reference

## Quick Start

The decal system now uses Three.js `DecalGeometry` instead of `@react-three/drei` Decal component.

## Key Concepts

### DecalGeometry Constructor
```javascript
new DecalGeometry(mesh, position, orientation, size)
```

**Parameters:**
- `mesh`: THREE.Mesh - The target mesh to project onto (vehicle body)
- `position`: THREE.Vector3 - World space position where decal is placed
- `orientation`: THREE.Euler - Rotation to align with surface
- `size`: THREE.Vector3 - Size of the decal (x, y, z)

### Creating a Decal
```javascript
const position = new THREE.Vector3(x, y, z)
const orientation = new THREE.Euler(rx, ry, rz)
const size = new THREE.Vector3(scale, scale, scale)

const geometry = new DecalGeometry(vehicleMesh, position, orientation, size)
const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true })
const decalMesh = new THREE.Mesh(geometry, material)

// Attach to vehicle so it moves with the vehicle
vehicleMesh.add(decalMesh)
```

## How It Works

### Surface Projection
`DecalGeometry` automatically:
1. Takes the position point on the mesh
2. Projects a box volume around that point
3. Clips mesh geometry that falls within the box
4. Generates UVs for the texture mapping
5. Creates new geometry that "wraps" onto the surface

### Orientation from Normal
```javascript
// Get surface normal from raycast
const normal = face.normal.clone()
normalMatrix.getNormalMatrix(mesh.matrixWorld)
normal.applyMatrix3(normalMatrix).normalize()

// Create orientation from normal
const up = new THREE.Vector3(0, 0, 1) // Decal's "forward" direction
const quaternion = new THREE.Quaternion()
quaternion.setFromUnitVectors(up, normal)
const orientation = new THREE.Euler().setFromQuaternion(quaternion)
```

## Raycasting Pattern

```javascript
// Setup
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2(mouseX, mouseY) // NDC (-1 to 1)

// Cast ray
raycaster.setFromCamera(mouse, camera)
const intersects = raycaster.intersectObject(vehicleMesh, false)

if (intersects.length > 0) {
  const { point, face } = intersects[0]
  // point: Vector3 - where ray hit
  // face: Face3 - triangle that was hit (has normal)
}
```

## Material Settings

```javascript
new THREE.MeshStandardMaterial({
  map: texture,              // Required: the decal image
  transparent: true,         // Required: for PNG transparency
  opacity: 0.8,             // Optional: overall opacity
  depthTest: true,          // Keep depth testing on
  depthWrite: false,        // Turn off depth writing for transparency
  polygonOffset: true,      // Prevent z-fighting
  polygonOffsetFactor: -4,  // Negative pushes decal forward
  roughness: 0.6,           // 0 = glossy, 1 = matte
  metalness: 0,             // 0 = non-metallic
})
```

## Common Patterns

### Texture Loading & Caching
```javascript
const textureCache = new Map()

function getTexture(imageUrl) {
  if (textureCache.has(imageUrl)) {
    return textureCache.get(imageUrl)
  }
  
  const loader = new THREE.TextureLoader()
  const texture = loader.load(imageUrl)
  texture.colorSpace = THREE.SRGBColorSpace
  textureCache.set(imageUrl, texture)
  return texture
}
```

### Updating a Decal
```javascript
// DecalGeometry is immutable, so recreate it
const newGeometry = new DecalGeometry(mesh, newPosition, newOrientation, newSize)

// Replace old geometry
decalMesh.geometry.dispose()
decalMesh.geometry = newGeometry

// Update material
decalMesh.material.opacity = newOpacity
decalMesh.material.needsUpdate = true
```

### Cleanup
```javascript
// Always dispose when removing decals
decalMesh.geometry.dispose()
decalMesh.material.dispose()
if (decalMesh.material.map) {
  decalMesh.material.map.dispose()
}
decalMesh.parent.remove(decalMesh)
```

## Comparison: drei Decal vs DecalGeometry

| Feature | @react-three/drei Decal | DecalGeometry |
|---------|------------------------|---------------|
| API | React component | Three.js class |
| Performance | Good (React overhead) | Excellent (direct) |
| Control | Limited by component | Full Three.js API |
| Debugging | React DevTools | Three.js scene graph |
| Updates | Component re-render | Direct geometry swap |
| Memory | React + Three.js | Three.js only |
| Learning | React Three Fiber | Standard Three.js |

## Troubleshooting

### Decal Not Appearing
1. Check mesh is valid: `mesh.geometry.attributes.position`
2. Verify position is near mesh: `mesh.geometry.boundingBox.containsPoint(position)`
3. Check size isn't too small: `size.x > 0.1`
4. Ensure material is transparent: `material.transparent = true`

### Decal in Wrong Position
1. Position should be in world space, not local
2. Check orientation calculation
3. Verify normal is normalized: `normal.normalize()`

### Z-Fighting (Flickering)
1. Increase `polygonOffsetFactor`: `-4` to `-10`
2. Ensure `depthWrite: false`
3. Set `renderOrder` to control draw order

### Decal Not Following Mesh
1. Use `mesh.add(decalMesh)` not `scene.add(decalMesh)`
2. Check parent relationship: `decalMesh.parent === mesh`

## Best Practices

1. **Cache textures** - Don't reload same image multiple times
2. **Dispose properly** - Always dispose geometry, material, and texture
3. **Use world space** - Position/orientation should be in world coordinates
4. **Parent correctly** - Use `mesh.add()` to attach decal
5. **Limit decal count** - Each decal is a separate draw call (aim for <50)
6. **Set renderOrder** - Control drawing order for overlapping decals

## Example: Complete Decal Creation

```javascript
async function createDecal(vehicleMesh, imageUrl, hitPoint, surfaceNormal) {
  // Load texture
  const texture = await new Promise((resolve) => {
    new THREE.TextureLoader().load(imageUrl, resolve)
  })
  texture.colorSpace = THREE.SRGBColorSpace

  // Setup geometry parameters
  const position = hitPoint.clone()
  const orientation = new THREE.Euler()
  const size = new THREE.Vector3(0.5, 0.5, 0.5)

  // Calculate orientation from normal
  const up = new THREE.Vector3(0, 0, 1)
  const quaternion = new THREE.Quaternion()
  quaternion.setFromUnitVectors(up, surfaceNormal.normalize())
  orientation.setFromQuaternion(quaternion)

  // Create decal geometry
  const geometry = new DecalGeometry(vehicleMesh, position, orientation, size)

  // Create material
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    opacity: 1,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    roughness: 0.6,
    metalness: 0,
  })

  // Create mesh
  const decalMesh = new THREE.Mesh(geometry, material)
  decalMesh.renderOrder = 1

  // Attach to vehicle
  vehicleMesh.add(decalMesh)

  return decalMesh
}
```

## Resources

- [Three.js DecalGeometry Example](https://threejs.org/examples/#webgl_decals)
- [Three.js DecalGeometry Source](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/geometries/DecalGeometry.js)
- [Three.js Raycaster Docs](https://threejs.org/docs/#api/en/core/Raycaster)

---

**Implementation Status:** ✅ Complete in `/components/DecalOverlay.jsx`

