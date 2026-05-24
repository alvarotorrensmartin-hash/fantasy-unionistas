import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Players from "./pages/Players.jsx";
import Ranking from "./pages/Ranking.jsx";
import Lineup from "./pages/Lineup.jsx";
import Competition from "./pages/Competition.jsx";
import Admin from "./pages/Admin.jsx";
import MyTeam from "./pages/MyTeam.jsx";
import Auth from "./pages/Auth.jsx";

import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import { LineupProvider } from "./contexts/LineupContext.jsx";

function Nav() {
  const { profile, signOut } = useAuth();

  const base =
    "flex-1 rounded-xl border px-3 py-2 text-center text-sm transition sm:flex-none";
  const active = "bg-gray-100 border-gray-300";
  const idle = "border-gray-200 hover:bg-gray-50";

  return (
    <nav className="flex w-full flex-wrap gap-2 lg:w-auto">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `${base} ${isActive ? active : idle}`}
      >
        Inicio
      </NavLink>

      <NavLink
        to="/competicion"
        className={({ isActive }) => `${base} ${isActive ? active : idle}`}
      >
        Competición
      </NavLink>

      <NavLink
        to="/ranking"
        className={({ isActive }) => `${base} ${isActive ? active : idle}`}
      >
        Ranking
      </NavLink>

      <NavLink
        to="/mi-equipo"
        className={({ isActive }) => `${base} ${isActive ? active : idle}`}
      >
        Mi equipo
      </NavLink>

      {profile ? (
        <button
          onClick={signOut}
          className={`${base} border-red-200 text-red-700 hover:bg-red-50`}
        >
          Salir ({profile.display_name})
        </button>
      ) : (
        <NavLink
          to="/auth"
          className={({ isActive }) => `${base} ${isActive ? active : idle}`}
        >
          Login
        </NavLink>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LineupProvider>
        <BrowserRouter>
          <main className="font-sans mx-auto max-w-6xl p-3 sm:p-6">
            <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center">
                  <img
                    src="/club/unionistas.png"
                    alt="Unionistas"
                    className="h-12 w-12 object-contain"
                  />
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight">
                  Fantasy{" "}
                  <span className="underline decoration-yellow-400 decoration-4 underline-offset-4">
                    Unionistas
                  </span>
                </h1>
              </div>

              <Nav />
            </header>

            <div className="rounded-2xl border border-gray-200 p-4 bg-white shadow-sm">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/competicion" element={<Competition />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/mi-equipo" element={<MyTeam />} />
                <Route path="/auth" element={<Auth />} />

                {/* Rutas ocultas */}
                <Route path="/admin" element={<Admin />} />
                <Route path="/jugadores" element={<Players />} />
                <Route path="/alineacion" element={<Lineup />} />

                <Route path="*" element={<p>404 — Página no encontrada</p>} />
              </Routes>
            </div>
          </main>
        </BrowserRouter>
      </LineupProvider>
    </AuthProvider>
  );
}