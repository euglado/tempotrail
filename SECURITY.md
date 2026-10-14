# Security / Güvenlik

Never post tokens, `.env`, interaction payloads, personal data or raw SDK errors in issues. / Token, `.env`, etkileşim verisi, kişisel veri veya ham SDK hatalarını issue içinde paylaşmayın.

Report a vulnerability through [GitHub private vulnerability reporting](https://github.com/euglado/tempotrail/security/advisories/new) if enabled. If unavailable, open an issue containing only a request for a private contact channel; wait for a response before sending exploit details. No guaranteed response time is offered. / Özel güvenlik bildirimi açıksa yukarıdaki bağlantıyı kullanın. Kapalıysa yalnızca özel iletişim kanalı isteyen, ayrıntı içermeyen bir issue açın; açık ayrıntılarını göndermeden yanıt bekleyin. Yanıt süresi garantisi yoktur.

For an exposed bot token: reset it in Developer Portal → Bot, stop the process, securely remove `.env`, rerun setup and restart. Remove leaked copies; rotating is necessary even after deleting a public post. / Açığa çıkan tokenı Developer Portal → Bot bölümünde sıfırlayın, süreci durdurun, `.env` dosyasını güvenle kaldırın, kurulumu tekrarlayıp yeniden başlatın. Yayımlanmış kopyaları kaldırmak token yenilemenin yerine geçmez.

Use one process per application and guild. Restrict the installation to intended channels, apply updates after tests, keep the host account private, and avoid world-readable logs/backups. The project stores no practice history; Discord and hosting providers have their own retention policies. RAM cleanup is not a forensic erasure guarantee. / Uygulama ve sunucu başına tek süreç çalıştırın. Kanal erişimini sınırlandırın, güncellemeleri test edin, host hesabını koruyun. Discord ve hostun kendi saklama politikaları vardır; RAM temizliği adli silme garantisi değildir.

Security checks detect known dependency advisories and selected credential patterns; they are not a complete security audit. Only the current main version is maintained. / Kontroller bilinen bağımlılık açıklarını ve seçili gizli bilgi kalıplarını arar; tam güvenlik denetimi değildir. Yalnızca güncel main sürümü desteklenir.
