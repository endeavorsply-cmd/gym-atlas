type Datum = { label: string; value: number };

// Grafik batang sederhana berbasis CSS (tanpa library eksternal).
export default function BarChart({
  data,
  tint = "from-brand-500 to-brand-700",
  format,
}: {
  data: Datum[];
  tint?: string;
  format?: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-3" style={ { height: 180 } }>
      {data.map((d) => {
        const h =
          d.value > 0 ? Math.max(8, Math.round((d.value / max) * 150)) : 3;
        return (
          <div
            key={d.label}
            className="flex flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="text-xs font-semibold text-zinc-300">
              {format ? format(d.value) : d.value}
            </span>
            <div
              className={`w-full rounded-t-md bg-gradient-to-t ${tint}`}
              style={ { height: h } }
            />
            <span className="text-xs text-zinc-500">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
