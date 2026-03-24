import { cn } from "@/lib/utils";

type FlagIconProps = {
  country: "gb" | "tr";
  className?: string;
};

function GreatBritainFlag({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 40"
      className={cn("overflow-hidden rounded-[2px]", className)}
      focusable="false"
    >
      <rect width="60" height="40" fill="#1F3C88" />
      <polygon points="0,0 7,0 60,31 60,40 53,40 0,9" fill="#FFFFFF" />
      <polygon points="60,0 53,0 0,31 0,40 7,40 60,9" fill="#FFFFFF" />
      <polygon points="24,0 36,0 36,14 60,14 60,26 36,26 36,40 24,40 24,26 0,26 0,14 24,14" fill="#FFFFFF" />
      <polygon points="0,0 3,0 27,14 21,14" fill="#D81E34" />
      <polygon points="60,0 57,0 33,14 39,14" fill="#D81E34" />
      <polygon points="0,40 3,40 27,26 21,26" fill="#D81E34" />
      <polygon points="60,40 57,40 33,26 39,26" fill="#D81E34" />
      <polygon points="26,0 34,0 34,16 60,16 60,24 34,24 34,40 26,40 26,24 0,24 0,16 26,16" fill="#D81E34" />
    </svg>
  );
}

function TurkeyFlag({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 40"
      className={cn("overflow-hidden rounded-[2px]", className)}
      focusable="false"
    >
      <rect width="60" height="40" fill="#E11D48" />
      <circle cx="24" cy="20" r="10" fill="#FFFFFF" />
      <circle cx="27.5" cy="20" r="8" fill="#E11D48" />
      <polygon
        points="36.5,20 40.1,21.2 38.2,18.1 38.2,21.9 40.1,18.8"
        fill="#FFFFFF"
        transform="scale(2.1) translate(-17.5,-10)"
      />
    </svg>
  );
}

export function FlagIcon({ country, className }: FlagIconProps) {
  if (country === "tr") {
    return <TurkeyFlag className={className} />;
  }

  return <GreatBritainFlag className={className} />;
}
