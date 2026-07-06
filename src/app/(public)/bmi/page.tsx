"use client";

import { useMemo, useState } from "react";
import { Calculator, Scale, Ruler } from "lucide-react";

type Kategori = {
  label: string;
  warna: string;
  saran: string;
};

function kategoriBmi(bmi: number): Kategori {
  if (bmi < 18.5) {
    return {
      label: "Berat badan kurang",
      warna: "text-sky-400",
      saran: "Fokus pada latihan kekuatan dan asupan kalori yang cukup.",
    };
  }
  if (bmi < 25) {
    return {
      label: "Berat badan ideal",
      warna: "text-emerald-400",
      saran: "Pertahankan dengan latihan rutin dan pola makan seimbang.",
    };
  }
  if (bmi < 30) {
    return {
      label: "Berat badan berlebih",
      warna: "text-orange-400",
      saran: "Kombinasikan latihan kardio dan atur defisit kalori ringan.",
    };
  }
  return {
    label: "Obesitas",
    warna: "text-brand-500",
    saran: "Konsultasikan program dengan trainer & rutin latihan kardio.",
  };
}

export default function BmiPage() {
  const [berat, setBerat] = useState("");
  const [tinggi, setTinggi] = useState("");

  const hasil = useMemo(() => {
    const b = parseFloat(berat);
    const t = parseFloat(tinggi) / 100;
    if (!b || !t || b <= 0 || t <= 0) return null;
    const bmi = b / (t * t);
    return { bmi, kategori: kategoriBmi(bmi) };
  }, [berat, tinggi]);

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-ink-900 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-36 md:px-10">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded border border-brand-500/30 bg-brand-600/10 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-brand-500">
          <Calculator className="h-3.5 w-3.5" /> Alat Bantu
        </span>
        <h1 className="mt-6 font-serif text-4xl font-bold text-white md:text-5xl">
          Kalkulator BMI
        </h1>
        <div className="mx-auto mt-5 h-0.5 w-16 bg-brand-500" />
        <p className="mt-5 text-zinc-400">
          Hitung Indeks Massa Tubuh (Body Mass Index) untuk mengetahui apakah
          berat badanmu sudah ideal.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-white/8 bg-ink-800 p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="berat"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                Berat badan (kg)
              </label>
              <div className="relative">
                <Scale className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  id="berat"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={berat}
                  onChange={(e) => setBerat(e.target.value)}
                  placeholder="contoh: 65"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="tinggi"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                Tinggi badan (cm)
              </label>
              <div className="relative">
                <Ruler className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  id="tinggi"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={tinggi}
                  onChange={(e) => setTinggi(e.target.value)}
                  placeholder="contoh: 170"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-white/8 bg-gradient-to-br from-brand-950/40 to-ink-800 p-6 text-center">
          {hasil ? (
            <>
              <p className="text-sm text-zinc-400">Nilai BMI kamu</p>
              <p className="mt-1 font-serif text-5xl font-bold text-white">
                {hasil.bmi.toFixed(1)}
              </p>
              <p
                className={`mt-2 text-lg font-semibold ${hasil.kategori.warna}`}
              >
                {hasil.kategori.label}
              </p>
              <p className="mt-3 text-sm text-zinc-400">
                {hasil.kategori.saran}
              </p>
            </>
          ) : (
            <p className="text-sm text-zinc-500">
              Isi berat dan tinggi badan untuk melihat hasil.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-white/8 bg-ink-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-700 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Kategori</th>
              <th className="px-5 py-3 font-semibold">Rentang BMI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-300">
            <tr>
              <td className="px-5 py-3">Berat badan kurang</td>
              <td className="px-5 py-3">&lt; 18,5</td>
            </tr>
            <tr>
              <td className="px-5 py-3">Ideal</td>
              <td className="px-5 py-3">18,5 &ndash; 24,9</td>
            </tr>
            <tr>
              <td className="px-5 py-3">Berat badan berlebih</td>
              <td className="px-5 py-3">25 &ndash; 29,9</td>
            </tr>
            <tr>
              <td className="px-5 py-3">Obesitas</td>
              <td className="px-5 py-3">&ge; 30</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
