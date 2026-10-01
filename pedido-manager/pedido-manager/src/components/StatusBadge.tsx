export function StatusBadge({ status }: { status?: string | null }) {
  const displayStatus = status || "Pendente";
  const s = displayStatus.toLowerCase();

  const style =
    s.includes("final") || s.includes("concl")
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : s.includes("cancel")
        ? "bg-red-50 text-red-700 ring-red-200"
        : "bg-amber-50 text-amber-700 ring-amber-200";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${style}`}
    >
      {displayStatus}
    </span>
  );
}