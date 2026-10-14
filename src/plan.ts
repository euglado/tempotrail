export type Language = "en" | "tr";
export type Input = {
  start: number;
  target: number;
  levels: number;
  bars: number;
  beats: number;
};
export type Plan = Input & { tempos: number[]; seconds: number };

export class InputError extends Error {}

export function createPlan(input: Input): Plan {
  for (const [key, min, max] of [
    ["start", 20, 300],
    ["target", 20, 300],
    ["levels", 2, 10],
    ["bars", 1, 32],
    ["beats", 1, 12],
  ] as const) {
    const value = input[key];
    if (!Number.isInteger(value) || value < min || value > max) {
      throw new InputError(`${key}: ${min}–${max}`);
    }
  }
  if (Math.abs(input.target - input.start) < input.levels - 1) {
    throw new InputError("gap");
  }
  const n = input.levels - 1;
  const tempos = Array.from({ length: input.levels }, (_, i) =>
    Math.round((input.start * (n - i) + input.target * i) / n),
  );
  const seconds = Math.ceil(
    tempos.reduce((sum, bpm) => sum + (input.bars * input.beats * 60) / bpm, 0),
  );
  return { ...input, tempos, seconds };
}

export function renderPlan(plan: Plan, language: Language): string {
  const tr = language === "tr";
  const rows = plan.tempos.map((bpm, i) => `${i + 1}. ${bpm} BPM`).join("\n");
  const duration = `${Math.floor(plan.seconds / 60)}:${String(plan.seconds % 60).padStart(2, "0")}`;
  return [
    tr ? "**TempoTrail · Pratik planı**" : "**TempoTrail · Practice plan**",
    rows,
    tr
      ? `Her basamak: ${plan.bars} ölçü × ${plan.beats} sayılan vuruş/ölçü.`
      : `Each level: ${plan.bars} bars × ${plan.beats} counted beats/bar.`,
    tr
      ? `Yaklaşık çalma süresi: ${duration} (dk:sn), mola hariç.`
      : `Approximate playing time: ${duration} (min:sec), excluding breaks.`,
    tr
      ? "BPM, sizin saydığınız vuruştur; 6/8 gibi ölçülerde sayımı kendiniz seçin. Kendi metronomunuzu kullanın. Hazır olduğunuzda ilerleyin; bu bir zamanlayıcı veya başarı ölçümü değildir."
      : "BPM uses your counted beat; choose how to count meters such as 6/8. Use your own metronome. Advance when ready; this is a plan, not a timer or ability measurement.",
  ].join("\n\n");
}

export const words = {
  en: {
    share: "Share in this channel",
    discard: "Discard preview",
    preview:
      "Only you see this preview. Share publishes the complete numeric plan here. Buttons expire in 5 minutes.",
    invalid:
      "Use integer BPM 20–300, levels 2–10, bars 1–32 and beats 1–12. The BPM difference must be at least levels minus one (e.g. 60 → 80, 5 levels).",
    context:
      "Use this in the configured server's ordinary text or announcement channel.",
    unavailable:
      "This preview expired, was used, or belongs to another session. Run /tempotrail again.",
    busy: "Please wait before trying again. Previews have a 5-second user cooldown; sharing has a 60-second channel cooldown. Capacity may be temporarily full.",
    denied:
      "Sharing needs both you and the bot to have View Channel and Send Messages here. Ask a server manager to check channel permissions.",
    discarded: "Preview discarded. Nothing was shared.",
    shared: "Plan shared in this channel.",
    failed:
      "The operation could not be confirmed. Check the channel before retrying /tempotrail; automatic resending is disabled.",
  },
  tr: {
    share: "Bu kanalda paylaş",
    discard: "Önizlemeyi sil",
    preview:
      "Bu önizlemeyi yalnızca siz görürsünüz. Paylaş, sayısal planın tamamını bu kanalda yayımlar. Düğmeler 5 dakika geçerlidir.",
    invalid:
      "Tam sayı kullanın: BPM 20–300, basamak 2–10, ölçü 1–32, vuruş 1–12. BPM farkı en az basamak sayısı eksi bir olmalıdır (örn. 60 → 80, 5 basamak).",
    context:
      "Yapılandırılan sunucunun normal metin veya duyuru kanalında kullanın.",
    unavailable:
      "Önizleme süresi dolmuş, kullanılmış veya başka bir oturuma ait. /tempotrail komutunu yeniden çalıştırın.",
    busy: "Yeniden denemeden önce bekleyin. Önizleme için kullanıcı başına 5 saniye, paylaşım için kanal başına 60 saniye beklenir. Kapasite geçici olarak dolu olabilir.",
    denied:
      "Paylaşım için sizin ve botun Kanalı Görüntüle ve Mesaj Gönder izinleri olmalıdır. Sunucu yöneticisinden kanal izinlerini kontrol etmesini isteyin.",
    discarded: "Önizleme silindi. Hiçbir şey paylaşılmadı.",
    shared: "Plan bu kanalda paylaşıldı.",
    failed:
      "İşlem doğrulanamadı. /tempotrail komutunu yeniden denemeden önce kanalı kontrol edin; otomatik yeniden gönderim kapalıdır.",
  },
} as const;
