---
name: computer-use
description: >
  Control the macOS GUI — take screenshots, click, type, scroll, drag, and read
  cursor position using the `computer-use` CLI. Use when you need to interact with
  desktop applications, automate UI workflows, verify visual state, or perform any
  action that requires seeing or controlling the screen.
allowed-tools: Bash, Read
argument-hint: "[task description]"
---

You have access to the `computer-use` CLI for native macOS GUI automation.
Run all commands via the Bash tool. Use `--json` when you need to parse output programmatically.

## Workflow

1. Get screen dimensions: `computer-use screen-size`
2. Take a screenshot to see what's on screen: `computer-use screenshot --file /tmp/ss.png`
3. Read the screenshot with the Read tool to understand what's visible
4. Act — click, type, scroll, press keys as needed
5. Screenshot again to verify the result
6. Repeat until the task described in `$ARGUMENTS` is complete

## Commands

```bash
# See the screen
computer-use screenshot --file /tmp/ss.png   # save to file (use Read tool to view)
computer-use screenshot                       # returns base64 to stdout
computer-use screen-size                      # display dimensions

# Mouse
computer-use click <x> <y>                   # left click
computer-use click <x> <y> --button right    # right click
computer-use click <x> <y> --button double   # double click
computer-use move <x> <y>                    # move cursor
computer-use drag <fx> <fy> <tx> <ty>        # drag
computer-use cursor                           # get current position

# Keyboard
computer-use type "text here"                 # type text
computer-use key cmd+c                        # key combo (cmd+c, cmd+shift+s, etc.)
computer-use key Return                       # single key (Return, tab, escape, etc.)

# Scroll
computer-use scroll down                      # scroll active window
computer-use scroll up --amount 10            # scroll with custom amount

# Diagnostics
computer-use doctor                           # verify deps and permissions
```

## Coordinates

- Logical pixels (non-retina), (0,0) is top-left of main display
- Use `screen-size` to get bounds, `cursor` to get current position
- Screenshots are at full retina resolution — scale coordinates accordingly when mapping from screenshot pixels to click targets

## Key names

Modifiers: `cmd`, `ctrl`, `alt`/`option`, `shift`, `fn`
Keys: `return`/`enter`, `tab`, `space`, `escape`/`esc`, `delete`/`backspace`, `up`, `down`, `left`, `right`, `f1`-`f16`, `home`, `end`, `pageup`, `pagedown`
Combos: join with `+` (e.g., `cmd+shift+z`)

## Tips

- Always screenshot before and after actions to confirm state
- If a click doesn't land where expected, re-screenshot and recalculate coordinates
- Use `--json` flag for machine-parseable output from any command
- For text input into a focused field, prefer `computer-use type` over clicking + typing
- Run `computer-use doctor` if commands fail unexpectedly
