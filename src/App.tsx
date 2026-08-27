import { Joystick } from "./components/Joystick";
import { FiveKeyCluster } from "./components/FiveKeyCluster";
import "./App.css";

function App() {
  return (
    <main className="container h-screen w-screen bg-transparent p-6 select-none relative overflow-hidden">
      {/* Left HUD Panel: 8-Directional Joystick */}
      <div className="absolute bottom-10 left-28 bg-slate-900/85 backdrop-blur-md p-5 rounded-2xl border border-slate-700/60 shadow-2xl">
        <Joystick size={170} knobSize={60} />
      </div>

      {/* Right HUD Panel: 5 Input Keys Cluster (MOBA Style) */}
      <div className="absolute bottom-10 right-28 bg-slate-900/85 backdrop-blur-md p-5 rounded-2xl border border-slate-700/60 shadow-2xl">
        <FiveKeyCluster />
      </div>
    </main>
  );
}

export default App;
