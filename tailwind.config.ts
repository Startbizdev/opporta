import type { Config } from "tailwindcss";

/**
 * Palette calée sur les références publiques Notion (UI claire) :
 * - Texte : #37352F / #787774 / #9B9A97
 * - Surfaces : #FFFFFF (fenêtre), #F7F6F3 (barre latérale), #F1F1EF (gris bloc)
 * - Bordures : #E9E5E0
 * - CTA : noir #000000, hover #37352F (boutons Notion)
 * - Lien / interactif : #2EAADC (accent « Notion blue », ex. colorpalettegenerator.ai / Dembrandt)
 * - Ombres observées : 0 1px 0 rgba(55,53,47,0.09), 0 4px 12px rgba(0,0,0,0.08)
 *
 * Linear clair (marque) pour référence : Mercury White #F4F5F8, Nordic Gray #222326
 * — ici on applique surtout Notion pour le rendu « papier » chaud.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#37352F",
        shell: {
          DEFAULT: "#F7F6F3",
          elevated: "#FBFAF8",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          hover: "#F7F6F3",
          raised: "#FFFFFF",
        },
        field: {
          DEFAULT: "#F1F1EF",
          muted: "#E9E5E0",
        },
        border: {
          DEFAULT: "#E9E5E0",
          subtle: "rgba(55, 53, 47, 0.08)",
          strong: "rgba(55, 53, 47, 0.16)",
        },
        /** Boutons pleins type Notion */
        primary: {
          DEFAULT: "#000000",
          hover: "#37352F",
          muted: "rgba(55, 53, 47, 0.09)",
          foreground: "#FFFFFF",
        },
        /** Liens, focus, sélections — bleu Notion (pas d’indigo Linear) */
        accent: {
          DEFAULT: "#2EAADC",
          hover: "#2596C7",
          muted: "rgba(46, 170, 220, 0.14)",
          foreground: "#FFFFFF",
          /** Bleu « texte / icône » Notion (réf. communautaire) */
          ink: "#337EA9",
        },
        text: {
          primary: "#37352F",
          secondary: "#787774",
          tertiary: "#9B9A97",
        },
        success: {
          DEFAULT: "#448361",
          muted: "rgba(68, 131, 97, 0.14)",
        },
        warning: {
          DEFAULT: "#CB912F",
          muted: "rgba(203, 145, 47, 0.16)",
        },
        danger: {
          DEFAULT: "#E03E3E",
          muted: "rgba(224, 62, 62, 0.12)",
        },
        /**
         * Survols / squelettes — même teinte que le texte Notion (#37352F) en alpha,
         * plutôt que du noir pur (rendu « papier »).
         */
        overlay: {
          DEFAULT: "rgba(55, 53, 47, 0.06)",
          hover: "rgba(55, 53, 47, 0.08)",
          subtle: "rgba(55, 53, 47, 0.04)",
          pressed: "rgba(55, 53, 47, 0.12)",
          skeleton: "rgba(55, 53, 47, 0.07)",
          "skeleton-strong": "rgba(55, 53, 47, 0.09)",
        },
        /** Voile modales / feuilles (Notion-like, teinte encre) */
        scrim: "rgba(55, 53, 47, 0.35)",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        sm: "0 1px 0 rgba(55, 53, 47, 0.09)",
        md: "0 4px 12px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        /** Blocs & boutons Notion (~3px, ref. Dembrandt / UI) */
        notion: "3px",
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
      spacing: {
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
      keyframes: {
        "shimmer-bg": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "shimmer-bg": "shimmer-bg 1.35s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
