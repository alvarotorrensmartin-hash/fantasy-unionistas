import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { players } from "../data/players.js";
import { competitions } from "../data/competitions.js";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import PlayerCard from "../components/PlayerCard.jsx";

const BUDGET = 50;

const REQUIRED_POSITIONS = {
  POR: 1,
  DEF: 2,
  MED: 2,
  DEL: 2,
};

const competition = competitions[0];
const activeGameweek = competition.gameweeks.find(
  (g) => g.id === competition.activeGameweekId
);
const DEADLINE = new Date(activeGameweek.deadline);

function isLineupLocked() {
  return new Date() > DEADLINE;
}

function getPlayerByName(playerName) {
  return players.find((p) => p.name === playerName);
}

function calculateCost(playerNames) {
  return playerNames.reduce((total, playerName) => {
    const player = getPlayerByName(playerName);
    return total + (player?.price || 0);
  }, 0);
}

function countPositions(playerNames) {
  return playerNames.reduce(
    (counts, playerName) => {
      const player = getPlayerByName(playerName);
      if (!player) return counts;

      return {
        ...counts,
        [player.position]: counts[player.position] + 1,
      };
    },
    { POR: 0, DEF: 0, MED: 0, DEL: 0 }
  );
}

export default function MyTeam() {
  const { user, profile, loading } = useAuth();

  const [positionFilter, setPositionFilter] = useState("ALL");
  const [entry, setEntry] = useState({
    captain: "",
    players: [],
  });
  const [saving, setSaving] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(true);

  const lineupLocked = isLineupLocked();

  useEffect(() => {
    async function loadMyEntry() {
      if (!profile?.display_name) return;

      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .eq("user_name", profile.display_name)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error cargando mi alineación:", error);
      }

      if (data) {
        setEntry({
          captain: data.captain || "",
          players: data.players || [],
        });
      }

      setLoadingEntry(false);
    }

    if (profile?.display_name) {
      loadMyEntry();
    }
  }, [profile]);

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando sesión...</p>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Mi equipo</h2>
        <p className="text-sm text-gray-500">
          Cargando perfil de usuario...
        </p>
      </section>
    );
  }

  const selectedUser = profile.display_name;

  const currentCost = calculateCost(entry.players);
  const remainingBudget = BUDGET - currentCost;
  const positionCounts = countPositions(entry.players);

  const filteredPlayers = useMemo(() => {
    if (positionFilter === "ALL") return players;
    return players.filter((p) => p.position === positionFilter);
  }, [positionFilter]);

  const lineupComplete =
    entry.players.length === 7 &&
    entry.captain &&
    Object.entries(REQUIRED_POSITIONS).every(
      ([position, required]) => positionCounts[position] === required
    );

  function addPlayer(player) {
    if (lineupLocked) return alert("Las alineaciones están cerradas");
    if (entry.players.includes(player.name)) return alert("Ese jugador ya está en tu alineación");
    if (entry.players.length >= 7) return alert("Tu alineación ya tiene 7 jugadores");

    if (positionCounts[player.position] >= REQUIRED_POSITIONS[player.position]) {
      return alert(
        `Ya has cubierto el máximo de ${player.position}: ${REQUIRED_POSITIONS[player.position]}`
      );
    }

    if (currentCost + player.price > BUDGET) {
      return alert(
        `No tienes presupuesto suficiente. Te quedan ${remainingBudget.toFixed(
          1
        )}M y este jugador cuesta ${player.price.toFixed(1)}M.`
      );
    }

    setEntry((prev) => ({
      ...prev,
      players: [...prev.players, player.name],
    }));
  }

  function removePlayer(playerName) {
    if (lineupLocked) return;

    setEntry((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p !== playerName),
      captain: prev.captain === playerName ? "" : prev.captain,
    }));
  }

  function setCaptain(playerName) {
    if (lineupLocked) return;

    setEntry((prev) => ({
      ...prev,
      captain: playerName,
    }));
  }

  function clearEntry() {
    if (lineupLocked) return;

    setEntry({
      captain: "",
      players: [],
    });
  }

  async function saveToSupabase() {
    if (!lineupComplete) {
      alert("La alineación todavía no está completa");
      return;
    }

    setSaving(true);

    const entryData = {
      user_name: selectedUser,
      user_id: user.id,
      players: entry.players,
      captain: entry.captain,
    };

    const { error } = await supabase
      .from("entries")
      .upsert([entryData], { onConflict: "user_id" });

    setSaving(false);

    if (error) {
      console.error("Error guardando alineación:", error);
      alert("Error guardando alineación");
      return;
    }

    alert("Alineación guardada correctamente 🚀");
  }

  if (loadingEntry) {
    return (
      <section>
        <h2 className="text-2xl font-bold">Mi equipo</h2>
        <p className="text-sm text-gray-500">Cargando tu alineación...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mi equipo</h2>
        <p className="text-sm text-gray-500">
          Estás haciendo la alineación como <strong>{selectedUser}</strong>.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Presupuesto</p>
          <p className="mt-1 text-2xl font-bold">{BUDGET.toFixed(1)}M</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Gastado</p>
          <p className="mt-1 text-2xl font-bold">{currentCost.toFixed(1)}M</p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Restante</p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {remainingBudget.toFixed(1)}M
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-bold">Estructura</h3>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(REQUIRED_POSITIONS).map(([position, required]) => {
            const current = positionCounts[position];
            const complete = current === required;

            return (
              <div
                key={position}
                className={`rounded-xl border p-3 ${
                  complete ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
                }`}
              >
                <p className="text-xs text-gray-500">{position}</p>
                <p className={`font-bold ${complete ? "text-green-700" : "text-amber-800"}`}>
                  {current}/{required}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold">Jugadores disponibles</h3>

            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="ALL">Todos</option>
              <option value="POR">POR</option>
              <option value="DEF">DEF</option>
              <option value="MED">MED</option>
              <option value="DEL">DEL</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
            {filteredPlayers.map((player) => {
              const alreadySelected = entry.players.includes(player.name);
              const canAfford = currentCost + player.price <= BUDGET;
              const positionAvailable =
                positionCounts[player.position] < REQUIRED_POSITIONS[player.position];

              const disabled =
                lineupLocked ||
                alreadySelected ||
                entry.players.length >= 7 ||
                !canAfford ||
                !positionAvailable;

              const buttonText = alreadySelected
                ? "Añadido"
                : !positionAvailable
                ? "Límite"
                : !canAfford
                ? "Sin saldo"
                : lineupLocked
                ? "Cerrado"
                : "Añadir";

              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  selected={alreadySelected}
                  disabled={disabled}
                  buttonText={buttonText}
                  onAdd={() => addPlayer(player)}
                />
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Alineación de {selectedUser}</h3>
              <p className="text-sm text-gray-500">{entry.players.length}/7 jugadores</p>
            </div>

            <button
              disabled={lineupLocked}
              onClick={clearEntry}
              className="rounded-xl border border-red-300 px-3 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
            >
              Limpiar
            </button>
          </div>

          {entry.players.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
              Aún no has añadido jugadores.
            </p>
          ) : (
            <ul className="space-y-2">
              {entry.players.map((playerName, index) => {
                const player = getPlayerByName(playerName);

                return (
                  <li
                    key={playerName}
                    className="flex flex-col gap-3 rounded-xl border border-gray-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        {index + 1}. {playerName}
                        {entry.captain === playerName && (
                          <span className="ml-2 rounded bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-800">
                            C
                          </span>
                        )}
                      </p>

                      <p className="text-xs text-gray-500">
                        {player?.position || "-"} · {(player?.price || 0).toFixed(1)}M
                      </p>
                    </div>

                    <div className="flex w-full gap-2 sm:w-auto">
                      <button
                        disabled={lineupLocked}
                        onClick={() => setCaptain(playerName)}
                        className={`flex-1 rounded-xl border px-3 py-2 text-sm transition sm:flex-none ${
                          entry.captain === playerName
                            ? "border-yellow-400 bg-yellow-100 text-yellow-800"
                            : "border-black hover:bg-black hover:text-yellow-400"
                        } disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300`}
                      >
                        Capitán
                      </button>

                      <button
                        disabled={lineupLocked}
                        onClick={() => removePlayer(playerName)}
                        className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 sm:flex-none"
                      >
                        Quitar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {entry.players.length === 7 && !entry.captain && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Falta elegir capitán.
            </p>
          )}

          {lineupComplete && (
            <button
              disabled={saving}
              onClick={saveToSupabase}
              className="mt-4 w-full rounded-xl border border-black bg-black px-4 py-3 font-semibold text-yellow-400 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar mi alineación"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}