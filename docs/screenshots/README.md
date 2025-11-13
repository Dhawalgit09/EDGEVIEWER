# Screenshots Guide

This directory contains screenshots of the EdgeViewer application.

## How to Add Screenshots

### For Android App:

1. **Take a screenshot on your device:**
   - **Physical Device**: Press `Power + Volume Down` buttons simultaneously
   - **Emulator**: Click the camera icon in the emulator toolbar, or use the screenshot button

2. **Save the screenshots:**
   - **Edge Detection Mode**: Take a screenshot showing the app with edge detection active (green edges visible)
   - **Raw Camera Mode**: Take a screenshot showing the raw camera feed (toggle to raw mode first)
   - Save them as:
     - `edge-mode.png` - Edge detection mode
     - `raw-mode.png` - Raw camera mode

3. **Copy to this directory:**
   - Copy the screenshot files to `docs/screenshots/`
   - Recommended size: 1080x1920 (or similar phone aspect ratio)
   - Format: PNG or JPG

### For Web Viewer:

1. **Open the web viewer:**
   - Navigate to `web/` directory
   - Run `npm run build && npm run serve`
   - Open `http://localhost:8080` in your browser

2. **Take a screenshot:**
   - Press `F12` to open developer tools
   - Use browser screenshot tools, or
   - Use `Windows + Shift + S` (Windows) or `Cmd + Shift + 4` (Mac) to capture the screen

3. **Save as:**
   - `web-viewer.png` - Web viewer interface

## File Naming Convention

- Use lowercase with hyphens: `edge-mode.png`, `raw-mode.png`, `web-viewer.png`
- Keep file sizes reasonable (< 2MB recommended)
- Use PNG format for best quality, or JPG for smaller file sizes

## Tips

- **Good screenshots show:**
  - The app interface clearly
  - Edge detection working (green edges visible)
  - Frame statistics displayed
  - Toggle button visible

- **For GIFs (optional):**
  - You can create animated GIFs showing the app in action
  - Use tools like [ScreenToGif](https://www.screentogif.com/) or [LICEcap](https://www.cockos.com/licecap/)
  - Save as `edgeviewer-demo.gif` in this directory

