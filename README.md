# Key On Screen 

> **⚠️ Active Development Notice:** This project is currently under active development (Alpha phase). Features, UI layouts, and key mapping implementations are subject to change.

**Key On Screen** is a lightweight, frameless, transparent on-screen Keyboard overlay built with 360 Convertible Touch Screen laptops in mind. It was made for personal use for myself to play games while my laptop is in tablet mode.

It was mainly made to play slow paced 2d Games like, Stardrew Valley, or some story based game, although i have managed to beat Mantis Lords on it ;)

---



## ⚡ Features

- 🎯 **Transparent Window Overlay:** Stays on top of other applications with a frameless, transparent glassmorphism HUD design.
- 🕹️ **8-Directional Virtual Joystick:**
  - Dynamic drag knob with touch & mouse support.
  - Quick mode toggle between **WASD** and **Arrow Keys** controls.
- ⌨️ **5-Key Action Cluster:**
  - Curved MOBA-style ergonomic button layout for quick actions.
  - Dedicated **ESC / Pause** HUD button in the top left.
- 🔄 **Live Interactive Key Rebinding:**
  - Rebind mode allows re-mapping any virtual button by simply clicking it and pressing any key on your physical keyboard.
- 💾 **Local Persistence:**
  - Automatically saves custom key mappings and joystick preferences to `localStorage`.
  - Includes a one-click **Reset to Defaults** control.

---

## 🛠️ Technology Stack

| Layer | Technology |
| --- | --- |
| **Desktop Shell** | [Tauri v2](https://tauri.app/) (Rust framework for cross-platform desktop apps) |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 7](https://vite.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphism CSS |
| **State & Storage** | React Hooks + Web LocalStorage API |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher) & `npm`
- [Rust](https://www.rust-lang.org/) toolchain (installed via `rustup`)
- Tauri v2 platform prerequisites (see [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/))

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ZashShadow/key-on-screen.git
   cd key-on-screen
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Run in development mode:**
   ```bash
   npm run tauri dev
   ```

---

## 📦 Building for Production

To compile the Tauri desktop executable and installers (`.exe` / `.msi` for Windows):

```bash
npm run tauri build
```

Built bundles will be generated in `src-tauri/target/release/bundle/`.

---

## 🗺️ Roadmap & Status

- [x] Translucent HUD & Titlebar overlay layout
- [x] Interactive Joystick (WASD & Arrow Modes)
- [x] Customizable 5-Key Action Cluster & ESC key button
- [x] Live Key Rebinding Mode
- [ ] System-wide simulated key input generation (Rust `enigo` / `rdev` backend integration)
- [ ] Profile presets (FPS, MOBA, Fighting Games)
- [ ] Customizable opacity & scale controls in TitleBar

---

## 📄 License

This project is licensed under the MIT License.
