import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function Ranking() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      const { data, error } = await supabase
        .from("results")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error cargando resultados:", error);
        setLoading(false);
        return;
      }

      setResults(data || []);
      setLoading(false);
    }

    loadResults();
  }, []);

  const groupedUsers = {};

  results.forEach((result) => {
    if (!groupedUsers[result.user_name]) {
      groupedUsers[result.user_name] = {
        name: result.user_name,
        totalPoints: 0,
        gameweeks: [],
      };
    }

    groupedUsers[result.user_name].totalPoints += result.points;

    groupedUsers[result.user_name].gameweeks.push({
      gameweek: result.gameweek_id,
      points: result.points,
    });
  });

  const ranking = Object.values(groupedUsers).sort(
    (a, b) => b.totalPoints - a.totalPoints
  );

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Ranking</h2>
        <p className="text-sm text-gray-500">
          Cargando clasificación...
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Ranking General</h2>

        <p className="text-sm text-gray-500">
          Clasificación acumulada de todas las jornadas.
        </p>
      </div>

      {ranking.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Todavía no hay resultados guardados.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Pos.</th>
                  <th className="px-3 py-2 text-left">Jugador</th>
                  <th className="px-3 py-2 text-left">Puntos Totales</th>
                </tr>
              </thead>

              <tbody>
                {ranking.map((user, index) => (
                  <tr key={user.name} className="border-t">
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

                    <td className="px-3 py-2 font-bold">
                      {user.totalPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="mb-3 text-xl font-bold">
              Historial de jornadas
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {ranking.map((user) => (
                <div
                  key={user.name}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-lg font-bold">{user.name}</h4>

                    <span className="rounded-xl bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                      {user.totalPoints} pts
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {user.gameweeks.map((gw, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2 text-sm"
                      >
                        <span>{gw.gameweek}</span>

                        <span className="font-bold">
                          {gw.points} pts
                        </span>
                      </li>
                    ))}
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