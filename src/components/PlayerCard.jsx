export default function PlayerCard({
  player,
  onAdd,
  disabled = false,
  selected = false,
  buttonText = "Añadir",
}) {
  const positionColors = {
    POR: "bg-yellow-100 text-yellow-800 border-yellow-200",
    DEF: "bg-blue-100 text-blue-800 border-blue-200",
    MED: "bg-green-100 text-green-800 border-green-200",
    DEL: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div
      className={`group rounded-2xl border bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
        selected ? "border-green-400 ring-2 ring-green-200" : "border-gray-200"
      }`}
    >
      <div className="overflow-hidden rounded-xl bg-gray-100">
        <img
          src={player.photo || "/players/default-player.png"}
          alt={player.name}
          className="h-36 w-full object-cover object-top transition duration-300 group-hover:scale-105 sm:h-48 lg:h-56"
        />
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-bold sm:text-lg">
            {player.name}
          </h3>

          <span className="shrink-0 rounded-lg bg-black px-2 py-1 text-xs font-bold text-white">
            #{player.number}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span
            className={`rounded-lg border px-2 py-1 text-xs font-bold ${
              positionColors[player.position]
            }`}
          >
            {player.position}
          </span>

          <span className="rounded-xl bg-black px-3 py-1 text-sm font-bold text-yellow-400">
            {player.price.toFixed(1)}M
          </span>
        </div>
      </div>

      <button
        disabled={disabled}
        onClick={onAdd}
        className={`mt-3 w-full rounded-xl border px-2 py-2 text-xs font-semibold transition sm:text-sm ${
          disabled
            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-300"
            : selected
            ? "border-green-400 bg-green-100 text-green-700"
            : "border-black bg-white text-black hover:bg-black hover:text-yellow-400"
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
}