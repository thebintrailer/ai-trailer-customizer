
import type { TrailerModel, ColorTheme } from './types';

export const TRAILER_MODELS = [
  {
    id: 'single-cold',
    name: 'Single Cold Model',
    imageUrl: 'https://i.imgur.com/wzKkCcR.png',
  },
  {
    id: 'double-hot',
    name: 'Double Hot Model',
    imageUrl: 'https://i.imgur.com/SaBAdqf.png',
  },
];

export const FALLBACK_IMAGE_URL =
  'https://i.imgur.com/u5a2S0X.png';


export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'fresh-aqua',
    name: 'Fresh Aqua',
    description: 'a bright blue and green palette symbolizing freshness and water',
    gradientText: 'from-cyan-400 to-emerald-400',
    gradientBorder: 'from-cyan-400 to-emerald-400',
    glow: 'shadow-cyan-400/50',
  },
  {
    id: 'eco-bright',
    name: 'Eco Bright',
    description: 'a vibrant green palette representing eco-friendly operations',
    gradientText: 'from-lime-400 to-green-500',
    gradientBorder: 'from-lime-400 to-green-500',
    glow: 'shadow-lime-400/50',
  },
  {
    id: 'american-classic',
    name: 'American Classic',
    description: 'a bold red, white, and blue palette inspired by the American flag',
    gradientText: 'from-red-500 to-blue-500',
    gradientBorder: 'from-red-500 to-blue-500',
    glow: 'shadow-red-500/50',
  },
];
