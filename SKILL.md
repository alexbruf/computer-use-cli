# computer-use: Native macOS Computer Automation

Use this skill when you need to interact with the macOS GUI — clicking, typing, taking screenshots, scrolling, or reading cursor position. This is a local CLI tool, not a Docker container or remote service.

## Setup
Requires: `brew install cliclick` and macOS Accessibility + Screen Recording permissions for your terminal.
Run `computer-use doctor` to verify.

## Commands

All commands output JSON: `{ success: boolean, data: any, error: string | null }`

### Screenshot
```bash
computer-use screenshot                     # Returns { base64_image, format: "png" }
computer-use screenshot --file /tmp/ss.png  # Saves to file, returns { file, format }
```

### Click
```bash
computer-use click 500 300                  # Left click at (500, 300)
computer-use click 500 300 --button right   # Right click
computer-use click 500 300 --button double  # Double click
```

### Move Cursor
```bash
computer-use move 500 300
```

### Drag
```bash
computer-use drag 100 100 400 400           # Drag from (100,100) to (400,400)
```

### Type Text
```bash
computer-use type "Hello, world!"
```

### Key Press / Combo
```bash
computer-use key Return
computer-use key cmd+c
computer-use key cmd+shift+s
computer-use key tab
computer-use key escape
```

### Cursor Position
```bash
computer-use cursor                         # Returns { x, y }
```

### Scroll
```bash
computer-use scroll down
computer-use scroll up --amount 10
computer-use scroll right
```

### Screen Size
```bash
computer-use screen-size                    # Returns { width, height, screens: [...] }
```

### Doctor
```bash
computer-use doctor                         # Check cliclick, permissions
```

## Coordinates
- Logical (non-retina) pixels, (0,0) is top-left of main display
- Use `screen-size` to get dimensions, `cursor` to find current position

## Workflow Pattern
1. `computer-use screen-size` to learn dimensions
2. `computer-use screenshot --file /tmp/ss.png` to see the screen
3. Identify target coordinates from the screenshot
4. `computer-use click <x> <y>` or `computer-use type "text"` to interact
5. `computer-use screenshot` again to verify the result

## Key Names
Modifiers: cmd, ctrl, alt/option, shift, fn
Keys: return/enter, tab, space, escape/esc, delete/backspace, up, down, left, right, f1-f16, home, end, pageup, pagedown
Combos: join with `+` (e.g., `cmd+shift+z`)
