# AI Function Definitions for Gemini

This document contains the function definitions that should be provided to the Gemini AI model for vehicle customization.

## Function Declaration Format

These declarations should be provided to Gemini in the system prompt or function calling configuration:

---

### 1. change_vehicle_model

**Description:** Change the vehicle model/body type

**Parameters:**
```json
{
  "name": "change_vehicle_model",
  "description": "Change the vehicle model to a different make/model",
  "parameters": {
    "type": "object",
    "properties": {
      "model_id": {
        "type": "string",
        "description": "The vehicle model ID to switch to",
        "enum": [
          "toyota_4runner_5g_late",
          "toyota_4runner_5g",
          "toyota_4runner_4g",
          "toyota_4runner_3g",
          "toyota_tacoma_2g_ac",
          "toyota_j250",
          "toyota_j80",
          "jeep_jku",
          "jeep_yj",
          "jeep_xj",
          "ford_bronco_6g"
        ]
      },
      "client_id": {
        "type": "string",
        "description": "Client identifier for tracking",
        "default": "default"
      }
    },
    "required": ["model_id"]
  }
}
```

**Example Usage:**
```javascript
{
  name: "change_vehicle_model",
  args: {
    model_id: "jeep_jku",
    client_id: "default"
  }
}
```

---

### 2. change_vehicle_color

**Description:** Change the vehicle paint color and finish

**Parameters:**
```json
{
  "name": "change_vehicle_color",
  "description": "Change the vehicle's paint color and/or roughness (glossiness)",
  "parameters": {
    "type": "object",
    "properties": {
      "color": {
        "type": "string",
        "description": "Hex color code for the paint (e.g., #FF0000 for red)",
        "pattern": "^#[0-9A-Fa-f]{6}$"
      },
      "roughness": {
        "type": "number",
        "description": "Paint roughness/finish: 0 = glossy/shiny, 1 = matte/rough",
        "minimum": 0,
        "maximum": 1
      }
    }
  }
}
```

**Common Colors:**
- Red: `#B91818`
- Blue: `#1890B9`
- Green: `#18B95B`
- Black: `#121212`
- White: `#FFFFFF`
- Silver: `#C0C0C0`
- Yellow: `#FFD700`
- Orange: `#FF8C00`

---

### 3. adjust_lift

**Description:** Adjust the vehicle's suspension lift height

**Parameters:**
```json
{
  "name": "adjust_lift",
  "description": "Adjust the vehicle's suspension lift height in inches",
  "parameters": {
    "type": "object",
    "properties": {
      "lift_height": {
        "type": "number",
        "description": "Lift height in inches",
        "minimum": 0,
        "maximum": 6
      }
    },
    "required": ["lift_height"]
  }
}
```

---

### 4. change_rims

**Description:** Change the wheel rims

**Parameters:**
```json
{
  "name": "change_rims",
  "description": "Change the vehicle's wheel rims (wheels without tires)",
  "parameters": {
    "type": "object",
    "properties": {
      "rim_id": {
        "type": "string",
        "description": "The rim model ID",
        "enum": [
          "xd_grenade",
          "xd_machete",
          "level_8_strike_6",
          "konig_countersteer",
          "cragar_soft_8",
          "moto_metal_mO951",
          "ar_mojave",
          "toyota_4runner_5thgen",
          "toyota_trd",
          "ford_bronco"
        ]
      },
      "color": {
        "type": "string",
        "description": "Primary rim color (hex code or 'silver')"
      },
      "secondary_color": {
        "type": "string",
        "description": "Secondary rim color for two-tone wheels"
      }
    }
  }
}
```

---

### 5. change_tires

**Description:** Change the tires

**Parameters:**
```json
{
  "name": "change_tires",
  "description": "Change the vehicle's tires",
  "parameters": {
    "type": "object",
    "properties": {
      "tire_id": {
        "type": "string",
        "description": "The tire model ID",
        "enum": [
          "nitto_mud_grappler",
          "bfg_at",
          "bfg_km3",
          "bfg_km2",
          "maxxis_trepador"
        ]
      },
      "diameter": {
        "type": "integer",
        "description": "Tire diameter in inches",
        "minimum": 28,
        "maximum": 40
      }
    }
  }
}
```

---

### 6. change_wheel_setup

**Description:** Change complete wheel configuration (rim and tire dimensions)

**Parameters:**
```json
{
  "name": "change_wheel_setup",
  "description": "Adjust rim and tire dimensions together",
  "parameters": {
    "type": "object",
    "properties": {
      "rim_diameter": {
        "type": "integer",
        "description": "Rim diameter in inches",
        "minimum": 15,
        "maximum": 20
      },
      "rim_width": {
        "type": "number",
        "description": "Rim width in inches",
        "minimum": 7,
        "maximum": 12
      },
      "tire_diameter": {
        "type": "integer",
        "description": "Tire diameter in inches (overall height)",
        "minimum": 28,
        "maximum": 40
      }
    }
  }
}
```

---

### 7. add_bumper

**Description:** Add or change front bumper (vehicle-specific)

**Parameters:**
```json
{
  "name": "add_bumper",
  "description": "Add or change the front bumper. Only available on certain vehicles (e.g., Toyota 4Runner 3G)",
  "parameters": {
    "type": "object",
    "properties": {
      "bumper_type": {
        "type": "string",
        "description": "Bumper type ID (vehicle-specific)",
        "examples": ["stock", "shrockworks"]
      }
    },
    "required": ["bumper_type"]
  }
}
```

---

### 8. add_sliders

**Description:** Add or change rock sliders (vehicle-specific)

**Parameters:**
```json
{
  "name": "add_sliders",
  "description": "Add or change rock sliders/running boards. Only available on certain vehicles",
  "parameters": {
    "type": "object",
    "properties": {
      "slider_type": {
        "type": "string",
        "description": "Slider type ID (vehicle-specific)",
        "examples": ["stock", "steel"]
      }
    },
    "required": ["slider_type"]
  }
}
```

---

### 9. add_roof_rack

**Description:** Add or change roof rack (vehicle-specific)

**Parameters:**
```json
{
  "name": "add_roof_rack",
  "description": "Add or change roof rack. Only available on certain vehicles",
  "parameters": {
    "type": "object",
    "properties": {
      "rack_type": {
        "type": "string",
        "description": "Roof rack type ID (vehicle-specific)",
        "examples": ["stock", "whitson"]
      }
    },
    "required": ["rack_type"]
  }
}
```

---

### 10. toggle_spare_tire

**Description:** Show or hide spare tire

**Parameters:**
```json
{
  "name": "toggle_spare_tire",
  "description": "Show or hide the spare tire on vehicles that support it",
  "parameters": {
    "type": "object",
    "properties": {
      "enabled": {
        "type": "boolean",
        "description": "Whether to show (true) or hide (false) the spare tire"
      }
    },
    "required": ["enabled"]
  }
}
```

---

### 11. reset_vehicle

**Description:** Reset vehicle to default configuration

**Parameters:**
```json
{
  "name": "reset_vehicle",
  "description": "Reset the vehicle to its default configuration (keeps current model)",
  "parameters": {
    "type": "object",
    "properties": {}
  }
}
```

---

## Complete Gemini Configuration Example

Here's how to configure these functions in your Gemini API call:

```javascript
const tools = [
  {
    function_declarations: [
      {
        name: "change_vehicle_model",
        description: "Change the vehicle model to a different make/model",
        parameters: {
          type: "object",
          properties: {
            model_id: {
              type: "string",
              description: "The vehicle model ID",
              enum: [
                "toyota_4runner_5g_late",
                "toyota_4runner_5g",
                "toyota_4runner_4g",
                "toyota_4runner_3g",
                "toyota_tacoma_2g_ac",
                "toyota_j250",
                "toyota_j80",
                "jeep_jku",
                "jeep_yj",
                "jeep_xj",
                "ford_bronco_6g"
              ]
            },
            client_id: {
              type: "string",
              description: "Client identifier",
              default: "default"
            }
          },
          required: ["model_id"]
        }
      },
      {
        name: "change_vehicle_color",
        description: "Change the vehicle's paint color and finish",
        parameters: {
          type: "object",
          properties: {
            color: {
              type: "string",
              description: "Hex color code (e.g., #FF0000)"
            },
            roughness: {
              type: "number",
              description: "0=glossy, 1=matte",
              minimum: 0,
              maximum: 1
            }
          }
        }
      },
      // ... include all other function declarations
    ]
  }
]

const response = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: userMessage }] }],
  tools: tools,
  tool_config: {
    function_calling_config: {
      mode: "ANY" // or "AUTO" to let model decide
    }
  }
})
```

## System Prompt Suggestions

Add this to your system prompt to help the AI understand the functions:

```
You are a vehicle customization assistant for a 4x4 builder application. You can help users customize their off-road vehicles using the following capabilities:

1. Change vehicle models (Toyota 4Runner, Tacoma, Land Cruiser, Jeep Wrangler, Jeep Cherokee, Ford Bronco)
2. Customize paint color and finish (glossy to matte)
3. Adjust suspension lift (0-6 inches)
4. Change wheels and tires (multiple brands and sizes)
5. Add accessories like bumpers, sliders, and roof racks (vehicle-specific)
6. Show/hide spare tire

When users request changes, use the provided functions to apply them. Be conversational and enthusiastic about off-roading!

Always confirm what changes you're making before calling the functions.
```

## Natural Language Examples

Here are examples of user requests and the corresponding function calls:

### "Change to a Jeep Wrangler JKU"
```javascript
{
  name: "change_vehicle_model",
  args: { model_id: "jeep_jku" }
}
```

### "Make it red"
```javascript
{
  name: "change_vehicle_color",
  args: { color: "#FF0000" }
}
```

### "Give it a 3 inch lift"
```javascript
{
  name: "adjust_lift",
  args: { lift_height: 3 }
}
```

### "Put on some 35 inch BFG KM3s"
```javascript
{
  name: "change_tires",
  args: {
    tire_id: "bfg_km3",
    diameter: 35
  }
}
```

### "Make it a blue Toyota 4Runner with a 4 inch lift and 33 inch tires"
```javascript
// Multiple function calls in sequence:
[
  {
    name: "change_vehicle_model",
    args: { model_id: "toyota_4runner_5g" }
  },
  {
    name: "change_vehicle_color",
    args: { color: "#1890B9" }
  },
  {
    name: "adjust_lift",
    args: { lift_height: 4 }
  },
  {
    name: "change_wheel_setup",
    args: { tire_diameter: 33 }
  }
]
```

## Response Format

The AI should respond with:
1. **Text** explaining what it's doing
2. **Function calls** to make the changes

Example response structure:
```javascript
{
  content: {
    parts: [
      {
        text: "Alright! I'll change your vehicle to a Jeep Wrangler JKU. Great choice for off-roading!"
      },
      {
        functionCall: {
          name: "change_vehicle_model",
          args: {
            model_id: "jeep_jku",
            client_id: "default"
          },
          id: "unique-call-id"
        }
      }
    ]
  }
}
```

## Testing

You can test function calling with:

```bash
# Run the example
node src/lib/function-call-example.js

# Check browser console for detailed logs when using the chat interface
```

## Notes

- All function calls are processed client-side
- Changes are applied immediately with visual feedback
- Multiple functions can be called in a single response
- Vehicle-specific addons (bumpers, sliders, racks) are only available on certain models
- Check `vehicleConfigs.js` for the complete list of available options per vehicle

