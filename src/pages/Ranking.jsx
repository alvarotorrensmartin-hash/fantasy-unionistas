import { useEffect, useState } from "react";
import { playerScores } from "../data/playerScores.js";
import { supabase } from "../lib/supabaseClient.js";

function calculateEntryPoints(entry) {
  let total = 0;

  entry.players.forEach((playerName) => {
    if (playerName === "Pendiente") return;

    const basePoints = playerScores[playerName] ?? 0;

    if (playerName === entry.captain) {
      total += basePoints * 2;
    } else {
      total += basePoints;
    }
  });

  return total;
}

export default function Ranking() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEntries() {
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando entries:", error);
        setLoading(false);
        return;
      }

      setEntries(data || []);
      setLoading(false);
    }

    loadEntries();
  }, []);

  const ranking = entries
    .map((entry) => ({
      id: entry.id,
      name: entry.user_name,
      points: calculateEntryPoints(entry),
      captain: entry.captain,
      players: entry.players || [],
    }))
    .sort((a, b) => b.points - a.points);

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Ranking</h2>
        <p className="text-sm text-gray-500">Cargando ranking...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Ranking</h2>

        <p className="text-sm text-gray-500">
          Clasificación calculada automáticamente desde Supabase.
        </p>
      </div>

      {ranking.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Todavía no hay alineaciones guardadas en Supabase.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Pos.</th>
                  <th className="px-3 py-2 text-left">Jugador</th>
                  <th className="px-3 py-2 text-left">Capitán</th>
                  <th className="px-3 py-2 text-left">Puntos</th>
                </tr>
              </thead>

              <tbody>
                {ranking.map((user, index) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-3 py-2 font-semibold">
                      {index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : index + 1}
                    </td>

                    <td className="px-3 py-2">{user.name}</td>

                    <td className="px-3 py-2">{user.captain}</td>

                    <td className="px-3 py-2 font-bold">{user.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">
              Alineaciones registradas
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {ranking.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-lg font-bold">{entry.name}</h4>

                    <span className="rounded-xl bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                      Capitán: {entry.captain}
                    </span>
                  </div>

                  <ul className="space-y-1 text-sm">
                    {entry.players.map((player, index) => {
                      const basePoints = playerScores[player] ?? 0;
                      const isCaptain = player === entry.captain;
                      const finalPoints = isCaptain
                        ? basePoints * 2
                        : basePoints;

                      return (
                        <li
                          key={index}
                          className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2"
                        >
                          <span>
                            {index + 1}. {player}
                            {isCaptain && (
                              <span className="ml-2 rounded bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                                C
                              </span>
                            )}
                          </span>

                          <span className="font-bold">{finalPoints} pts</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}