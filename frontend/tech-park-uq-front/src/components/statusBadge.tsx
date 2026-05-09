interface Props {
  status: string
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
      {status}
    </span>
  )
}

