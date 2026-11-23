import { getStatusConfig } from "@/lib/booking-status"

export default function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const cfg = getStatusConfig(status)
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${cfg.badge} ${className}`}>
      {cfg.label}
    </span>
  )
}
