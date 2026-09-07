// Inline SVG icons — 1.5 px stroke, round caps, 24-unit grid, `aria-hidden` (decorative; the text
// beside them carries the meaning). No emoji, no icon font anywhere on the site.
import type { SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  /** Rendered size in px (square). */
  size?: number;
}

function Icon({ size = 20, className, children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);
export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);
export const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 12h16M13 5l7 7-7 7" />
  </Icon>
);
export const ArrowLeftIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 12H4M11 5l-7 7 7 7" />
  </Icon>
);
export const ChevronDownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);
export const ChevronRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
);
export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const MinusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14" />
  </Icon>
);
export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </Icon>
);
export const CrossIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 7l10 10M17 7L7 17" />
  </Icon>
);
export const CopyIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="9" y="9" width="11" height="11" rx="1.5" />
    <path d="M15 9V5.5A1.5 1.5 0 0 0 13.5 4h-8A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15H9" />
  </Icon>
);
export const ShareIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4v11M8 8l4-4 4 4M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" />
  </Icon>
);
export const LinkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1.5 1.5" />
    <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1.5-1.5" />
  </Icon>
);
export const ExternalIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
  </Icon>
);
export const MailIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
  </Icon>
);
export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </Icon>
);
export const PrintIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 9V4h10v5M7 17H4.5A1.5 1.5 0 0 1 3 15.5v-5A1.5 1.5 0 0 1 4.5 9h15A1.5 1.5 0 0 1 21 10.5v5a1.5 1.5 0 0 1-1.5 1.5H17" />
    <rect x="7" y="14" width="10" height="6" />
  </Icon>
);
export const DownloadIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4v11M8 11l4 4 4-4M5 19h14" />
  </Icon>
);
export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="16" rx="1.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Icon>
);
export const InfoIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 8v.5" />
  </Icon>
);
export const CameraIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.5-2h5L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
    <circle cx="12" cy="13" r="3.5" />
  </Icon>
);
export const QrIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="4" width="6" height="6" />
    <rect x="14" y="4" width="6" height="6" />
    <rect x="4" y="14" width="6" height="6" />
    <path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2" />
  </Icon>
);
export const RulerIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="8" width="18" height="8" rx="1" />
    <path d="M7 8v3M11 8v4M15 8v3M19 8v4" />
  </Icon>
);
/** FourFears 1 — "Will it look like my kid?": the eye, i.e. every frame is looked at (DESIGN §4.8). */
export const EyeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 12S6 5.75 12 5.75 21.5 12 21.5 12 18 18.25 12 18.25 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);
/** FourFears 2 — "Who is asking for my child's photos?": the id card, i.e. who we are. */
export const IdCardIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.5" y="5" width="19" height="14" />
    <circle cx="8.5" cy="11" r="2" />
    <path d="M5.5 16c.6-1.4 1.7-2.1 3-2.1s2.4.7 3 2.1M14.5 10h4M14.5 13.5h4" />
  </Icon>
);
/** FourFears 3 — "What if it's wrong?": the counter-clockwise arrow, i.e. it is undone and refunded. */
export const RotateCcwIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3 8.9" />
    <path d="M3 4.5v4.5h4.5" />
  </Icon>
);
/** FourFears 4 — "Is this a real card or a photo print?": the card with the registered QR on its back. */
export const CardQrIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="6" y="3" width="12" height="17" />
    <path d="M9 6.5h6" />
    <rect x="9" y="11" width="3" height="3" />
    <path d="M13.5 11H15M15 12.5V14M13.5 15.5H15M9 17h6" />
  </Icon>
);

/** Name → component map for data-driven rows (FourFears, GateRow, ShareRow). */
export const icons = {
  menu: MenuIcon,
  close: CloseIcon,
  arrowRight: ArrowRightIcon,
  arrowLeft: ArrowLeftIcon,
  chevronDown: ChevronDownIcon,
  chevronRight: ChevronRightIcon,
  plus: PlusIcon,
  minus: MinusIcon,
  check: CheckIcon,
  cross: CrossIcon,
  copy: CopyIcon,
  share: ShareIcon,
  link: LinkIcon,
  external: ExternalIcon,
  mail: MailIcon,
  search: SearchIcon,
  print: PrintIcon,
  download: DownloadIcon,
  calendar: CalendarIcon,
  info: InfoIcon,
  camera: CameraIcon,
  qr: QrIcon,
  ruler: RulerIcon,
  likeness: EyeIcon,
  privacy: IdCardIcon,
  promise: RotateCcwIcon,
  card: CardQrIcon,
} as const;

export type IconName = keyof typeof icons;
