# 🏗️ Decal System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐           ┌──────────────────┐           │
│  │  DecalManager    │           │   DecalEditor    │           │
│  │  (Upload & List) │           │  (Edit Controls) │           │
│  └────────┬─────────┘           └────────┬─────────┘           │
│           │                               │                      │
│           └───────────────┬───────────────┘                      │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      State Management Layer                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│                      ┌──────────────┐                           │
│                      │  gameStore   │                           │
│                      │  (Zustand)   │                           │
│                      └──────┬───────┘                           │
│                             │                                    │
│      ┌──────────────────────┼──────────────────────┐           │
│      │                      │                       │           │
│      ▼                      ▼                       ▼           │
│  decals[]          selectedDecalId          placementMode       │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      3D Rendering Layer                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│                    ┌──────────────────┐                         │
│                    │  DecalOverlay    │                         │
│                    │  (Three.js)      │                         │
│                    └────────┬─────────┘                         │
│                             │                                    │
│      ┌──────────────────────┼──────────────────────┐           │
│      ▼                      ▼                       ▼           │
│  Raycaster           Decal Geometry           Texture Loading   │
│  (Click detect)      (3D rendering)           (Base64→Texture)  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  GPU Render   │
                    │  (WebGL)      │
                    └───────────────┘
```

---

## Component Hierarchy

```
App.jsx
├── Canvas.jsx
│   └── DecalOverlay.jsx ← 3D rendering & interaction
├── DecalManager.jsx     ← Upload & list management
└── DecalEditor.jsx      ← Property editing controls
```

---

## Data Flow Diagram

### Upload Flow
```
User selects file
      ↓
File Input onChange
      ↓
Validate (type & size)
      ↓
FileReader.readAsDataURL()
      ↓
Base64 string
      ↓
gameStore.addDecal()
      ↓
decals[] array updated
      ↓
DecalOverlay re-renders
      ↓
Decal appears on vehicle
```

### Placement Flow
```
User clicks canvas
      ↓
Canvas onClick event
      ↓
Calculate NDC coordinates
      ↓
Raycaster.setFromCamera()
      ↓
Intersect with vehicle mesh
      ↓
Get intersection point & normal
      ↓
Calculate rotation from normal
      ↓
gameStore.updateDecal()
      ↓
Decal position updated
      ↓
Decal moves to new location
```

### Edit Flow
```
User adjusts slider
      ↓
Slider onChange event
      ↓
Update local state (immediate feedback)
      ↓
gameStore.updateDecal()
      ↓
decals[] updated
      ↓
DecalOverlay re-renders
      ↓
Visual change on vehicle
```

---

## State Structure

### Decal Object Schema
```javascript
{
  id: String,              // "decal_1234567890"
  imageUrl: String,        // "data:image/png;base64,..."
  fileName: String,        // "my-logo.png"
  position: {
    x: Number,            // 3D position
    y: Number,
    z: Number
  },
  rotation: {
    x: Number,            // Euler angles (radians)
    y: Number,
    z: Number
  },
  scale: {
    x: Number,            // Uniform scale recommended
    y: Number,
    z: Number
  },
  opacity: Number,        // 0.0 to 1.0
  normal: {
    x: Number,            // Surface normal (for reference)
    y: Number,
    z: Number
  }
}
```

### Store State
```javascript
{
  decals: Array<Decal>,           // All decals
  selectedDecalId: String | null, // Currently selected
  placementMode: Boolean,         // Click-to-place active
  
  // Actions
  addDecal: (data) => void,
  updateDecal: (id, updates) => void,
  deleteDecal: (id) => void,
  setSelectedDecal: (id) => void,
  setPlacementMode: (mode) => void,
  clearDecals: () => void
}
```

---

## Component Responsibilities

### DecalManager (UI Component)
**Purpose:** Main control panel for decal management

**Responsibilities:**
- File upload handling
- File validation (type, size)
- Display decal list with thumbnails
- Handle selection
- Delete operations
- Toggle panel visibility

**State:** Local UI state (isOpen, uploadError)

**Store Access:** Read decals, selectedDecalId; Write via actions

---

### DecalEditor (UI Component)
**Purpose:** Property editor for selected decal

**Responsibilities:**
- Display edit controls (sliders)
- Real-time value feedback
- Update decal properties
- Show/hide based on selection

**State:** Local values for sliders (immediate feedback)

**Store Access:** Read selectedDecalId, decals; Write via updateDecal

---

### DecalOverlay (3D Component)
**Purpose:** Render decals in 3D scene and handle placement

**Responsibilities:**
- Find vehicle mesh
- Render all decals as 3D geometry
- Handle click-to-place via raycasting
- Load textures from base64
- Calculate surface normals
- Update cursor style

**State:** Local state for vehicle mesh reference

**Store Access:** Read all decal state; Write position/rotation updates

---

## Interaction Patterns

### Pattern 1: Upload & Place
```
User                DecalManager         gameStore         DecalOverlay
  │                      │                   │                   │
  ├─ Click Upload ──────>│                   │                   │
  │                      │                   │                   │
  ├─ Select File ───────>│                   │                   │
  │                      │                   │                   │
  │                      ├─ addDecal() ─────>│                   │
  │                      │                   │                   │
  │                      │                   ├─ Update State ───>│
  │                      │                   │                   │
  │                      │                   │     Decal Renders │
  │                      │                   │                   │
  ├─ Click Vehicle ──────┼───────────────────┼──────────────────>│
  │                      │                   │                   │
  │                      │                   │<── updateDecal()──┤
  │                      │                   │                   │
  │<─────────────────────┴─── Decal Placed ─┴───────────────────┤
```

### Pattern 2: Edit & Adjust
```
User                DecalEditor          gameStore         DecalOverlay
  │                      │                   │                   │
  ├─ Select Decal ──────>│                   │                   │
  │                      │                   │                   │
  │                      │<── Get Decal ─────┤                   │
  │                      │                   │                   │
  │<──── Show Editor ────┤                   │                   │
  │                      │                   │                   │
  ├─ Adjust Slider ─────>│                   │                   │
  │                      │                   │                   │
  │                      ├─ updateDecal() ───>│                   │
  │                      │                   │                   │
  │                      │                   ├─ Update State ───>│
  │                      │                   │                   │
  │<─────────────────────┴─── Visual Update ┴───────────────────┤
```

### Pattern 3: Delete
```
User                DecalManager         gameStore         DecalOverlay
  │                      │                   │                   │
  ├─ Click Delete ──────>│                   │                   │
  │                      │                   │                   │
  │                      ├─ deleteDecal() ───>│                   │
  │                      │                   │                   │
  │                      │                   ├─ Remove from Array>│
  │                      │                   │                   │
  │<─────────────────────┴─── Decal Removed ┴───────────────────┤
```

---

## 3D Rendering Pipeline

### Texture Loading
```
Base64 String
      ↓
TextureLoader.load()
      ↓
THREE.Texture object
      ↓
Set encoding (sRGB)
      ↓
Pass to material
```

### Decal Geometry Creation
```
Decal position
      ↓
Decal rotation (from normal)
      ↓
Decal scale
      ↓
Target mesh (vehicle)
      ↓
DecalGeometry.create()
      ↓
Project onto mesh surface
      ↓
Generate UV mapping
      ↓
Render with texture
```

### Raycasting for Placement
```
Mouse click (x, y)
      ↓
Convert to NDC (-1 to 1)
      ↓
Raycaster.setFromCamera()
      ↓
Ray from camera through point
      ↓
Intersect with vehicle mesh
      ↓
Get first intersection
      ↓
Extract point & normal
      ↓
Update decal transform
```

---

## Integration Points

### With Existing Systems

#### Vehicle System
- Decals render alongside vehicle mesh
- No modifications to vehicle component
- Uses vehicle mesh reference for placement

#### Save/Load System
- Decals can be saved with vehicle config
- Base64 data preserved in storage
- Restore via addDecal() for each saved decal

#### AI Chat System
- Vehicle update handler commands
- Structured JSON commands
- Integrates with existing command pipeline

---

## Performance Considerations

### Optimizations
```
Texture Caching
    ↓
TextureLoader cache ─→ Reuse loaded textures

Component Memoization
    ↓
React.memo() ─→ Avoid unnecessary re-renders

State Updates
    ↓
Zustand ─→ Only update affected components

Raycasting
    ↓
On-demand ─→ Only when in placement/edit mode
```

### Bottlenecks
```
Many Decals (20+)
    ↓
Multiple draw calls
    ↓
Solution: Consider texture atlasing

Large Images (>5MB)
    ↓
Memory usage
    ↓
Solution: Enforce size limit, compress

Base64 Storage
    ↓
String size in memory
    ↓
Solution: Consider IndexedDB for large collections
```

---

## Error Handling

### Upload Validation
```javascript
if (!validTypes.includes(file.type)) {
  → Show error: "Invalid file type"
  → Prevent upload
}

if (file.size > MAX_SIZE) {
  → Show error: "File too large"
  → Prevent upload
}
```

### Texture Loading
```javascript
loader.load(
  url,
  onSuccess,  → Use texture
  onProgress, → (Optional progress bar)
  onError     → Console warning, skip decal
)
```

### Mesh Detection
```javascript
if (!vehicleMesh) {
  → Console warning
  → Retry after delay
  → Graceful degradation (no crash)
}
```

---

## Testing Strategy

### Unit Tests (Recommended)
- Store actions (add, update, delete)
- Validation functions (file type, size)
- Utility functions (coordinate conversion)

### Integration Tests (Recommended)
- Upload flow (file → store → render)
- Placement flow (click → raycast → update)
- Edit flow (slider → store → visual)

### E2E Tests (Recommended)
- Complete workflows
- Multiple decals
- Save/load with decals

---

## Security Considerations

### File Upload
- ✅ Client-side type validation
- ✅ Size limit enforcement
- ✅ No server upload (local only)
- ✅ Base64 encoding (safe for storage)

### XSS Prevention
- ✅ No innerHTML usage
- ✅ React escaping by default
- ✅ Image URLs validated

---

## Future Architecture Improvements

### Scalability
- Implement texture atlasing for many decals
- Add virtual scrolling for large decal lists
- Optimize raycasting with spatial partitioning

### Features
- Add undo/redo with command pattern
- Implement layer system for z-ordering
- Add decal groups for batch operations

### Performance
- Lazy load textures (load on demand)
- Implement level-of-detail for decals
- Add worker thread for image processing

---

## Documentation Map

```
DECAL_ARCHITECTURE.md ← You are here (Technical architecture)
        │
        ├─── DECAL_FEATURE.md (Feature documentation)
        │
        ├─── DECAL_QUICK_START.md (User guide)
        │
        ├─── IMPLEMENTATION_SUMMARY.md (Implementation details)
        │
        ├─── CHANGELOG_DECAL_FEATURE.md (Version history)
        │
        └─── examples/decal-usage-examples.js (Code examples)
```

---

**Built with:** React Three Fiber, Three.js, Zustand
**Status:** Production Ready ✅

