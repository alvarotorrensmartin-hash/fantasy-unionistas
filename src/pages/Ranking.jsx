import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

function getPositionLabel(index) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return index + 1;
}

export default function Ranking() {
  const [results, setResults] = useState([]);
  const [selectedGameweek, setSelectedGameweek] = useState("");
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

  const gameweeks = useMemo(() => {
    return [...new Set(results.map((result) => result.gameweek_id))];
  }, [results]);

  const latestGameweek = gameweeks[gameweeks.length - 1] || "";

  const activeSelectedGameweek = selectedGameweek || latestGameweek;

  const generalRanking = useMemo(() => {
    const grouped = {};

    results.forEach((result) => {
      if (!grouped[result.user_name]) {
        grouped[result.user_name] = {
          name: result.user_name,
          totalPoints: 0,
        };
      }

      grouped[result.user_name].totalPoints += Number(result.points);
    });

    return Object.values(grouped).sort(
      (a, b) => b.totalPoints - a.totalPoints
    );
  }, [results]);

  const latestGameweekRanking = useMemo(() => {
    return results
      .filter((result) => result.gameweek_id === latestGameweek)
      .map((result) => ({
        name: result.user_name,
        points: Number(result.points),
      }))
      .sort((a, b) => b.points - a.points);
  }, [results, latestGameweek]);

  const selectedGameweekRanking = useMemo(() => {
    return results
      .filter((result) => result.gameweek_id === activeSelectedGameweek)
      .map((result) => ({
        name: result.user_name,
        points: Number(result.points),
      }))
      .sort((a, b) => b.points - a.points);
  }, [results, activeSelectedGameweek]);

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Ranking</h2>
        <p className="text-sm text-gray-500">Cargando clasificación...</p>
      </section>
    );
  }

  if (results.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Ranking</h2>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Todavía no hay resultados guardados.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Ranking</h2>
        <p className="text-sm text-gray-500">
          Clasificación general, última jornada e histórico.
        </p>
      </div>

      {/* GENERAL */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-xl font-bold">Clasificación general</h3>

        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Pos.</th>
                <th className="px-3 py-2 text-left">Jugador</th>
                <th className="px-3 py-2 text-left">Puntos totales</th>
              </tr>
            </thead>

            <tbody>
              {generalRanking.map((user, index) => (
                <tr key={user.name} className="border-t">
                  <td className="px-3 py-2 font-semibold">
                    {getPositionLabel(index)}
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
      </div>

      {/* ÚLTIMA JORNADA */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
        <h3 className="mb-1 text-xl font-bold text-blue-900">
          Última jornada
        </h3>

        <p className="mb-3 text-sm text-blue-800">
          {latestGameweek}
        </p>

        <div className="overflow-x-auto rounded-2xl border border-blue-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-3 py-2 text-left">Pos.</th>
                <th className="px-3 py-2 text-left">Jugador</th>
                <th className="px-3 py-2 text-left">Puntos jornada</th>
              </tr>
            </thead>

            <tbody>
              {latestGameweekRanking.map((user, index) => (
                <tr key={user.name} className="border-t">
                  <td className="px-3 py-2 font-semibold">
                    {getPositionLabel(index)}
                  </td>
                  <td className="px-3 py-2">{user.name}</td>
                  <td className="px-3 py-2 font-bold">
                    {user.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HISTÓRICO */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold">Histórico de jornadas</h3>
            <p className="text-sm text-gray-500">
              Consulta la clasificación de cualquier jornada.
            </p>
          </div>

          <select
            value={activeSelectedGameweek}
            onChange={(e) => setSelectedGameweek(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            {gameweeks.map((gameweek) => (
              <option key={gameweek} value={gameweek}>
                {gameweek}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Pos.</th>
                <th className="px-3 py-2 text-left">Jugador</th>
                <th className="px-3 py-2 text-left">Puntos jornada</th>
              </tr>
            </thead>

            <tbody>
              {selectedGameweekRanking.map((user, index) => (
                <tr key={user.name} className="border-t">
                  <td className="px-3 py-2 font-semibold">
                    {getPositionLabel(index)}
                  </td>
                  <td className="px-3 py-2">{user.name}</td>
                  <td className="px-3 py-2 font-bold">
                    {user.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}