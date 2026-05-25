import { useMemo, useState } from "react";
import { players } from "../data/players.js";
import { competitions } from "../data/competitions.js";
import PlayerCard from "../components/PlayerCard.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { playerScores } from "../data/playerScores.js";

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

function getSavedEntries() {
  const saved = localStorage.getItem("fantasy_manual_entries");
  return saved ? JSON.parse(saved) : {};
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

function calculateEntryPoints(entry) {
  let total = 0;

  entry.players.forEach((playerName) => {
    const basePoints = playerScores[playerName] ?? 0;
    total += playerName === entry.captain ? basePoints * 2 : basePoints;
  });

  return total;
}

export default function Admin() {
  const [selectedUser, setSelectedUser] = useState("Torrens");
  const [entries, setEntries] = useState(getSavedEntries);
  const [positionFilter, setPositionFilter] = useState("ALL");

  const lineupLocked = isLineupLocked();

  const currentEntry = entries[selectedUser] || {
    captain: "",
    players: [],
  };

  const currentCost = calculateCost(currentEntry.players);
  const remainingBudget = BUDGET - currentCost;
  const positionCounts = countPositions(currentEntry.players);

  const filteredPlayers = useMemo(() => {
    if (positionFilter === "ALL") return players;
    return players.filter((p) => p.position === positionFilter);
  }, [positionFilter]);

  function saveEntries(updatedEntries) {
    setEntries(updatedEntries);
    localStorage.setItem(
      "fantasy_manual_entries",
      JSON.stringify(updatedEntries)
    );
  }

  function addPlayer(player) {
    if (lineupLocked) return alert("Las alineaciones están cerradas");

    if (currentEntry.players.includes(player.name)) {
      return alert("Ese jugador ya está en la alineación");
    }

    if (currentEntry.players.length >= 7) {
      return alert("La alineación ya tiene 7 jugadores");
    }

    if (positionCounts[player.position] >= REQUIRED_POSITIONS[player.position]) {
      return alert(
        `Ya has cubierto el máximo de ${player.position}: ${REQUIRED_POSITIONS[player.position]}`
      );
    }

    if (currentCost + player.price > BUDGET) {
      return alert(
        `No tienes presupuesto suficiente. Te quedarían ${remainingBudget.toFixed(
          1
        )}M y este jugador cuesta ${player.price.toFixed(1)}M.`
      );
    }

    saveEntries({
      ...entries,
      [selectedUser]: {
        ...currentEntry,
        players: [...currentEntry.players, player.name],
      },
    });
  }

  function removePlayer(playerName) {
    if (lineupLocked) return;

    const updatedPlayers = currentEntry.players.filter((p) => p !== playerName);

    saveEntries({
      ...entries,
      [selectedUser]: {
        ...currentEntry,
        players: updatedPlayers,
        captain: currentEntry.captain === playerName ? "" : currentEntry.captain,
      },
    });
  }

  function setCaptain(playerName) {
    if (lineupLocked) return;

    saveEntries({
      ...entries,
      [selectedUser]: {
        ...currentEntry,
        captain: playerName,
      },
    });
  }

  function clearEntry() {
    if (lineupLocked) return;

    saveEntries({
      ...entries,
      [selectedUser]: {
        captain: "",
        players: [],
      },
    });
  }

  async function saveToSupabase() {
    const entryData = {
      user_name: selectedUser,
      players: currentEntry.players,
      captain: currentEntry.captain,
    };

    const { error } = await supabase
      .from("entries")
      .upsert([entryData], { onConflict: "user_name" });

    if (error) {
      console.error("Error guardando alineación:", error);
      alert("Error guardando alineación");
      return;
    }

    alert("Alineación guardada/actualizada en Supabase 🚀");
  }

  async function saveResultToSupabase() {
    const points = calculateEntryPoints(currentEntry);

    const resultData = {
      user_id: null,
      user_name: selectedUser,
      gameweek_id: activeGameweek.id,
      points,
    };

    const { error } = await supabase
      .from("results")
      .upsert([resultData], { onConflict: "user_name,gameweek_id" });

    if (error) {
      console.error("Error guardando resultado:", error);
      alert("Error guardando resultado");
      return;
    }

    alert(`Resultado guardado: ${selectedUser} suma ${points} puntos`);
  }

  const lineupComplete =
    currentEntry.players.length === 7 &&
    currentEntry.captain &&
    Object.entries(REQUIRED_POSITIONS).every(
      ([position, required]) => positionCounts[position] === required
    );

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin</h2>

        <p className="text-sm text-gray-500">
          Monta alineaciones manuales para la demo.
        </p>

        {lineupLocked ? (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            🔒 Alineaciones cerradas
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            🟢 Alineaciones abiertas
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-semibold">Usuario</label>

        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2"
        >
          {USERS.map((user) => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-bold">Presupuesto</h3>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Límite</p>
            <p className="font-bold">{BUDGET.toFixed(1)}M</p>
          </div>

          <div className="rounded-xl border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Gastado</p>
            <p className="font-bold">{currentCost.toFixed(1)}M</p>
          </div>

          <div
            className={`rounded-xl border p-3 ${
              remainingBudget < 0
                ? "border-red-200 bg-red-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            <p className="text-xs text-gray-500">Restante</p>
            <p
              className={`font-bold ${
                remainingBudget < 0 ? "text-red-700" : "text-green-700"
              }`}
            >
              {remainingBudget.toFixed(1)}M
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-bold">Estructura de alineación</h3>

        <div className="grid gap-3 sm:grid-cols-4">
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
              const alreadySelected = currentEntry.players.includes(player.name);
              const canAfford = currentCost + player.price <= BUDGET;
              const positionAvailable =
                positionCounts[player.position] <
                REQUIRED_POSITIONS[player.position];

              const disabled =
                lineupLocked ||
                alreadySelected ||
                currentEntry.players.length >= 7 ||
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
                {currentEntry.players.length}/7 jugadores
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

          {currentEntry.players.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
              Aún no hay jugadores seleccionados.
            </p>
          ) : (
            <ul className="space-y-2">
              {currentEntry.players.map((playerName, index) => {
                const player = getPlayerByName(playerName);

                return (
                  <li
                    key={playerName}
                    className="flex flex-col gap-3 rounded-xl border border-gray-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        {index + 1}. {playerName}

                        {currentEntry.captain === playerName && (
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
                            : currentEntry.captain === playerName
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

          {currentEntry.players.length === 7 && !currentEntry.captain && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Falta elegir capitán.
            </p>
          )}

          {lineupComplete && (
            <>
              <button
                onClick={saveToSupabase}
                className="mt-4 w-full rounded-xl border border-black bg-black px-4 py-3 font-semibold text-yellow-400 transition hover:opacity-90"
              >
                Guardar alineación en Supabase
              </button>

              <button
                onClick={saveResultToSupabase}
                className="mt-3 w-full rounded-xl border border-green-700 bg-green-700 px-4 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Guardar resultado de la jornada
              </button>

              <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                Alineación completa y válida.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}