# Applyron Web Design

[English](./README.md) | Türkçe

Applyron Web Design, veritabanı kurmadan marka vitrini yönetmek için tasarlanmış; `Next.js 16` tabanlı, çok dilli bir portföy sitesi ve dosya tabanlı bir admin CMS uygulamasıdır.

## Genel Bakış

Bu repo şunları içerir:

- `/en` ve `/tr` gibi locale tabanlı public sayfalar
- `/admin-applyron` altında korumalı yönetim paneli
- Site, hero, projeler, bağlantılar ve sosyal medya verileri için dosya tabanlı içerik saklama
- VPS ortamı için production odaklı deploy ve runtime hardening yaklaşımı

## Referans Proje

Bu proje, [sanidhyy/space-portfolio](https://github.com/sanidhyy/space-portfolio) referansı üzerine geliştirilmiştir ve orijinal görsel temeli daha operasyonel bir ürüne dönüştürür.

Upstream proje, hardcoded içerik kullanan tek dilli bir portföy şablonudur. Bu repo ise aynı görsel yönü başlangıç noktası olarak alıp; çok dilli routing, düzenlenebilir içerik, admin CMS, deploy otomasyonu ve production hardening ile kapsamı genişletir.

## Neler Geliştirildi

Referans projeye kıyasla bu repo şunları ekler:

- `next-intl` ile `en` / `tr` locale mimarisi
- `data/*.json` ve `lib/data.ts` ile dosya tabanlı CMS
- `/admin-applyron` altında admin setup, login ve dashboard akışı
- Site ayarları, hero, projeler, dış bağlantılar, sosyal medya ve upload için CRUD API'leri
- Proje detay sayfaları ve admin değişikliklerinden sonra public revalidation
- Auth, rate limit, upload doğrulama ve kalıcı runtime storage için prod odaklı katmanlar
- Template tarzı Netlify/Vercel akışı yerine GitHub Actions -> VPS deploy modeli

## Özellikler

- Türkçe ve İngilizce içerik sunan çok dilli public site
- Navigation, hero, projeler, dış bağlantılar ve sosyal medya alanlarını düzenleyebilme
- Ana sayfada proje carousel yapısı ve ayrı proje detay sayfaları
- Setup, login ve dashboard tab'lerinden oluşan dosya tabanlı admin iş akışı
- `sharp` ile işlenen raster-only görsel yükleme
- `bcrypt` parola hashleme ve JWT cookie oturumu
- Admin auth endpoint'lerinde IP bazlı throttle
- Environment variable üzerinden kalıcı `data/` ve `uploads/` desteği
- Applyron Server için Docker tabanlı production deploy hazırlığı

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

Varsayılan yerel adresler:

- `http://localhost:3000/en`
- `http://localhost:3000/tr`
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
- `APP_DATA_DIR`: JSON içerikleri, `auth.json` ve `.jwt_secret` için kalıcı klasör
- `APP_UPLOADS_DIR`: yüklenen görseller için kalıcı klasör
- `ADMIN_SETUP_ENABLED`: ilk admin setup akışını açıp kapatmak için opsiyonel override

Davranış:

- Local development ortamında uygulama `data/` ve `public/uploads/` fallback'lerini kullanır
- Production'da `APP_DATA_DIR` ve `APP_UPLOADS_DIR` kalıcı VPS klasörlerine işaret etmelidir
- Production'da `ADMIN_SETUP_ENABLED` boş bırakılırsa setup yalnızca ilk admin oluşturulana kadar açık kalır

Örnek değerler [`.env.example`](./.env.example) içinde yer alır.

## Admin Panel

Admin paneli `/admin-applyron` altında bulunur.

Başlıca yetenekler:

- Henüz admin parolası yoksa ilk kurulum ekranı
- Parola ile giriş
- Site ayarları, projeler, dış bağlantılar, sosyal medya ve hero/hakkında alanları için düzenleme sekmeleri
- Logo, hero ve proje görselleri için upload desteği
- İçerik değişimlerinden sonra public path'lerin otomatik revalidation'ı

Admin auth detayları:

- Parolalar `bcrypt` ile hashlenir
- Oturumlar JWT cookie ile tutulur
- Login ve setup endpoint'leri rate-limit altındadır
- Upload tarafı desteklenen raster formatlarla sınırlandırılmıştır

## Deployment

Production deploy akışı `GitHub Actions -> Applyron Server` modeli için hazırlanmıştır.

Production tarafı artık şunları varsayar:

- `Next.js` standalone output ile Docker image build
- uygulama servisi için `docker-compose.prod.yml`
- runtime `data` ve `uploads` için kalıcı bind mount
- `/api/health` üzerinden health check
- SSH ile `/srv/platform/bin/deploy-app applyron-portfolio` komutunu tetikleyen deploy akışı

Deploy ayrıntıları, gerekli secret'lar ve `.env.production` yapısı [`docs/deploy-vps.md`](./docs/deploy-vps.md) içinde bulunur.

## Proje Yapısı

- `app/[locale]`: locale-aware public route ve layout yapısı
- `app/admin-applyron`: admin arayüzü
- `app/api/admin`: içerik, auth ve upload API'leri
- `app/uploads/[filename]`: kontrollü upload servis route'u
- `components/main`: public sayfa bölümleri
- `components/sub`: ortak UI parçaları ve destek bileşenleri
- `data`: local/dev kurulumda kullanılan dosya tabanlı içerik ve runtime auth depolaması
- `i18n`: locale routing ve request yapılandırması
- `messages`: public site çeviri dosyaları
- `lib`: veri erişimi, auth, doğrulama, rate limit, upload işleme ve runtime yardımcıları
- `docs`: operasyonel dokümantasyonlar, VPS deploy notları dahil

## Lisans ve Kaynakça

Bu repo [MIT License](./LICENSE) ile lisanslanmıştır.
LICENSE dosyası, upstream atfını korur ve bu türev repo için ek telif satırını içerir.

Orijinal görsel temel için referans proje: [sanidhyy/space-portfolio](https://github.com/sanidhyy/space-portfolio). Bu repo, o tabanı çok dilli içerik yönetimi, admin araçları ve production deploy davranışıyla ciddi şekilde genişletir.
