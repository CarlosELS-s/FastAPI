export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/favicon.png"
        alt="Logo Pedido Manager"
        className="h-10 w-10 rounded-xl object-contain"
      />

      <span
        className={`text-base font-bold tracking-tight ${
          dark ? "text-white" : "text-slate-900"
        }`}
      >
        Pedido
        <span className="text-slate-400">Manager</span>
      </span>
    </div>
  );
}