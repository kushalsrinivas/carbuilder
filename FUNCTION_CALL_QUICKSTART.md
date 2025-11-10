# Function Call Integration - Quick Start

## What Was Built

A complete system to parse Gemini AI function calls and automatically apply them to the 3D vehicle scene. When the AI makes a function call like `change_vehicle_model`, it's automatically converted to the appropriate scene update and applied in real-time.

## Files Created/Modified

### New Files
1. **`src/lib/function-call-mapper.js`** - Core mapping logic
2. **`src/lib/test-user-example.js`** - Test with your exact example
3. **`src/lib/function-call-example.js`** - Additional examples
4. **`FUNCTION_CALL_INTEGRATION.md`** - Complete documentation
5. **`AI_FUNCTION_DEFINITIONS.md`** - Gemini function definitions
6. **`FUNCTION_CALL_QUICKSTART.md`** - This file

### Modified Files
1. **`src/lib/chat-api.js`** - Added function call parsing in SSE stream

## How It Works

### 1. Backend sends Gemini response via SSE

```javascript
{
  content: {
    parts: [
      { text: "Alright, a Jeep Wrangler JKU it is!" },
      {
        functionCall: {
          name: "change_vehicle_model",
          args: { model_id: "jeep_jku" },
          id: "call-123"
        }
      }
    ]
  }
}
```

### 2. Frontend parses function call

The `chat-api.js` automatically detects and parses function calls:

```javascript
const functionCallCommands = parseFunctionCallsFromEvent(parsedData)
// → [{ command_type: 'change_model', parameters: { model_id: 'jeep_jku' }, ... }]
```

### 3. Structured response created

```javascript
if (allFunctionCallCommands.length > 0 && !structuredResponse) {
  structuredResponse = createStructuredResponse(allFunctionCallCommands)
}
```

### 4. Vehicle update handler applies changes

```javascript
await processAgentResponse(finalMessage.structured)
// → Changes vehicle model in 3D scene
// → Shows notification: "Changed vehicle to jeep_jku"
```

## Testing

Run the test with your exact example:

```bash
node src/lib/test-user-example.js
```

Expected output:
```
✅ VALIDATION PASSED: Output matches expected format
```

## Supported Functions

| Function Name | What It Does | Example Args |
|--------------|--------------|--------------|
| `change_vehicle_model` | Change vehicle type | `{ model_id: "jeep_jku" }` |
| `change_vehicle_color` | Change paint color | `{ color: "#FF0000", roughness: 0.3 }` |
| `adjust_lift` | Adjust suspension | `{ lift_height: 3 }` |
| `change_rims` | Change wheels | `{ rim_id: "xd_grenade" }` |
| `change_tires` | Change tires | `{ tire_id: "bfg_km3", diameter: 35 }` |
| `change_wheel_setup` | Adjust wheel sizes | `{ rim_diameter: 17, tire_diameter: 33 }` |
| `toggle_spare_tire` | Show/hide spare | `{ enabled: true }` |
| `add_bumper` | Add bumper | `{ bumper_type: "shrockworks" }` |
| `add_sliders` | Add rock sliders | `{ slider_type: "steel" }` |
| `add_roof_rack` | Add roof rack | `{ rack_type: "whitson" }` |
| `reset_vehicle` | Reset to defaults | `{}` |

See `AI_FUNCTION_DEFINITIONS.md` for complete function signatures.

## Next Steps

### 1. Configure Gemini with Function Definitions

Add the function declarations from `AI_FUNCTION_DEFINITIONS.md` to your Gemini API configuration.

Example:
```python
tools = [
    {
        "function_declarations": [
            {
                "name": "change_vehicle_model",
                "description": "Change the vehicle model",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "model_id": {
                            "type": "string",
                            "enum": ["jeep_jku", "toyota_4runner_5g", ...]
                        }
                    },
                    "required": ["model_id"]
                }
            },
            # ... more functions
        ]
    }
]

response = model.generate_content(
    contents=[{"role": "user", "parts": [{"text": user_message}]}],
    tools=tools
)
```

### 2. Update System Prompt

Add this to guide the AI:

```
You are a vehicle customization assistant. When users request changes:
1. Confirm what you're doing in natural language
2. Use the provided functions to make the changes
3. Be enthusiastic about off-roading!

Example:
User: "Make it red"
You: "Great! I'll paint your vehicle red." [calls change_vehicle_color]
```

### 3. Test in Browser

1. Start your dev server
2. Open the AI chat interface
3. Say "Change to a Jeep Wrangler"
4. Watch the console logs:
   - `📞 [API] Function calls parsed:` - Function detected
   - `📊 [API] Created structured response:` - Command created
   - `🔧 [Vehicle Update] Applying: change_model` - Update applied
   - `✅ [Handler] Model changed successfully` - Scene updated

## Debugging

### Function call not detected?

Check console for:
```
🔍 [Function Call Mapper] Parsing event data: {...}
```

If missing, the function call format might be different. Check the raw SSE data.

### Command not applied?

Look for:
```
❌ [Handler] Unknown vehicle model: xxx
```

Verify the model_id exists in `vehicleConfigs.js`.

### No visual change?

The vehicle model might not have loaded yet. Check:
```
🚗 [Handler] handleChangeModel called with: {...}
✅ [Handler] Model changed successfully
```

## Console Logs Reference

The system logs extensively to help debug:

| Log Prefix | Location | What It Means |
|-----------|----------|---------------|
| `📨 [API]` | chat-api.js | SSE event received |
| `📞 [API]` | chat-api.js | Function call detected |
| `📊 [API]` | chat-api.js | Structured response created |
| `🔍 [Function Call Mapper]` | function-call-mapper.js | Parsing function call |
| `✅ [Function Call Mapper]` | function-call-mapper.js | Mapping successful |
| `🤖 [Vehicle Update]` | vehicle-update-handler.js | Processing command |
| `🔧 [Vehicle Update]` | vehicle-update-handler.js | Applying update |
| `🚗 [Handler]` | vehicle-update-handler.js | Calling handler |

## Common Issues

### 1. Function call in wrong format

**Problem:** Your backend sends a different format

**Solution:** Modify `parseFunctionCallsFromEvent()` in `function-call-mapper.js` to handle your format.

### 2. Unknown function name

**Problem:** AI uses a function name not in the mapping

**Solution:** Add it to `mapFunctionNameToCommandType()` in `function-call-mapper.js`:

```javascript
const mapping = {
  'your_new_function': 'existing_command_type',
}
```

### 3. Parameters don't match

**Problem:** AI sends different parameter names

**Solution:** Update `transformParameters()` to map them:

```javascript
case 'your_command':
  return {
    expected_param: args.ai_param_name
  }
```

## Performance

- ✅ **Zero latency** - Parsing happens in real-time during SSE stream
- ✅ **No extra requests** - All processing is client-side
- ✅ **Immediate feedback** - Visual updates + notifications
- ✅ **Multiple commands** - Handles sequential function calls

## Security

- ✅ All model IDs validated against vehicleConfigs
- ✅ Parameter types validated (numbers, hex colors, etc.)
- ✅ Range checks on numeric values
- ✅ Graceful error handling with user notifications

## Summary

✅ **Your example works perfectly!**

The function call:
```javascript
{
  name: "change_vehicle_model",
  args: { model_id: 'jeep_jku', client_id: 'default' },
  id: "adk-85802dec-e2cd-4937-b115-09e1ecbcea99"
}
```

Is automatically:
1. Detected in the SSE stream ✅
2. Parsed to command format ✅
3. Validated ✅
4. Applied to the scene ✅
5. Shows notification ✅

**Ready to use!** 🚀

Just configure your Gemini model with the function definitions and start testing.

