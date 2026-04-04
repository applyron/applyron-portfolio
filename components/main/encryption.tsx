"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { AmbientVideo } from "@/components/sub/ambient-video";

export const Encryption = () => {
  const t = useTranslations("encryption");

  return (
    /**
     * Section üst ve altında dikey mask-image ile parlama efektleri
     * komşu bölümlere doğal biçimde erir — sert kesim olmaz.
     */
    <section
      className="relative flex min-h-[70vh] w-full items-center justify-center px-4 py-20 sm:min-h-screen sm:px-6"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
      }}
    >
      {/* ── Arka plan taban rengi ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 60% at 50% 0%,   rgba(112,66,248,0.16) 0%, transparent 100%),
            radial-gradient(ellipse 90% 60% at 50% 100%, rgba(34,211,238,0.09) 0%, transparent 100%)
          `,
        }}
      />

      {/* ── Üst glow blobu: kartın üstünden yukarı doğru aurora gibi yayılır ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{
          top: "-20%",
          width: "80%",
          height: "480px",
          background:
            "radial-gradient(ellipse 80% 65% at 50% 100%, rgba(112,66,248,0.30) 0%, rgba(112,66,248,0.06) 55%, transparent 78%)",
          filter: "blur(56px)",
        }}
      />

      {/* ── Alt glow blobu: kartın altından aşağı doğru yumuşakça solar ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "-20%",
          width: "80%",
          height: "480px",
          background:
            "radial-gradient(ellipse 80% 65% at 50% 0%, rgba(34,211,238,0.18) 0%, rgba(112,66,248,0.07) 50%, transparent 78%)",
          filter: "blur(56px)",
        }}
      />

      {/* ── Merkez kart glow hüzmesi ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "78%",
          maxWidth: "48rem",
          height: "320px",
          background:
            "radial-gradient(circle at center, rgba(112,66,248,0.20), rgba(34,211,238,0.07) 44%, transparent 74%)",
          filter: "blur(80px)",
        }}
      />

      {/* ── Ana içerik kartı ── */}
      <div className="relative z-[20] mx-auto w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/[0.10] bg-[linear-gradient(180deg,rgba(10,7,28,0.62),rgba(8,12,30,0.52))] shadow-[0_30px_120px_rgba(3,0,20,0.14)] backdrop-blur-[6px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[18px] overflow-hidden rounded-[26px] sm:inset-[22px]"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(18,12,48,0.66), rgba(7,14,38,0.58)), radial-gradient(circle at center, rgba(112,66,248,0.14), rgba(34,211,238,0.08) 46%, transparent 80%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              maskImage:
                "radial-gradient(ellipse 82% 74% at 50% 50%, black 0%, rgba(0,0,0,0.92) 45%, rgba(0,0,0,0.65) 68%, transparent 92%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 82% 74% at 50% 50%, black 0%, rgba(0,0,0,0.92) 45%, rgba(0,0,0,0.65) 68%, transparent 92%)",
            }}
          >
            <AmbientVideo
              src="/videos/encryption-bg.webm"
              type="video/webm"
              sources={[
                { src: "/videos/encryption-bg.webm", type: "video/webm" },
                { src: "/videos/encryption-bg.mp4", type: "video/mp4" },
              ]}
              allowOnCoarsePointer
              className="h-full w-full scale-[0.94] object-cover opacity-[0.26] [filter:saturate(0.78)_brightness(0.82)_contrast(0.92)]"
              wrapperClassName="h-full w-full"
            />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(13,20,56,0.16),transparent_62%),linear-gradient(180deg,rgba(10,8,28,0.16),rgba(4,12,34,0.34))]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 px-6 py-8 text-center sm:gap-10 sm:px-10 sm:py-12">
          {/* Başlık */}
          <motion.h2
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-center text-2xl font-medium leading-snug sm:text-3xl md:text-[40px]"
          >
            <span className="text-gray-200">{t("headingBefore")}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">
              {" & "}
            </span>
            <span className="text-gray-200">{t("headingAfter")}</span>
          </motion.h2>

          {/* Kilit ikonu + Rozet */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-6"
          >
            {/* Kilit — hover'da kapanma animasyonu */}
            <div className="group cursor-pointer flex flex-col items-center">
              <div className="relative h-[50px] w-[50px] translate-y-[18px] transition-transform duration-300 ease-in-out group-hover:translate-y-[26px]">
                <Image src="/lock-top.png" alt="" fill sizes="50px" className="object-contain" />
              </div>
              <div className="relative z-10 h-[70px] w-[70px]">
                <Image src="/lock-main.png" alt="" fill sizes="70px" className="object-contain" />
              </div>
            </div>

            {/* Şifreleme rozeti */}
            <div className="Welcome-box border border-[#7042F88B] px-[15px] py-[4px] opacity-[0.9]">
              <p className="Welcome-text text-[12px]">{t("badge")}</p>
            </div>
          </motion.div>

          {/* Açıklama metni */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
            className="max-w-3xl text-center text-base font-medium text-gray-300 sm:text-[20px]"
          >
            <span className="cursive">{t("description")}</span>
          </motion.p>
        </div>
      </div>
    </section>
  );
};
