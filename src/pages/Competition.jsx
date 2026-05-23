import { useEffect, useState } from "react";
import { competitions } from "../data/competitions.js";
import { supabase } from "../lib/supabaseClient.js";

const USERS = ["Torrens", "Antonio", "Ampuero", "Lucía"];

const REQUIRED_PLAYERS = 7;

function isEntryComplete(entry) {
  if (!entry) return false;

  return (
    entry.players?.length === REQUIRED_PLAYERS &&
    Boolean(entry.captain)
  );
}

export default function Competition() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const competition = competitions[0];

  const gameweek = competition.gameweeks.find(
    (g) => g.id === competition.activeGameweekId
  );

  useEffect(() => {
    async function loadEntries() {
      const { data, error } = await supabase
        .from("entries")
        .select("*");

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

  const entriesMap = {};

  entries.forEach((entry) => {
    entriesMap[entry.user_name] = entry;
  });

  const completedEntries = USERS.filter((user) =>
    isEntryComplete(entriesMap[user])
  );

  const pendingEntries = USERS.filter(
    (user) => !isEntryComplete(entriesMap[user])
  );

  const deadline = new Date(gameweek.deadline);
  const lineupLocked = new Date() > deadline;

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Competición</h2>

        <p className="text-sm text-gray-500">
          Cargando competición...
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Competición</h2>

        <p className="text-sm text-gray-500">
          Panel de control de la prueba actual.
        </p>
      </div>

      {/* Tarjeta principal */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">
          Competición activa
        </p>

        <h3 className="text-xl font-bold">
          {competition.name}
        </h3>

        <p className="mt-1 text-gray-700">
          {competition.description}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Jornada</p>

            <p className="font-semibold">
              {gameweek.name}
            </p>
          </div>

          <div
            className={`rounded-xl border p-3 ${
              lineupLocked
                ? "border-red-200 bg-red-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            <p className="text-xs text-gray-500">
              Estado
            </p>

            <p
              className={`font-semibold ${
                lineupLocked
                  ? "text-red-700"
                  : "text-green-700"
              }`}
            >
              {lineupLocked ? "Cerrada" : "Abierta"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-3">
            <p className="text-xs text-gray-500">
              Cierre
            </p>

            <p className="font-semibold">
              {deadline.toLocaleString("es-ES")}
            </p>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Participantes
          </p>

          <p className="mt-1 text-3xl font-bold">
            {USERS.length}
          </p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
          <p className="text-sm text-green-700">
            Alineaciones completas
          </p>

          <p className="mt-1 text-3xl font-bold text-green-700">
            {completedEntries.length}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-sm text-amber-800">
            Pendientes
          </p>

          <p className="mt-1 text-3xl font-bold text-amber-800">
            {pendingEntries.length}
          </p>
        </div>
      </div>

      {/* Estado participantes */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-bold">
          Estado de participantes
        </h3>

        <div className="grid gap-3 md:grid-cols-2">
          {USERS.map((user) => {
            const entry = entriesMap[user];
            const complete = isEntryComplete(entry);

            return (
              <div
                key={user}
                className={`rounded-xl border p-3 ${
                  complete
                    ? "border-green-200 bg-green-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{user}</p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      complete
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {complete ? "Completa" : "Pendiente"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  Jugadores: {entry?.players?.length || 0}/7
                </p>

                <p className="text-sm text-gray-600">
                  Capitán: {entry?.captain || "Pendiente"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aviso */}
      {pendingEntries.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          ⚠️ Todavía faltan alineaciones por completar:{" "}
          <strong>{pendingEntries.join(", ")}</strong>
        </div>
      ) : (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
          ✅ Todas las alineaciones están completas.
        </div>
      )}
    </section>
  );
}