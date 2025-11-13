# EdgeViewer Web - TypeScript Web Viewer

A minimal TypeScript-based web page that displays processed frames from the EdgeViewer Android application.

## Features

- Display processed frames (static image or base64)
- Show frame statistics (FPS, resolution, mode, timestamp)
- Modular TypeScript architecture
- Clean, modern UI

## Setup

### Prerequisites

- Node.js and npm installed

### Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build
```

## Usage

### Development

```bash
# Build and watch for changes
npm run watch

# Serve the application (in another terminal)
npm run serve
```

Then open `http://localhost:8080` in your browser.

### Production Build

```bash
npm run build
```

The compiled JavaScript will be in the `dist/` directory.

## Architecture

- `src/main.ts` - Application entry point
- `src/frameDisplay.ts` - Canvas rendering and stats display
- `src/frameLoader.ts` - Frame data loading (mock/sample data)
- `src/types.ts` - TypeScript type definitions

## Integration with Android App

In a production setup, frames would be received from the Android app via:

1. **HTTP Endpoint**: POST frames as base64-encoded images
2. **WebSocket**: Real-time frame streaming
3. **Static Files**: Saved processed frames from Android runs

The current implementation uses mock data for demonstration purposes.

