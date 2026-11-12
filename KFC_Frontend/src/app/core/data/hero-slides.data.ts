import { TranslationKey } from '../i18n/translations';

/**
 * Hero carousel slides.
 *
 * These are full-bleed photographs, so they are pulled at 1920px for desktop with a 960px variant
 * in the srcset - a phone should not download a two-megapixel banner. All four are the same freely
 * licensed Commons photographs credited on the About page.
 *
 * Copy lives in the translation dictionary so the slider switches language with the rest of the
 * site. Nothing here claims delivery, freshness guarantees or anything else unconfirmed.
 */

export interface HeroSlide {
  readonly id: string;
  /** Wide source for desktop. */
  readonly image: string;
  /** Narrower source for phones. */
  readonly imageSmall: string;
  readonly titleKey: TranslationKey;
  readonly subKey: TranslationKey;
  readonly ctaKey: TranslationKey;
  /** Internal destination. Mutually exclusive with `whatsapp`. */
  readonly route?: string;
  /** True when the call to action should open WhatsApp instead of a route. */
  readonly whatsapp?: boolean;
  /** Which side of the image the text sits over, so the scrim darkens the right half. */
  readonly align: 'start' | 'center';
}

const C = 'https://upload.wikimedia.org/wikipedia/commons/thumb';

const at = (path: string, file: string, width: number) => `${C}/${path}/${width}px-${file}`;

export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: 'mango',
    image: at('7/74/Mangos_-_single_and_halved.jpg', 'Mangos_-_single_and_halved.jpg', 1920),
    imageSmall: at('7/74/Mangos_-_single_and_halved.jpg', 'Mangos_-_single_and_halved.jpg', 960),
    titleKey: 'hero.s1Title',
    subKey: 'hero.s1Sub',
    ctaKey: 'hero.s1Cta',
    route: '/fruits',
    align: 'start',
  },
  {
    id: 'guava',
    image: at('8/88/Guava_pink_fruit.jpg', 'Guava_pink_fruit.jpg', 1920),
    imageSmall: at('8/88/Guava_pink_fruit.jpg', 'Guava_pink_fruit.jpg', 960),
    titleKey: 'hero.guavaTitle',
    subKey: 'hero.guavaSub',
    ctaKey: 'hero.guavaCta',
    route: '/fruits',
    align: 'start',
  },
  {
    id: 'vegetables',
    image: at(
      'a/a2/Vegetable-Carrot-Bundle-wStalks.jpg',
      'Vegetable-Carrot-Bundle-wStalks.jpg',
      1920,
    ),
    imageSmall: at(
      'a/a2/Vegetable-Carrot-Bundle-wStalks.jpg',
      'Vegetable-Carrot-Bundle-wStalks.jpg',
      960,
    ),
    titleKey: 'hero.s2Title',
    subKey: 'hero.s2Sub',
    ctaKey: 'hero.s2Cta',
    route: '/vegetables',
    align: 'start',
  },
  {
    id: 'citrus',
    image: at('e/e3/Oranges_-_whole-halved-segment.jpg', 'Oranges_-_whole-halved-segment.jpg', 1920),
    imageSmall: at('e/e3/Oranges_-_whole-halved-segment.jpg', 'Oranges_-_whole-halved-segment.jpg', 960),
    titleKey: 'hero.s3Title',
    subKey: 'hero.s3Sub',
    ctaKey: 'hero.s3Cta',
    route: '/fruits',
    align: 'start',
  },
  {
    id: 'order',
    image: at('9/97/Gourock_greengrocers_ext.jpg', 'Gourock_greengrocers_ext.jpg', 1920),
    imageSmall: at('9/97/Gourock_greengrocers_ext.jpg', 'Gourock_greengrocers_ext.jpg', 960),
    titleKey: 'hero.s4Title',
    subKey: 'hero.s4Sub',
    ctaKey: 'hero.s4Cta',
    whatsapp: true,
    align: 'start',
  },
];

/** How long each slide holds, in milliseconds. */
export const HERO_INTERVAL_MS = 6000;
