import { useMemo, useState } from "react";
import { players } from "../data/players.js";
import { competitions } from "../data/competitions.js";
import { supabase } from "../lib/supabaseClient.js";
import PlayerCard from "../components/PlayerCard.jsx";

const USERS = ["Torrens", "Antonio", "Ampuero", "Lucía"];

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
  const [selectedUser, setSelectedUser] = useState("Torrens");
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [entry, setEntry] = useState({
    captain: "",
    players: [],
  });
  const [saving, setSaving] = useState(false);

  const lineupLocked = isLineupLocked();

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
    if (lineupLocked) {
      alert("Las alineaciones están cerradas");
      return;
    }

    if (entry.players.includes(player.name)) {
      alert("Ese jugador ya está en tu alineación");
      return;
    }

    if (entry.players.length >= 7) {
      alert("Tu alineación ya tiene 7 jugadores");
      return;
    }

    if (positionCounts[player.position] >= REQUIRED_POSITIONS[player.position]) {
      alert(
        `Ya has cubierto el máximo de ${player.position}: ${REQUIRED_POSITIONS[player.position]}`
      );
      return;
    }

    if (currentCost + player.price > BUDGET) {
      alert(
        `No tienes presupuesto suficiente. Te quedan ${remainingBudget.toFixed(
          1
        )}M y este jugador cuesta ${player.price.toFixed(1)}M.`
      );
      return;
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
      players: entry.players,
      captain: entry.captain,
    };

    const { error } = await supabase
      .from("entries")
      .upsert([entryData], { onConflict: "user_name" });

    setSaving(false);

    if (error) {
      console.error("Error guardando alineación:", error);
      alert("Error guardando alineación");
      return;
    }

    alert("Alineación guardada correctamente 🚀");
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mi equipo</h2>
        <p className="text-sm text-gray-500">
          Elige tu alineación para la jornada actual.
        </p>

        {lineupLocked ? (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            🔒 Alineaciones cerradas
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            🟢 Alineaciones abiertas hasta{" "}
            {DEADLINE.toLocaleString("es-ES")}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-semibold">
          Selecciona tu usuario
        </label>

        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          disabled={lineupLocked}
          className="w-full rounded-xl border border-gray-200 px-3 py-2"
        >
          {USERS.map((user) => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </select>
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

        <div
          className={`rounded-2xl border p-4 shadow-sm ${
            remainingBudget < 0
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50"
          }`}
        >
          <p className="text-sm text-gray-500">Restante</p>
          <p
            className={`mt-1 text-2xl font-bold ${
              remainingBudget < 0 ? "text-red-700" : "text-green-700"
            }`}
          >
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
                  complete
                    ? "border-green-200 bg-green-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <p className="text-xs text-gray-500">{position}</p>
                <p
                  className={`font-bold ${
                    complete ? "text-green-700" : "text-amber-800"
                  }`}
                >
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
                positionCounts[player.position] <
                REQUIRED_POSITIONS[player.position];

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
              <h3 className="text-lg font-bold">
                Alineación de {selectedUser}
              </h3>
              <p className="text-sm text-gray-500">
                {entry.players.length}/7 jugadores
              </p>
            </div>

            <button
              disabled={lineupLocked}
              onClick={clearEntry}
              className={`rounded-xl border px-3 py-2 text-sm transition ${
                lineupLocked
                  ? "cursor-not-allowed border-gray-200 text-gray-300"
                  : "border-red-300 text-red-700 hover:bg-red-50"
              }`}
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
                        {player?.position || "-"} ·{" "}
                        {(player?.price || 0).toFixed(1)}M
                      </p>
                    </div>

                    <div className="flex w-full gap-2 sm:w-auto">
                      <button
                        disabled={lineupLocked}
                        onClick={() => setCaptain(playerName)}
                        className={`flex-1 rounded-xl border px-3 py-2 text-sm transition sm:flex-none ${
                          lineupLocked
                            ? "cursor-not-allowed border-gray-200 text-gray-300"
                            : entry.captain === playerName
                            ? "border-yellow-400 bg-yellow-100 text-yellow-800"
                            : "border-black hover:bg-black hover:text-yellow-400"
                        }`}
                      >
                        Capitán
                      </button>

                      <button
                        disabled={lineupLocked}
                        onClick={() => removePlayer(playerName)}
                        className={`flex-1 rounded-xl border px-3 py-2 text-sm transition sm:flex-none ${
                          lineupLocked
                            ? "cursor-not-allowed border-gray-200 text-gray-300"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
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

          {lineupComplete && (
            <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
              Alineación completa y válida.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}