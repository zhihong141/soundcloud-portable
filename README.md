# SoundCloud Desktop App

A clean, portable SoundCloud desktop player built with Electron.
No browser chrome — just SoundCloud in its own dedicated window,
with an always-on-top mini player.

## Features
- 🎵 SoundCloud in a clean frameless window
- 🟠 Custom title bar with back/forward/reload navigation
- 🪟 Mini player — always on top, draggable, compact
- 💾 Persistent login (cookies saved between sessions)
- 📦 Builds to a single portable .exe

---

## How to Build (Windows)

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or later)
- Windows 10/11

### Steps

1. **Extract** this folder somewhere (e.g. `C:\Projects\soundcloud-app`)

2. **Open a terminal** in that folder and install dependencies:
   ```
   npm install
   ```

3. **Test it first** (runs without building):
   ```
   npm start
   ```

4. **Build the portable .exe**:
   ```
   npm run build-portable
   ```
   The output will be in the `dist/` folder as `SoundCloud-Portable.exe`.

   Or build both portable + installer:
   ```
   npm run build
   ```

---

## Optional: Add an Icon

Place a 256×256 `.ico` file at `assets/icon.ico` before building.
You can convert any PNG to ICO using https://convertico.com

If no icon file exists, electron-builder will use a default icon.

---

## Notes

- Login to SoundCloud doesn't work for now due to some issue
- The mini player function as a floating widget while the main window hides. The actual audio keeps playing in the background.
- To go back to the full player from mini mode, click the ⤢ button.
