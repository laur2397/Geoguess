// Restrained line icon set for capability cards & UI chrome.
// 1.25px stroke, 24x24, currentColor.

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const baseProps = (size = 24): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
  'aria-hidden': true,
});

export const IconMobility = ({ size, ...rest }: IconProps) => (
  <svg {...baseProps(size)} {...rest}>
    <path d="M3 12h6l2-3 2 6 2-3h6" />
    <circle cx="12" cy="12" r="9.5" />
  </svg>
);

export const IconPrecision = ({ size, ...rest }: IconProps) => (
  <svg {...baseProps(size)} {...rest}>
    <circle cx="12" cy="12" r="9.5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" />
  </svg>
);

export const IconIntegration = ({ size, ...rest }: IconProps) => (
  <svg {...baseProps(size)} {...rest}>
    <path d="M9 8H6a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h3" />
    <path d="M15 8h3a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-3" />
    <path d="M9 12h6" />
  </svg>
);

export const IconSecurity = ({ size, ...rest }: IconProps) => (
  <svg {...baseProps(size)} {...rest}>
    <path d="M12 2.5l8 3.5v6c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5v-6l8-3.5z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const IconStructure = ({ size, ...rest }: IconProps) => (
  <svg {...baseProps(size)} {...rest}>
    <rect x="3" y="3" width="18" height="18" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
  </svg>
);

export const IconControl = ({ size, ...rest }: IconProps) => (
  <svg {...baseProps(size)} {...rest}>
    <path d="M3 6h12M19 6h2M3 12h2M9 12h12M3 18h12M19 18h2" />
    <circle cx="17" cy="6" r="2" />
    <circle cx="7" cy="12" r="2" />
    <circle cx="17" cy="18" r="2" />
  </svg>
);

export const IconDeploy = ({ size, ...rest }: IconProps) => (
  <svg {...baseProps(size)} {...rest}>
    <path d="M12 3v12M7 8l5-5 5 5" />
    <path d="M3 21h18" />
  </svg>
);

export const IconSignal = ({ size, ...rest }: IconProps) => (
  <svg {...baseProps(size)} {...rest}>
    <path d="M3 18l4-4M9 18V8M15 18V4M21 18v-6" />
  </svg>
);

export const IconArrow = ({ size, ...rest }: IconProps) => (
  <svg {...baseProps(size)} {...rest}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconCorner = ({ size = 12, ...rest }: IconProps) => (
  <svg {...baseProps(size)} {...rest}>
    <path d="M2 8V2h6" />
  </svg>
);
