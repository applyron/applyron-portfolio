# Applyron Web Design

[English](./README.md) | Türkçe

Applyron Web Design, veritabanı kurmadan marka vitrini yönetmek için tasarlanmış; `Next.js 16` tabanlı, çok dilli bir portföy sitesi ve dosya tabanlı bir admin CMS uygulamasıdır.

## Genel Bakış

Bu repo şunları içerir:

- `/en` ve `/tr` gibi locale tabanlı public sayfalar
- `/[locale]/contact` altında lokalize iletişim akışı
- `manifest`, `robots`, `sitemap` ve lokalize sosyal görsel üretimi gibi SEO route'ları
- `/admin-applyron` altında korumalı yönetim paneli
- Site, hakkında/hero, projeler, yetenekler, bağlantılar, sosyal medya ve mesaj verileri için dosya tabanlı içerik saklama
- VPS ortamı için production odaklı deploy ve runtime hardening yaklaşımı
- Redis tabanlı admin abuse koruması ve daha sıkı production auth davranışı

## Referans Proje

Bu proje, [sanidhyy/space-portfolio](https://github.com/sanidhyy/space-portfolio) referansı üzerine geliştirilmiştir ve orijinal görsel temeli daha operasyonel bir ürüne dönüştürür.

Upstream proje, hardcoded içerik kullanan tek dilli bir portföy şablonudur. Bu repo ise aynı görsel yönü başlangıç noktası olarak alıp; çok dilli routing, düzenlenebilir içerik, admin CMS, deploy otomasyonu ve production hardening ile kapsamı genişletir.

## Neler Geliştirildi

Referans projeye kıyasla bu repo şunları ekler:

- `next-intl` ile `en` / `tr` locale mimarisi
- `data/*.json` ve `lib/data.ts` ile dosya tabanlı CMS
- `/admin-applyron` altında admin setup, login ve dashboard akışı
- Site ayarları, hakkında içeriği, projeler, yetenekler, dış bağlantılar, mesajlar, sosyal medya ve upload için CRUD API'leri
- Telefon odaklı iletişim sayfası ve admin gelen kutusu
- Lokalize error/not-found ekranları ve proje fallback akışları
- Proje detay sayfaları ve admin değişikliklerinden sonra public revalidation
- Auth, rate limit, upload doğrulama ve kalıcı runtime storage için prod odaklı katmanlar
- Template tarzı Netlify/Vercel akışı yerine GitHub Actions -> VPS deploy modeli

## Özellikler

- Türkçe ve İngilizce içerik sunan çok dilli public site
- Ana sayfa, iletişim sayfası, proje detayları ve markalı lokalize error/not-found ekranları
- Navigation, hakkında/hero, projeler, yetenekler, dış bağlantılar ve sosyal medya alanlarını düzenleyebilme
- Ana sayfada proje carousel yapısı ve ayrı proje detay sayfaları
- Telefon numarası alan iletişim formu ve admin tarafında dosya tabanlı gelen kutusu
- Setup, login ve dashboard tab'lerinden oluşan dosya tabanlı admin iş akışı
- `sharp` ile işlenen raster-only görsel yükleme
- `bcrypt` parola hashleme ve JWT cookie oturumu
- Admin auth endpoint'lerinde Redis tabanlı throttle
- Environment variable üzerinden kalıcı `data/` ve `uploads/` desteği
- VPS ortamı için Docker tabanlı production deploy hazırlığı
- Magic-bytes görsel doğrulaması, strict admin cookie ve non-root container runtime
- Sadeleştirilmiş footer ve public tarafta hizmetler/gizlilik/koşullar sayfalarının kaldırılması

## Teknoloji Yığını

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS`
- `next-intl`
- `framer-motion`
- `@react-three/fiber` ve `@react-three/drei`
- `bcryptjs`
- `jsonwebtoken`
- `sharp`

## Başlangıç

### Gereksinimler

- `Node.js 22+`
- `npm 10+`

### Kurulum

```bash
git clone <repository-url>
cd applyron-web-design
npm ci
```

### Geliştirme

```bash
npm run dev
```

### Yerel Temizlik

```bash
npm run clean
```

Varsayılan yerel adresler:

- `http://localhost:3000/en`
- `http://localhost:3000/tr`
- `http://localhost:3000/tr/contact`
- `http://localhost:3000/admin-applyron`

### Production Derlemesi

```bash
npm run lint
npm run build
npm run start
```

## Ortam Değişkenleri ve Runtime Storage

Uygulama, runtime verisini release dizini dışına taşıyabilecek şekilde hazırlanmıştır.

Temel environment variable'lar:

- `APP_PUBLIC_URL`: absolute metadata ve canonical üretimi için opsiyonel public base URL
- `REDIS_URL`: production'da paylaşımlı admin rate limit için zorunlu
- `ADMIN_JWT_SECRET` veya `ADMIN_JWT_SECRET_FILE`: production'da en az biri zorunlu
- `APP_DATA_DIR`: JSON içerikleri, auth durumu ve iletişim mesajları için kalıcı klasör
- `APP_UPLOADS_DIR`: yüklenen görseller için kalıcı klasör
- `ADMIN_SETUP_ENABLED`: ilk admin setup akışını açıp kapatmak için opsiyonel override

Davranış:

- Local development ortamında uygulama `data/` ve `public/uploads/` fallback'lerini kullanır
- Versionlanan kaynak içerikler `site.json`, `about.json`, `projects.json`, `links.json`, `socials.json` ve `skills.json` dosyalarıdır
- `auth.json`, `.jwt_secret`, `messages.json` ve `public/uploads/*` gibi runtime çıktıları git dışında kalmalıdır
- Production'da `APP_DATA_DIR` ve `APP_UPLOADS_DIR` kalıcı VPS klasörlerine işaret etmelidir
- Production'da `REDIS_URL` ve bir JWT secret kaynağı tanımlı değilse admin auth kapalı kalır
- Local `.jwt_secret` fallback'i sadece development içindir; production için önerilmez
- Production'da `ADMIN_SETUP_ENABLED` boş bırakılırsa setup yalnızca ilk admin oluşturulana kadar açık kalır

Örnek değerler [`.env.example`](./.env.example) içinde yer alır.

## Admin Panel

Admin paneli `/admin-applyron` altında bulunur.

Başlıca yetenekler:

- Henüz admin parolası yoksa ilk kurulum ekranı
- Parola ile giriş
- Site ayarları, projeler, yetenekler, dış bağlantılar, mesajlar, sosyal medya ve hakkında alanları için düzenleme sekmeleri
- Logo, hero ve proje görselleri için upload desteği
- İçerik değişimlerinden sonra public path'lerin otomatik revalidation'ı

Admin auth detayları:

- Parolalar `bcrypt` ile hashlenir
- Oturumlar JWT cookie ile tutulur
- Admin cookie'leri `HttpOnly`, production'da `Secure` ve `SameSite=Strict` olarak ayarlanır
- Login ve setup endpoint'leri rate-limit altındadır
- Upload tarafı desteklenen raster formatlarla sınırlandırılmış ve magic bytes ile doğrulanmıştır

## Deployment

Production deploy akışı `GitHub Actions -> VPS` modeli için hazırlanmıştır.

Production tarafı artık şunları varsayar:

- `Next.js` standalone output ile Docker image build
- uygulama servisi ve Redis sidecar için `docker-compose.prod.yml`
- runtime `data` ve `uploads` için kalıcı bind mount
- ilk runtime kurulumu için `skills.json` dahil versionlanan içerik dosyalarının seed edilmesi
- `/api/health` üzerinden health check
- GitHub Actions içinde fingerprint-pinned SSH trust

Gerçek sunucu path'leri, actor allowlist'i ve deploy host bilgileri public repo içine yazılmak yerine GitHub repository variable ve secret'ları üzerinden yapılandırılmalıdır.

Deploy ayrıntıları, gerekli secret'lar ve `.env.production` yapısı [`docs/deploy-vps.md`](./docs/deploy-vps.md) içinde bulunur.

## Proje Yapısı

- `app/[locale]`: locale-aware public route, metadata, not-found ve sosyal görsel yapısı
- `app/admin-applyron`: admin arayüzü
- `app/api/admin`: içerik, auth, mesaj ve upload API'leri
- `app/api/contact`: public iletişim gönderim API'si
- `app/manifest.ts`, `app/robots.ts`, `app/sitemap.ts`: SEO yüzeyi
- `app/uploads/[filename]`: kontrollü upload servis route'u
- `app/media/videos/[filename]`: kontrollü yerel video servis route'u
- `components/main`: public sayfa bölümleri
- `components/sub`: ortak UI parçaları ve destek bileşenleri
- `data`: versionlanan içerik JSON'ları ve local/dev runtime auth depolaması
- `i18n`: locale routing ve request yapılandırması
- `messages`: public site çeviri dosyaları
- `lib`: veri erişimi, auth, doğrulama, rate limit, upload işleme ve runtime yardımcıları
- `docs`: operasyonel dokümantasyonlar, VPS deploy notları dahil

## Lisans ve Kaynakça

Bu repo [MIT License](./LICENSE) ile lisanslanmıştır.
LICENSE dosyası, upstream atfını korur ve bu türev repo için ek telif satırını içerir.

Orijinal görsel temel için referans proje: [sanidhyy/space-portfolio](https://github.com/sanidhyy/space-portfolio). Bu repo, o tabanı çok dilli içerik yönetimi, admin araçları ve production deploy davranışıyla ciddi şekilde genişletir.
