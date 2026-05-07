# Local Username — Revenge Plugin

Visually change how your username appears in Discord chat on Android (Revenge client).

## Features
- **Custom Username**: Set any display name you want — only visible to YOU
- **Settings UI**: Built-in settings panel to configure your custom name
- **Purely cosmetic**: No server-side changes, no one else sees it

## Installation (Revenge — Classic/Stable)

### Option 1: Plugin Repository
1. Open Revenge → Plugins → Add Repository
2. Enter the raw GitHub URL to this folder's `builds/local.username/` directory
3. Install and enable the plugin

### Option 2: Direct Install
1. Host `manifest.json` and `index.js` on a web server or GitHub Pages
2. Add the URL as a plugin repository in Revenge
3. Install and enable

### Option 3: Local Development
1. Place the `localUsername` folder in your Revenge plugins directory
2. Enable the plugin from the Plugins settings

## Usage
1. Enable the plugin in Revenge → Plugins
2. Open the plugin settings
3. Enter your desired custom username
4. Tap "Save Username"
5. Your username will now appear with the custom name in chat (only for you)

## File Structure
```
localUsername/
├── manifest.json    # Plugin metadata (spec 3)
├── index.js         # Plugin code
└── README.md        # This file
```

## API Compatibility
- **Client**: Revenge (classic/stable) — Vendetta/Bunny fork
- **Spec**: 3
- **APIs used**: `bunny.api.patcher`, `bunny.metro`, `bunny.plugin`

## Notes
- This is a **visual-only** plugin — it patches React components to display a different username
- Only affects your local view; other users see your real username
- Compatible with Revenge classic (Android)
