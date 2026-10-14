import { SlashCommandBuilder } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName("tempotrail")
  .setDescription(
    "Privately preview a tempo practice ladder, then choose whether to share.",
  )
  .setDescriptionLocalization(
    "tr",
    "Tempo pratik planını özel olarak inceleyin, ardından paylaşmayı seçin.",
  )
  .addIntegerOption((o) =>
    o
      .setName("start")
      .setDescription("Starting BPM / Başlangıç BPM")
      .setRequired(true)
      .setMinValue(20)
      .setMaxValue(300),
  )
  .addIntegerOption((o) =>
    o
      .setName("target")
      .setDescription("Target BPM / Hedef BPM")
      .setRequired(true)
      .setMinValue(20)
      .setMaxValue(300),
  )
  .addIntegerOption((o) =>
    o
      .setName("levels")
      .setDescription("Number of tempo levels / Basamak sayısı (default 5)")
      .setMinValue(2)
      .setMaxValue(10),
  )
  .addIntegerOption((o) =>
    o
      .setName("bars")
      .setDescription(
        "Bars at EACH level / HER basamaktaki ölçü sayısı (default 4)",
      )
      .setMinValue(1)
      .setMaxValue(32),
  )
  .addIntegerOption((o) =>
    o
      .setName("beats")
      .setDescription(
        "Counted beats per bar / Ölçü başına sayılan vuruş (default 4)",
      )
      .setMinValue(1)
      .setMaxValue(12),
  )
  .addStringOption((o) =>
    o
      .setName("language")
      .setDescription("Output language / Çıktı dili")
      .addChoices(
        { name: "English", value: "en" },
        { name: "Türkçe", value: "tr" },
      ),
  );
