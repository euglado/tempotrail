# TempoTrail

Discord müzik toplulukları için özel önizlemeli tempo pratik planı. / Preview a musical tempo practice ladder privately in Discord, then choose whether to share it.

[Türkçe](#türkçe) · [English](#english) · [Sorun bildir / Report an issue](https://github.com/euglado/tempotrail/issues) · [MIT](LICENSE)

## Türkçe

### Amaç ve özellikler

TempoTrail, birlikte müzik çalışan topluluklarda bir pasajı farklı tempolarda tekrar etmek için sayısal bir plan oluşturur. `/tempotrail` komutuyla başlangıç ve hedef BPM seçilir; önce yalnızca komutu kullananın gördüğü bir önizleme açılır. **Bu kanalda paylaş** planı aynı kanala gönderir; **Önizlemeyi sil** hiçbir şey yayımlamaz. Artan ve azalan tempolar desteklenir. Türkçe/İngilizce çıktı seçilebilir; seçenek verilmezse Discord arayüz dili kullanılır (diğer diller İngilizce).

Bot gerçek bir Discord Gateway bağlantısı ve slash komutuyla çalışır. Metronom sesi üretmez, ses kanalına girmez, müzik çalmaz/indirmez, bağlantı açmaz, DRM işlemi yapmaz. Telifli içerik veya harici müzik API'si kullanmaz. Mesajları okumaz, kullanıcı performansı veya pratik geçmişi tutmaz; zamanlayıcı, tıbbi öneri veya beceri değerlendirmesi değildir. GitHub Actions yalnızca kaynakları test eder; botu barındırmaz. Bu depo, herkese açık çalışan bir bot hizmeti değil, kendi botunuzu kurmanız için kaynak koddur.

### Gereksinimler

- Windows, macOS veya Linux; [Node.js 24](https://nodejs.org/en/download) ve beraberindeki npm; internet erişimi.
- Discord hesabı, uygulama oluşturabilme ve hedef sunucuya uygulama ekleme yetkisi (sunucu sahibi/yetkili yönetici).
- Ayrı bir Discord uygulaması/tokenı, tek hedef sunucu ve açık kalan tek Node süreci. Tokenı veya sunucuyu bu depo sağlamaz. Ücretli VDS zorunlu değildir; host ücreti varsa operatöre aittir.

### Developer Portal ve kurulum

1. [Discord Developer Portal](https://discord.com/developers/applications) içinde **New Application** seçin, adını girin. **General Information → Application ID** değerini alın.
2. **Bot** sekmesinden bot hesabını oluşturun (arayüzde gerekliyse **Add Bot**). **Reset Token** ile token alın; şifre gibi saklayın. Tokenı GitHub'a, ekran görüntüsüne, issue'ya veya başka kişiye göndermeyin. Token açığa çıkarsa hemen sıfırlayın. Kendi kurulumunuz için **Public Bot** kapalı tutulabilir.
3. **Privileged Gateway Intents** seçeneklerinin tamamını kapalı bırakın. Bu bot yalnızca ayrıcalıksız **Guilds** intent'ini kullanır.
4. **Installation** bölümünde **Guild Install** kullanın, **User Install** kapalı olsun. Bot Gateway üzerinden çalıştığı için **Interactions Endpoint URL** boş kalmalıdır. Kurulum scope'ları `bot` ve `applications.commands`; bot izinleri yalnızca **View Channel / Kanalı Görüntüle** ve **Send Messages / Mesaj Gönder**. Administrator veya Manage Messages vermeyin.
5. Discord **User Settings → Advanced → Developer Mode** açın. Hedef sunucuya sağ tıklayıp **Copy Server ID** alın. Kanal/uygulama kimliği ile karıştırmayın.
6. Bu depoda **Code → Download ZIP** seçin ve ZIP'i yerel, hesabınıza özel bir klasöre çıkartın. macOS/Linux terminalinde klasörü açın. Node 24 kurduktan sonra açık terminali yeniden açmanız gerekebilir. Kaynak kod düzenlemeniz gerekmez.
7. Windows: `setup.cmd` çift tıklayın. macOS/Linux: `bash setup.sh` çalıştırın. Yardımcı kilitli bağımlılıkları kurar, derler ve uygulama/sunucu kimliklerini sorar; token girişi **ekranda görünmez**. Tokenı yapıştırıp Enter'a basın. Yerel `.env` oluşturulur, varsa üzerine yazılmaz. Gösterilen resmi Discord davet bağlantısını tarayıcıda açıp sunucuya ekleyin; ardından terminalde Enter'a basın. `/tempotrail` yalnızca bu sunucuya kaydedilir. Mevcut diğer komutlar topluca silinmez.
8. Windows: `start.cmd`; macOS/Linux: `bash start.sh`. Terminal açıkken ve bilgisayar uyanıkken bot bağlı kalır. Discord'da normal bir metin kanalına `/tempotrail` yazın.

macOS, indirilen dosyaya güvenlik uyarısı verirse işletim sisteminin normal güvenlik akışını izleyin; güvenlik korumalarını kapatmayın. Komut satırı kullananlar aynı klasörde `npm ci --ignore-scripts`, `npm run build`, `npm run setup`, `npm run register`, `npm start` sırasını kullanabilir. Davet bağlantısını tamamlamadan kayıt komutunu çalıştırmayın.

### Yapılandırma ve çalışır tutma

`.env` üç değeri içerir: `DISCORD_TOKEN`, `DISCORD_APPLICATION_ID`, `DISCORD_GUILD_ID`. Normal kullanıcı sihirbazı kullanır; host yöneticileri aynı isimlerle ortam değişkeni tanımlayabilir. Ortam değişkenleri dosyadan önceliklidir; boş ortam değeri de geçersiz sayılır. Token komut satırı parametresi olarak verilmez. `.env.example` yalnızca boş anahtarları gösterir. `.env`, `.env.*`, log ve derleme klasörleri Git tarafından yok sayılır; dosyayı ayrıca paylaşmayın. Unix'te dosya 0600 izinle oluşturulur; Windows'ta klasörün hesap erişimini sınırlandırın. Bulut eşitlemesi/yedekleri ayrıca koruyun.

Değiştirmek için botu Ctrl+C ile durdurun, mevcut `.env` dosyasını güvenli biçimde kaldırın ve setup'ı tekrarlayın; kaynak kodu düzenlemeyin. Yalnızca komutu tekrar kaydetmek için `register.cmd` / `bash register.sh` kullanın. Yeni sürümü indirirken `.env` dosyasını yayımlamayın; bağımlılıkları yeniden kurup derleyin ve süreci yeniden başlatın. Aynı uygulama için aynı anda iki bot süreci çalıştırmayın: cooldown'lar süreçler arasında paylaşılmaz.

7/24 kullanım için sürekli açık bir bilgisayar veya güvenilir bir host gerekir. Host üzerinde Node 24, korunan üç ortam değeri, `npm ci --ignore-scripts`, `npm run build`, `npm run register` ve başlangıç komutu `npm start` yeterlidir. İşletim sisteminizin süreç yöneticisini bot klasörünü çalışma dizini yaparak yapılandırın; tokenı başlangıç komutuna/loglara koymayın. Uyku, terminal kapatma veya süreç çökmesi botu çevrimdışı yapar. Yeniden başlatma eski önizlemeleri geçersiz kılar; kanalın mevcut paylaşımları kalır.

### Kullanım ve hesaplama

Örnek: `/tempotrail start:60 target:80 levels:5 bars:4 beats:4 language:tr` → **60, 65, 70, 75, 80 BPM**. Her basamakta 4 ölçü × 4 sayılan vuruş çalınır. Hedefe ancak hazır olduğunuzda geçin; bot ilerlemeyi izlemez.

- `start` ve `target`: 20–300 tam sayı BPM; azalan plan için başlangıcı büyük seçin.
- `levels`: 2–10, varsayılan 5; başlangıç ve hedef dahil. Tempo farkı en az `levels − 1` olmalıdır; eşit tempolar ve yinelenen basamaklar reddedilir.
- `bars`: **her basamaktaki** 1–32 ölçü, varsayılan 4. `beats`: ölçü başına **sizin saydığınız** 1–12 vuruş, varsayılan 4. Bu değer ölçü imzasının paydası değildir: 6/8'i iki ana vuruş olarak sayıyorsanız `beats:2` ve BPM'i aynı vuruşa göre seçin.
- Basamaklar başlangıç–hedef arasında eşit aralıklı konumların en yakın tam sayıya yuvarlanmasıyla bulunur; tam yarımlar yukarı yuvarlanır. Her basamak ayrı hesaplanır; yuvarlama nedeniyle BPM farkları bir değişebilir.
- Süre `Σ(ölçü × sayılan vuruş × 60 / BPM)` saniyedir; toplam bir üst tam saniyeye yuvarlanıp dk:sn gösterilir. Mola, sayma girişi ve tempo değiştirme süresi dahil değildir. Kendi metronomunuzu kullanın.

Önizleme 5 dakika geçerlidir. Paylaş/Sil düğmeleri yalnızca önizlemenin sahibi ve aynı sunucu/kanal/mesaj için çalışır; tek kullanımlıktır. Kanal değiştirilmez ve DM gönderilmez. Paylaşım sayısal planın tamamını yayımlar; gizli kalmasını istiyorsanız paylaşmayın. Başka üyeler paylaşılan mesajı görebilir/kopyalayabilir. Duyuru kanalına normal mesaj gider; otomatik çapraz yayın yoktur.

### İzinler, güvenlik ve gizlilik

Bot yalnızca **View Channel + Send Messages** (3072) ister. Kullanıcının da paylaşım anında bu kanal izinlerine sahip olması gerekir; normal komut kullanımı Discord'un **Use Application Commands** ayarına bağlıdır. Embed Links, Read Message History, Message Content, Guild Members, Presence, ses, rol veya moderasyon izni istemez. Sunucu **Integrations → TempoTrail** ayarları ve kanal izinleriyle kullanım alanını daraltın. Bot moderasyon, ticket veya rol işlemi yapmaz.

Bellekte en fazla 100 önizleme, kullanıcı/sunucu/kanal/önizleme mesajı kimlikleri, sayısal plan, dil ve son kullanma zamanları tutulur. Kullanıcı başına 5 saniye önizleme, kanal başına 60 saniye paylaşım beklemesi vardır; iki cooldown haritasının her biri en fazla 500 kayıt tutar. Tam kapasitede yeni istek reddedilir. Önizlemeler 5 dakikada sona erer; 30 saniyede bir ve yeni işlemlerde temizlik yapılır. Kullanılan önizleme hemen tüketilir; hata olsa bile otomatik tekrar gönderilmez. Başarısız izin kontrolü/paylaşım denemesi de kanal beklemesini kullanabilir.

Veritabanı, dosyada geçmiş, üçüncü taraf analiz, reklam veya kullanıcı profilleme yoktur. SDK mesaj/kullanıcı/üye önbellekleri kapalıdır; sunucu/kanal/rol verisi izin değerlendirmesi için SDK belleğinde bulunabilir. Discord komutları ve yanıtları işler, bot operatörü çalıştırdığı süreci kontrol eder. Özel (ephemeral) mesajlar bot RAM süresinden uzun görünebilir; public paylaşımlar bot tarafından zamanla silinmez. RAM temizliği Discord mesaj silme veya adli veri imhası değildir. Paylaşılmış mesajı kaldırmak için sunucu yöneticisinden yardım alın. `[SECURITY.md](SECURITY.md)` güvenlik bildirim yolunu açıklar; kötüye kullanım/diğer sorunlar [Issues](https://github.com/euglado/tempotrail/issues) veya sunucu yöneticisine bildirilmelidir. Operatör kendi üyelerine ulaşılabilir destek yolu sağlamalıdır. Gizli bilgileri issue'ya koymayın.

### Sorun giderme

- **Node bulunamadı/sürüm hatası:** Node.js 24 kurun, terminali yeniden açın; `node --version` 24.x olmalı.
- **Setup durdu:** Etkileşimli terminal kullanın; kimlikler 17–20 rakam olmalı. Mevcut `.env` üzerine yazılmaz. Güvenle kaldırıp tekrar kurun. Gizli token girişinde yıldız da görünmemesi normaldir.
- **Komut yok:** Bot doğru sunucuda mı, Application ID tokenın uygulamasıyla eşleşiyor mu, komut kaydı başarılı mı kontrol edin. `register.cmd` / `bash register.sh` çalıştırın; Discord'u yeniden açın ve Use Application Commands/Integrations izinlerine bakın.
- **Bot çevrimdışı:** start terminali açık, host uyanık ve ağ erişimi var mı kontrol edin. Tokenı yanlışlıkla sıfırladıysanız yeniden kurun. Ham hata veya token paylaşmayın.
- **Paylaşım izni yok:** Hem kullanıcı hem bot için kanalın View Channel/Send Messages izinlerini düzeltin. Thread, forum, DM ve ses kanalı desteklenmez.
- **Önizleme süresi/kullanılmış uyarısı:** `/tempotrail` komutunu yeniden kullanın; süreç yeniden başladıysa eski düğmeler çalışmaz.
- **Bekle uyarısı:** Kullanıcı için 5 saniye, kanal paylaşımı için 60 saniye bekleyin. Kapasite doluysa önizlemelerin bitmesini bekleyin; süreçleri çoğaltmayın.
- **İşlem doğrulanamadı:** Ağ hatasından sonra önce kanalı kontrol edin. Gönderim başarılı olmuş fakat onayı kaybolmuş olabilir; otomatik yeniden gönderim yapılmaz.
- **Basamak farkı hatası:** Daha az basamak veya daha geniş tempo farkı seçin. 60 → 62 için en çok 3 basamak kullanılır. Çok tempolu plan zorunlu değilse kendi metronomunuzu sabit BPM'de kullanın.
- **Süre beklenenden farklı:** `beats` sayılan vuruştur; molalar dahil değildir ve bütün seviyeleri bir kez çaldığınız varsayılır.

### Testler, katkı ve lisans

Geliştirme için temiz kaynak klasöründe (gerçek `.env` bulunmadan):

```sh
npm ci --ignore-scripts
npm run check
npm audit --audit-level=low
node --check scripts/setup.mjs
node --check scripts/launch.mjs
node --check scripts/check-supply.mjs
bash -n setup.sh start.sh register.sh
```

`check`: Biome önerilen preset lint/format, strict TypeScript (bağımlılık tipleri dahil), Node testleri, bağımlılık lisans/kayıt kaynağı/SHA-512/kurulum scripti denetimi ve seçili gizli bilgi kalıp taraması. CI Ubuntu, Windows ve macOS üzerinde aynı kontrolleri salt okunur GitHub izniyle çalıştırır. Testler Discord etkileşimlerini taklit eder; gerçek token veya canlı sunucu kullanmaz. Canlı kurulum, gizli token girişi, mobil/ekran okuyucu deneyimi ve 7/24 barındırma operatör tarafından doğrulanmalıdır. Pattern taraması ve bağımlılık audit'i tüm açıkları bulma garantisi değildir. VDS üzerinde test yapılması kurulum koşulu değildir.

[Katkı rehberi](CONTRIBUTING.md), [güvenlik rehberi](SECURITY.md), [MIT lisansı](LICENSE). Hata bildirirken işletim sistemi, Node sürümü, gizli bilgi içermeyen adımlar ve beklenen/gerçek sonucu yazın.

## English

### Purpose and features

TempoTrail helps Discord music communities plan repetitions of a passage at different tempos. Run `/tempotrail` with starting and target BPM, inspect a private preview, then click **Share in this channel** or **Discard preview**. Ascending and descending ladders are supported. Choose English or Turkish; without a language option, Turkish Discord locales use Turkish and all others use English.

This is a real Gateway-connected Discord bot with a slash command. It does not play metronome audio, join voice, play/download music, fetch links, handle DRM or use copyrighted material or external music APIs. It does not read messages or retain practice history; it is not a timer, medical advice or an ability assessment. GitHub Actions tests the source; it does not host the bot. The public repository provides self-hosting software, not an already running public bot service.

### Requirements

- Windows, macOS or Linux; [Node.js 24](https://nodejs.org/en/download) with npm and internet access.
- A Discord account, permission to create an application and permission to add it to the intended server.
- Your own application/token, one target server and one continuously running Node process. This repository supplies no credentials or hosting. A paid VPS is optional; operators cover any hosting charges.

### Developer Portal and installation

1. Open [Discord Developer Portal](https://discord.com/developers/applications), select **New Application**, name it and copy **General Information → Application ID**.
2. In **Bot**, create the bot account if necessary (**Add Bot** if shown), then **Reset Token**. Treat the token as a password. Never post it to GitHub, screenshots, issues or other people. Reset an exposed token immediately. For your own installation, **Public Bot** may stay disabled.
3. Leave every **Privileged Gateway Intent** disabled. TempoTrail only uses the unprivileged **Guilds** intent.
4. In **Installation**, enable **Guild Install** and disable **User Install**. Leave **Interactions Endpoint URL** empty: this bot receives Gateway events. Scopes are `bot` and `applications.commands`; bot permissions are only **View Channel** and **Send Messages**. Do not grant Administrator or Manage Messages.
5. In Discord **User Settings → Advanced**, enable **Developer Mode**. Right-click the target server and **Copy Server ID**. Do not substitute a channel or application ID.
6. Select **Code → Download ZIP** here, extract it to a folder private to your account, and open that folder in a terminal on macOS/Linux. Reopen terminals after installing Node 24 if necessary. No source editing is needed.
7. Windows: double-click `setup.cmd`. macOS/Linux: run `bash setup.sh`. The helper installs locked dependencies, compiles, asks for IDs and accepts a **hidden** token (no characters/stars appear). Paste it and press Enter. A local `.env` is created; an existing one is never overwritten. Open the printed official Discord invite URL, install into the selected server, then press Enter in the terminal. Registration upserts only `/tempotrail` in that server; unrelated commands are not bulk deleted.
8. Windows: `start.cmd`; macOS/Linux: `bash start.sh`. Keep the terminal open and computer awake. Use `/tempotrail` in an ordinary text channel.

Follow normal OS security prompts for downloaded files; do not disable OS protections. Terminal users can run `npm ci --ignore-scripts`, `npm run build`, `npm run setup`, `npm run register`, then `npm start` in order. Complete the invite before registration.

### Configuration and keeping the bot online

The wizard writes `DISCORD_TOKEN`, `DISCORD_APPLICATION_ID` and `DISCORD_GUILD_ID` into `.env`. Hosting operators can supply the same names through environment variables, which take precedence over disk, including invalid empty values. Never pass a token as a command-line argument. `.env.example` contains empty names only. Git ignores `.env`, `.env.*`, logs and compiled files; still never share these files. Unix creation uses mode 0600; restrict your user folder on Windows and protect backups/cloud sync separately.

To reconfigure, stop with Ctrl+C, securely remove `.env` and rerun setup; no code edits are needed. To register again without reconfiguring, use `register.cmd` or `bash register.sh`. For upgrades, keep credentials private, install dependencies again, compile and restart. Run only one process for an application: cooldown state is not shared across processes.

24/7 operation requires an awake computer or trusted host. Configure Node 24, the three protected variables, `npm ci --ignore-scripts`, `npm run build`, `npm run register`, and startup command `npm start`. Set the bot folder as the working directory in your OS process manager; do not put tokens in commands or logs. Sleep, terminal closure and crashes take the bot offline. Restarts invalidate previews; existing public plans remain in Discord.

### Usage and calculation

Example: `/tempotrail start:60 target:80 levels:5 bars:4 beats:4 language:en` produces **60, 65, 70, 75, 80 BPM**. Play 4 bars × 4 counted beats at each level. Advance when ready; the bot does not track progress.

- `start` and `target`: integer BPM 20–300; choose a higher start for descending practice.
- `levels`: 2–10, default 5, including both endpoints. BPM difference must be at least `levels − 1`. Equal endpoints and duplicate levels are rejected.
- `bars`: 1–32 bars **at each level**, default 4. `beats`: 1–12 **counted beats** per bar, default 4. It is not a time-signature denominator. For 6/8 counted as two main beats, choose `beats:2` and a BPM referring to those same beats.
- Each evenly spaced start-to-target position is rounded to the nearest integer; exact halves round up. Positions are calculated independently; adjacent differences may vary by one BPM.
- Duration is `Σ(bars × counted beats × 60 / BPM)` seconds, rounded up once to a whole second and shown as min:sec. It excludes breaks, count-ins and changing the metronome. Use your own metronome.

Preview buttons last 5 minutes, are tied to owner/server/channel/message and can be used once. Nothing is sent to another channel or DM. Sharing publishes the whole numeric plan; discard it if you prefer privacy. Other members may see and copy public messages. Announcement channels receive ordinary messages without automatic crossposting.

### Permissions, security and privacy

The bot requests only **View Channel + Send Messages** (3072). The member must also have both permissions at sharing time; command availability follows Discord **Use Application Commands** and Integrations settings. No Embed Links, Read Message History, Message Content, Guild Members, Presence, voice, role or moderation permission is needed. Restrict access through **Server Settings → Integrations → TempoTrail** and channel permissions. This bot does no moderation, ticketing or role management.

RAM holds up to 100 previews with user/server/channel/preview-message IDs, numeric plans, language and expiry. A 5-second per-user preview cooldown and 60-second per-channel share cooldown apply; each cooldown map is capped at 500 records. Capacity-full requests fail safely. Previews expire at 5 minutes and are pruned every 30 seconds and on operations. A consumed preview is removed before asynchronous work; failed attempts are not automatically resent. Permission or send failures may also spend the channel cooldown.

There is no database, file history, external analytics, advertising or profiling. SDK message/user/member caches are disabled; guild/channel/role metadata may remain in SDK memory for permission checks. Discord processes commands and messages, and the operator controls the running host. Ephemeral Discord messages may remain visible beyond RAM expiry; public plans are not automatically deleted. RAM cleanup is not Discord message deletion or forensic erasure. Ask a server manager to remove a public message. See [SECURITY.md](SECURITY.md) for vulnerabilities; report abuse or other problems through [Issues](https://github.com/euglado/tempotrail/issues) or your server manager. Operators must offer members a reachable support channel. Never include secrets in reports.

### Troubleshooting

- **Node missing/wrong version:** install Node.js 24 and reopen your terminal; `node --version` must be 24.x.
- **Setup stops:** use an interactive terminal and 17–20 digit IDs. Setup refuses existing `.env`; securely remove it before reconfiguring. Invisible token input is expected.
- **Command missing:** check the bot is in the right server, Application ID matches the token's application, and registration succeeded. Use `register.cmd` / `bash register.sh`, reopen Discord and check Use Application Commands/Integrations permissions.
- **Bot offline:** keep the start terminal open, host awake and network available. If the token was reset, reconfigure. Do not post raw SDK errors or secrets.
- **Sharing denied:** check both member and bot View Channel/Send Messages in this channel. Threads, forums, DMs and voice are unsupported.
- **Expired/used preview:** rerun `/tempotrail`. Old buttons cannot work after a process restart.
- **Wait/capacity message:** wait 5 seconds per user or 60 seconds per channel share. At capacity, let previews expire; do not launch duplicate processes.
- **Operation unconfirmed:** inspect the channel before trying again; sending may have succeeded even if acknowledgement failed. There is no automatic resend.
- **BPM gap rejected:** choose fewer levels or a wider gap. 60 → 62 allows at most 3 levels. Use your own metronome for constant-BPM practice.
- **Unexpected duration:** `beats` means counted beats, breaks are excluded, and each level is played once.

### Tests, contribution and license

In a clean checkout without a real `.env`:

```sh
npm ci --ignore-scripts
npm run check
npm audit --audit-level=low
node --check scripts/setup.mjs
node --check scripts/launch.mjs
node --check scripts/check-supply.mjs
bash -n setup.sh start.sh register.sh
```

`check` runs recommended-preset Biome lint/format, strict TypeScript including dependency types, Node behavioral tests, dependency license/registry/SHA-512/no-install-script validation and selected credential-pattern scanning. Read-only GitHub CI runs on Ubuntu, Windows and macOS. Discord interactions are mocked; tests use no live token/server. Operators must verify live installation, interactive hidden-token entry, mobile/screen-reader behavior and continuous hosting. Pattern scans and advisory audits are not a guarantee against all vulnerabilities. A VPS test is not a prerequisite.

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md) and the [MIT license](LICENSE). Include OS, Node version, reproducible steps without secrets and expected/actual behavior in bug reports.

### Official references / Resmi kaynaklar

- [Discord application commands](https://docs.discord.com/developers/interactions/application-commands)
- [Interaction acknowledgement and token lifetimes](https://docs.discord.com/developers/interactions/receiving-and-responding)
- [Gateway intents](https://docs.discord.com/developers/events/gateway)
- [Discord permissions](https://docs.discord.com/developers/topics/permissions)
- [Discord Developer Policy](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy)
