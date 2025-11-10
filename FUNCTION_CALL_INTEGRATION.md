# Function Call Integration Guide

This guide explains how Gemini AI function calls are parsed and mapped to vehicle scene handlers.

## Overview

The system bridges the gap between Gemini's function calling format and your internal scene handlers. When the AI makes a function call, it gets automatically converted to the appropriate vehicle update command and applied to the scene.

## Architecture

```
Gemini Response (SSE)
    ↓
chat-api.js (extracts function calls)
    ↓
function-call-mapper.js (transforms to commands)
    ↓
vehicle-update-handler.js (applies to scene)
    ↓
scene-handlers.js (updates game store)
```

## Function Call Format

### Input (Gemini Format)

```javascript
{
  functionCall: {
    name: "change_vehicle_model",
    args: {
      model_id: 'jeep_jku',
      client_id: 'default'
    },
    id: "adk-85802dec-e2cd-4937-b115-09e1ecbcea99"
  }
}
```

### Output (Internal Command Format)

```javascript
{
  command_type: "change_model",
  parameters: {
    model_id: 'jeep_jku'
  },
  description: "Changed vehicle to jeep_jku",
  client_id: "default",
  function_call_id: "adk-85802dec-e2cd-4937-b115-09e1ecbcea99"
}
```

## Supported Functions

### Vehicle Model

**Function Names:** `change_vehicle_model`, `set_vehicle_model`, `switch_vehicle`

**Arguments:**
- `model_id` (string, required): Vehicle model ID

**Example:**
```javascript
{
  name: "change_vehicle_model",
  args: { model_id: "jeep_jku" }
}
```

**Available Models:**
- `toyota_4runner_5g_late` - Toyota 4Runner (2014-2024)
- `toyota_4runner_5g` - Toyota 4Runner (2011-2013)
- `toyota_4runner_4g` - Toyota 4Runner (2002-2009)
- `toyota_4runner_3g` - Toyota 4Runner (1996-2002)
- `toyota_tacoma_2g_ac` - Toyota Tacoma (2005-2015)
- `toyota_j250` - Toyota Land Cruiser (2024+)
- `toyota_j80` - Toyota Land Cruiser (1990-2008)
- `jeep_jku` - Jeep Wrangler JKU
- `jeep_yj` - Jeep Wrangler YJ
- `jeep_xj` - Jeep Cherokee XJ
- `ford_bronco_6g` - Ford Bronco

---

### Vehicle Color

**Function Names:** `change_vehicle_color`, `set_vehicle_color`, `change_paint`, `set_color`

**Arguments:**
- `color` (string, hex format): Paint color (e.g., "#FF0000")
- `roughness` (number, 0-1, optional): Paint roughness/shine

**Example:**
```javascript
{
  name: "change_vehicle_color",
  args: {
    color: "#B91818",
    roughness: 0.2
  }
}
```

---

### Lift/Suspension

**Function Names:** `adjust_lift`, `set_lift`, `change_lift`, `adjust_suspension`

**Arguments:**
- `lift_height` or `lift` (number, 0-6): Lift height in inches

**Example:**
```javascript
{
  name: "adjust_lift",
  args: { lift_height: 3 }
}
```

---

### Rims

**Function Names:** `change_rims`, `set_rims`, `change_wheels`

**Arguments:**
- `rim_id` (string): Rim model ID
- `color` (string, optional): Rim color
- `secondary_color` (string, optional): Secondary rim color

**Example:**
```javascript
{
  name: "change_rims",
  args: {
    rim_id: "xd_grenade",
    color: "#000000"
  }
}
```

**Available Rims:**
- `xd_grenade` - XD Series Grenade
- `xd_machete` - XD Machete
- `level_8_strike_6` - Level 8 Strike 6
- `konig_countersteer` - Konig Countersteer
- `cragar_soft_8` - Cragar Soft 8
- `moto_metal_mO951` - Moto Metal MO951
- `ar_mojave` - American Racing Mojave
- `toyota_4runner_5thgen` - Toyota 4Runner 5th gen
- `toyota_trd` - Toyota TRD Pro
- `ford_bronco` - Ford Bronco

---

### Tires

**Function Names:** `change_tires`, `set_tires`

**Arguments:**
- `tire_id` (string): Tire model ID
- `diameter` (number, optional): Tire diameter in inches

**Example:**
```javascript
{
  name: "change_tires",
  args: {
    tire_id: "bfg_km3",
    diameter: 35
  }
}
```

**Available Tires:**
- `nitto_mud_grappler` - Nitto Mud Grappler
- `bfg_at` - BFGoodrich A/T
- `bfg_km3` - BFGoodrich KM3
- `bfg_km2` - BFGoodrich KM2
- `maxxis_trepador` - Maxxis Trepador

---

### Wheel Setup (Combined)

**Function Names:** `change_wheel_setup`, `adjust_wheel_setup`

**Arguments:**
- `rim_diameter` (number, 15-20): Rim diameter in inches
- `rim_width` (number, 7-12): Rim width in inches
- `tire_diameter` (number, 28-40): Tire diameter in inches

**Example:**
```javascript
{
  name: "change_wheel_setup",
  args: {
    rim_diameter: 17,
    rim_width: 10,
    tire_diameter: 35
  }
}
```

---

### Addons

#### Bumper

**Function Names:** `add_bumper`, `change_bumper`, `set_bumper`

**Arguments:**
- `bumper_type` or `type` (string): Bumper type ID

**Example:**
```javascript
{
  name: "add_bumper",
  args: { bumper_type: "shrockworks" }
}
```

#### Sliders

**Function Names:** `add_sliders`, `change_sliders`, `set_sliders`

**Arguments:**
- `slider_type` or `type` (string): Slider type ID

**Example:**
```javascript
{
  name: "add_sliders",
  args: { slider_type: "steel" }
}
```

#### Roof Rack

**Function Names:** `add_roof_rack`, `add_rack`, `change_rack`, `set_rack`

**Arguments:**
- `rack_type` or `type` (string): Rack type ID

**Example:**
```javascript
{
  name: "add_roof_rack",
  args: { rack_type: "whitson" }
}
```

**Note:** Addons are vehicle-specific. Check `vehicleConfigs.js` for available options per vehicle.

---

### Spare Tire

**Function Names:** `toggle_spare_tire`, `set_spare_tire`, `show_spare_tire`, `hide_spare_tire`

**Arguments:**
- `enabled` (boolean): Whether spare tire should be shown

**Example:**
```javascript
{
  name: "toggle_spare_tire",
  args: { enabled: true }
}
```

---

### Reset

**Function Names:** `reset_vehicle`, `reset_to_defaults`

**Arguments:** None

**Example:**
```javascript
{
  name: "reset_vehicle",
  args: {}
}
```

## Multiple Function Calls

The AI can make multiple function calls in a single response. They will be executed sequentially:

```javascript
{
  content: {
    parts: [
      { text: "I'll customize your vehicle now." },
      {
        functionCall: {
          name: "change_vehicle_model",
          args: { model_id: "jeep_jku" }
        }
      },
      {
        functionCall: {
          name: "change_vehicle_color",
          args: { color: "#FF0000" }
        }
      },
      {
        functionCall: {
          name: "adjust_lift",
          args: { lift_height: 4 }
        }
      }
    ]
  }
}
```

## Integration Flow

### 1. SSE Stream Processing (chat-api.js)

When receiving streaming data from the backend:

```javascript
// Parse incoming event
const parsedData = JSON.parse(eventData)

// Extract function calls
const functionCallCommands = parseFunctionCallsFromEvent(parsedData)

// Accumulate commands
allFunctionCallCommands.push(...functionCallCommands)
```

### 2. Create Structured Response

If function calls are detected but no structured response exists:

```javascript
if (allFunctionCallCommands.length > 0 && !structuredResponse) {
  structuredResponse = createStructuredResponse(allFunctionCallCommands)
}
```

### 3. Process Commands (ChatInterface.jsx)

The chat interface automatically processes the structured response:

```javascript
if (finalMessage.structured) {
  await processAgentResponse(finalMessage.structured)
}
```

### 4. Apply Updates (vehicle-update-handler.js)

Commands are applied sequentially with visual feedback:

```javascript
for (const update of updates) {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const success = applyVehicleUpdate(update)
  // Show notification
}
```

## Testing

Run the example file to see how function calls are parsed:

```bash
node src/lib/function-call-example.js
```

## Error Handling

The system includes comprehensive error handling:

1. **Unknown Function Names:** Logged and ignored
2. **Invalid Parameters:** Caught and error notification shown
3. **Missing Vehicle Models:** Validated against vehicleConfigs
4. **Parse Errors:** Logged with full context

## Logging

Detailed console logs help debug the flow:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 [Function Call Mapper] Parsing function call
   Name: change_vehicle_model
   Args: { model_id: 'jeep_jku', client_id: 'default' }
   ID: adk-85802dec-e2cd-4937-b115-09e1ecbcea99
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ [Function Call Mapper] Mapped to command type: change_model
📦 [Function Call Mapper] Transformed parameters: { model_id: 'jeep_jku' }
📝 [Function Call Mapper] Generated description: Changed vehicle to jeep_jku
✅ [Function Call Mapper] Created command: {...}
```

## Adding New Functions

To add support for a new function:

1. **Add mapping in function-call-mapper.js:**
```javascript
const mapping = {
  'your_new_function': 'your_command_type',
}
```

2. **Add parameter transformation:**
```javascript
case 'your_command_type':
  return {
    param1: args.param1,
    param2: args.param2
  }
```

3. **Add description generation:**
```javascript
case 'your_command_type':
  return `Description of ${args.param1}`
```

4. **Add handler in vehicle-update-handler.js:**
```javascript
case 'your_command_type':
  handleYourNewCommand(parameters)
  break
```

5. **Implement the handler function:**
```javascript
function handleYourNewCommand(params) {
  useGameStore.getState().setVehicle({ ... })
}
```

## Best Practices

1. **Always validate parameters** in handlers
2. **Use descriptive function names** that map clearly to actions
3. **Provide helpful error messages** for users
4. **Log extensively** for debugging
5. **Test with multiple function calls** to ensure proper sequencing
6. **Check vehicle compatibility** for addons

## Troubleshooting

### Function calls not being detected

Check console logs for:
- `📞 [API] Function calls parsed:` - Should show detected calls
- `📊 [API] Created structured response:` - Should show created structure

### Commands not being applied

Check:
- `🔧 [Vehicle Update] Applying:` - Should show each command
- Error messages in handler functions
- vehicleConfigs for valid IDs

### Incorrect mapping

- Verify function name in `mapFunctionNameToCommandType`
- Check parameter transformation in `transformParameters`
- Ensure handler exists in vehicle-update-handler.js

## Summary

The function call integration provides seamless translation between Gemini's native function calling format and your internal command structure. It automatically:

- ✅ Detects function calls in SSE streams
- ✅ Maps function names to command types
- ✅ Transforms parameters to correct format
- ✅ Generates user-friendly descriptions
- ✅ Creates structured responses
- ✅ Applies updates with visual feedback
- ✅ Handles errors gracefully
- ✅ Logs comprehensively for debugging

The system is extensible and can easily accommodate new functions as your application grows.

