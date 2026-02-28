# computer-use

Native macOS computer automation CLI. Control your Mac from the command line — screenshots, mouse, keyboard, scrolling.

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

- **cliclick** — `brew install cliclick` (mouse/keyboard control)
- **macOS permissions** — Accessibility and Screen Recording must be enabled for your terminal app in System Settings > Privacy & Security

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

Modifiers: `cmd`, `ctrl`, `alt`/`option`, `shift`, `fn`
Keys: `return`/`enter`, `tab`, `space`, `escape`/`esc`, `delete`, `up`, `down`, `left`, `right`, `f1`-`f16`, `home`, `end`, `pageup`, `pagedown`

Join with `+`: `cmd+c`, `cmd+shift+s`, `ctrl+alt+delete`

### Coordinates

- Logical (non-retina) pixels
- `(0, 0)` is top-left of main display
- Use `screen-size` to get dimensions

## How it works

Thin wrapper around native macOS tools:

| Command | Underlying tool |
|---------|----------------|
| screenshot | `screencapture` (built-in) |
| click, move, drag, type, key, cursor | `cliclick` (brew) |
| scroll | Swift `CGEvent` (built-in) |
| screen-size | `system_profiler` (built-in) |

All subprocesses are spawned with array arguments (no shell interpolation) for safety.

## License

MIT
