# computer-use-cli

Native macOS computer automation CLI built on Bun.

## Architecture
- Entry point: `src/index.ts` with command router
- Each command in `src/commands/*.ts`
- Shared utilities in `src/lib/`
- Zero runtime dependencies
- JSON output on stdout for all commands

## Native tool mapping
| Command     | macOS Tool              |
|-------------|-------------------------|
| screenshot  | screencapture -x        |
| click       | cliclick c:/rc:/dc:     |
| move        | cliclick m:             |
| drag        | cliclick dd:/du:        |
| type        | cliclick t:             |
| key         | cliclick kd:/kp:/ku:    |
| cursor      | cliclick p              |
| scroll      | swift CGEvent           |
| screen-size | system_profiler         |

## Development
- `bun link` to install globally as `computer-use`
- `computer-use doctor` to check dependencies
- Needs `brew install cliclick` and macOS Accessibility + Screen Recording permissions
