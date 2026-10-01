import { ClipboardList } from "lucide-react";
export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${dark ? "bg-white text-slate-900" : "bg-slate-900 text-white"}`}>
        <ClipboardList size={19} />
      </div>
      <span className={`text-base font-bold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>Pedido<span className="text-slate-400">Manager</span></span>
    </div>
  );
}