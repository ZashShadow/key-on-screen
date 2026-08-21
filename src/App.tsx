import { useEffect, useEffectEvent, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./App.css";

function App() {
  
  useEffect(() => {
    async function boot() {
      const appWindow = getCurrentWindow();
      await appWindow.setIgnoreCursorEvents(true);
    }
    boot();
  }, [])

  return (
    <main className="container h-full w-full bg-transparent">
    </main>
  );
}

export default App;
