import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Players from "./pages/Players.jsx";
import Ranking from "./pages/Ranking.jsx";
import Lineup from "./pages/Lineup.jsx";
import { LineupProvider, useLineup } from "./contexts/LineupContext.jsx";

function Nav() {
  const { picks, totals } = useLineup();

  const base = "px-3 py-2 rounded-xl border text-sm transition";
  const active = "bg-gray-100 border-gray-300";
  const idle = "border-gray-200 hover:bg-gray-50";

  return (
    <nav className="flex gap-2 items-center">
      <NavLink to="/" end className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
        Inicio
      </NavLink>
      <NavLink to="/jugadores" className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
        Jugadores
      </NavLink>
      <NavLink to="/alineacion" className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
        Alineación ({picks.length}/7 · {totals.cost.toFixed(1)}M)
      </NavLink>
      <NavLink to="/ranking" className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
        Ranking
      </NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <LineupProvider>
      <BrowserRouter>
        <main className="font-sans max-w-5xl mx-auto p-6">
          {/* CABECERA MARCA UNIONISTAS */}
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* “Escudo” simple */}
              <div className="h-10 w-10 rounded-full bg-union-black grid place-items-center">
                <span className="text-union-white text-xl">⚽</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Fantasy{" "}
                <span className="underline decoration-union-accent decoration-4 underline-offset-4">
                  Unionistas
                </span>
              </h1>
            </div>
            <Nav />
          </header>

          {/* CONTENEDOR DE PÁGINAS */}
          <div className="rounded-2xl border border-union-gray p-4 bg-white shadow-sm">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jugadores" element={<Players />} />
              <Route path="/alineacion" element={<Lineup />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="*" element={<p>404 — Página no encontrada</p>} />
            </Routes>
          </div>
        </main>
      </BrowserRouter>
    </LineupProvider>
  );
}


