# computer-use

Native computer automation CLI for **macOS** and **Linux**. Control your desktop from the command line — screenshots, mouse, keyboard, scrolling.

Built for use with AI coding agents (Claude Code, etc.) but works standalone.

## Install

### From release (recommended)

Download the binary for your platform from [Releases](https://github.com/alexbruf/computer-use-cli/releases), then:

```bash
chmod +x computer-use
sudo mv computer-use /usr/local/bin/
```

### From source

```bash
git clone https://github.com/alexbruf/computer-use-cli.git
cd computer-use-cli
bun install
bun run build  # produces dist/computer-use
```

### Prerequisites

**macOS:**
- `brew install cliclick`
- Enable Accessibility and Screen Recording for your terminal in System Settings > Privacy & Security

**Linux (X11):**
- `apt install xdotool scrot` (Debian/Ubuntu) or `dnf install xdotool scrot` (Fedora)
- X11 display (`DISPLAY` env var must be set)

Run `computer-use doctor` to verify everything is set up.

## Usage

```
computer-use <command> [args] [--json]
```

### Commands

| Command | Description | Example |
|---------|-------------|---------|
| `screenshot` | Capture screen | `computer-use screenshot --file /tmp/ss.png` |
| `click <x> <y>` | Click at coordinates | `computer-use click 500 300 --button right` |
| `move <x> <y>` | Move cursor | `computer-use move 500 300` |
| `drag <fx> <fy> <tx> <ty>` | Drag between points | `computer-use drag 100 100 400 400` |
| `type <text>` | Type text | `computer-use type "Hello, world!"` |
| `key <combo>` | Press key combo | `computer-use key cmd+c` |
| `cursor` | Get cursor position | `computer-use cursor` |
| `scroll <direction>` | Scroll | `computer-use scroll down --amount 5` |
| `screen-size` | Get display dimensions | `computer-use screen-size` |
| `doctor` | Check deps/permissions | `computer-use doctor` |

### Output

Human-readable by default:

```
$ computer-use cursor
x: 871
y: 565
```

Add `--json` for machine-parseable output:

```
$ computer-use cursor --json
{"success":true,"data":{"x":871,"y":565},"error":null}
```

### Key combos

Modifiers: `cmd`/`super`, `ctrl`, `alt`/`option`, `shift`, `fn`
Keys: `return`/`enter`, `tab`, `space`, `escape`/`esc`, `delete`, `up`, `down`, `left`, `right`, `f1`-`f16`, `home`, `end`, `pageup`, `pagedown`

Join with `+`: `cmd+c`, `cmd+shift+s`, `ctrl+alt+delete`

> On Linux, `cmd` maps to `super` (the "Windows" key).

### Coordinates

- Logical pixels, `(0, 0)` is top-left of main display
- Use `screen-size` to get dimensions

## How it works

Thin wrapper around native OS tools, auto-detected by platform:

| Command | macOS | Linux |
|---------|-------|-------|
| screenshot | `screencapture` | `scrot` |
| click, move, drag, type, key, cursor | `cliclick` | `xdotool` |
| scroll | Swift `CGEvent` | `xdotool` |
| screen-size | `system_profiler` | `xdotool` |

All subprocesses are spawned with array arguments (no shell interpolation) for safety.

## License

MIT
