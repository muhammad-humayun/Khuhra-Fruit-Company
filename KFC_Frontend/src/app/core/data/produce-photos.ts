/**
 * Real produce photography.
 *
 * Every photo is a freely-licensed image from Wikimedia Commons, chosen per product. The licences
 * (CC BY, CC BY-SA, GFDL, CC0, public domain) require attribution for the non-PD ones, which is why
 * each entry carries its photographer, licence and source page, and why the credits are rendered on
 * the About page.
 *
 * Right now the URLs point at Wikimedia's own CDN. For production, run
 *   node scripts/fetch-produce-images.mjs public/produce src/app/core/data/produce-photos.ts
 * on your machine: it downloads every image into `public/produce/` and rewrites this file to serve
 * them locally, which is faster and does not lean on Wikimedia's bandwidth.
 *
 * To use your own photograph for a product, drop it in `public/produce/<slug>.jpg` and change that
 * product's entry to `produce/<slug>.jpg`, then delete its credit below.
 */

export interface PhotoCredit {
  readonly slug: string;
  readonly title: string;
  readonly artist: string;
  readonly license: string;
  readonly sourceUrl: string;
}

const CDN = 'https://upload.wikimedia.org/wikipedia/commons';

/** Product slug to served image URL. */
export const PRODUCE_PHOTOS: Record<string, string> = {
  mango: `${CDN}/thumb/7/74/Mangos_-_single_and_halved.jpg/960px-Mangos_-_single_and_halved.jpg`,
  watermelon: `${CDN}/thumb/c/c3/Watermelon_Bahar1.jpg/960px-Watermelon_Bahar1.jpg`,
  melon: `${CDN}/a/ae/Meloen_vrucht_met_bloem.jpg`,
  falsa: `${CDN}/thumb/6/6e/Phalsa03_Asit.jpg/960px-Phalsa03_Asit.jpg`,
  jamun: `${CDN}/thumb/d/d3/Ripe_jamun_fruits.jpg/960px-Ripe_jamun_fruits.jpg`,
  apple: `${CDN}/thumb/a/a6/Pink_lady_and_cross_section.jpg/960px-Pink_lady_and_cross_section.jpg`,
  pear: `${CDN}/c/cf/Pears.jpg`,
  pomegranate: `${CDN}/thumb/6/60/Punica_granatum_fruit_Grenade.jpg/960px-Punica_granatum_fruit_Grenade.jpg`,
  grapes: `${CDN}/thumb/5/53/Grapes%2C_Rostov-on-Don%2C_Russia.jpg/960px-Grapes%2C_Rostov-on-Don%2C_Russia.jpg`,
  peach: `${CDN}/thumb/9/9e/Autumn_Red_peaches.jpg/960px-Autumn_Red_peaches.jpg`,
  plum: `${CDN}/thumb/e/ec/Plums_African_Rose_-_whole%2C_halved_and_slice.jpg/960px-Plums_African_Rose_-_whole%2C_halved_and_slice.jpg`,
  apricot: `${CDN}/thumb/2/2a/Apricot_and_cross_section.jpg/960px-Apricot_and_cross_section.jpg`,
  cherry: `${CDN}/thumb/f/f6/Cherry_season_%2848216568227%29.jpg/960px-Cherry_season_%2848216568227%29.jpg`,
  orange: `${CDN}/thumb/e/e3/Oranges_-_whole-halved-segment.jpg/960px-Oranges_-_whole-halved-segment.jpg`,
  'sweet-lime': `${CDN}/d/d6/Citrus_limetta.jpeg`,
  banana: `${CDN}/d/de/Bananavarieties.jpg`,
  guava: `${CDN}/thumb/8/88/Guava_pink_fruit.jpg/960px-Guava_pink_fruit.jpg`,
  papaya: `${CDN}/thumb/9/90/Papaya_iftar_sell.JPG/960px-Papaya_iftar_sell.JPG`,
  chikoo: `${CDN}/thumb/0/00/%E0%B4%B8%E0%B4%AA%E0%B5%8D%E0%B4%AA%E0%B5%8B%E0%B4%9F%E0%B5%8D%E0%B4%9F.jpg/960px-%E0%B4%B8%E0%B4%AA%E0%B5%8D%E0%B4%AA%E0%B5%8B%E0%B4%9F%E0%B5%8D%E0%B4%9F.jpg`,
  dates: `${CDN}/thumb/4/45/Dates005.jpg/960px-Dates005.jpg`,
  'other-seasonal-fruit': `${CDN}/thumb/9/97/Gourock_greengrocers_ext.jpg/960px-Gourock_greengrocers_ext.jpg`,

  potato: `${CDN}/thumb/a/ab/Patates.jpg/960px-Patates.jpg`,
  onion: `${CDN}/thumb/a/a2/Mixed_onions.jpg/960px-Mixed_onions.jpg`,
  tomato: `${CDN}/thumb/8/89/Tomato_je.jpg/960px-Tomato_je.jpg`,
  'green-chilli': `${CDN}/thumb/5/50/Madame_Jeanette_and_other_chillies.jpg/960px-Madame_Jeanette_and_other_chillies.jpg`,
  garlic: `${CDN}/thumb/4/49/Opened_garlic_bulb_with_garlic_clove.jpg/960px-Opened_garlic_bulb_with_garlic_clove.jpg`,
  ginger: `${CDN}/thumb/2/22/Ginger_-_%E0%B4%87%E0%B4%9E%E0%B5%8D%E0%B4%9A%E0%B4%BF_10.jpg/960px-Ginger_-_%E0%B4%87%E0%B4%9E%E0%B5%8D%E0%B4%9A%E0%B4%BF_10.jpg`,
  lemon: `${CDN}/thumb/e/e4/P1030323.JPG/960px-P1030323.JPG`,
  cucumber: `${CDN}/thumb/9/96/ARS_cucumber.jpg/960px-ARS_cucumber.jpg`,
  'bitter-gourd': `${CDN}/thumb/9/98/Bitter_gourd_at_Hyderabad_market.jpg/960px-Bitter_gourd_at_Hyderabad_market.jpg`,
  'ridge-gourd': `${CDN}/thumb/d/d5/Luffa_acutangula_Chinese_okra.jpg/960px-Luffa_acutangula_Chinese_okra.jpg`,
  'bottle-gourd': `${CDN}/a/a2/Courge_encore_verte.jpg`,
  tinda: `${CDN}/8/80/Tinda.jpg`,
  pumpkin: `${CDN}/thumb/5/5c/FrenchMarketPumpkinsB.jpg/960px-FrenchMarketPumpkinsB.jpg`,
  spinach: `${CDN}/thumb/5/56/Fresh_Spinach_leaves.jpg/960px-Fresh_Spinach_leaves.jpg`,
  cabbage: `${CDN}/thumb/6/6f/Cabbage_and_cross_section_on_white.jpg/960px-Cabbage_and_cross_section_on_white.jpg`,
  cauliflower: `${CDN}/thumb/2/2f/Chou-fleur_02.jpg/960px-Chou-fleur_02.jpg`,
  okra: `${CDN}/thumb/9/95/Hong_Kong_Okra_Aug_25_2012.JPG/960px-Hong_Kong_Okra_Aug_25_2012.JPG`,
  peas: `${CDN}/thumb/b/bc/Doperwt_rijserwt_peulen_Pisum_sativum.jpg/960px-Doperwt_rijserwt_peulen_Pisum_sativum.jpg`,
  beans: `${CDN}/thumb/a/a0/Heaps_of_beans.jpg/960px-Heaps_of_beans.jpg`,
  carrot: `${CDN}/thumb/a/a2/Vegetable-Carrot-Bundle-wStalks.jpg/960px-Vegetable-Carrot-Bundle-wStalks.jpg`,
  eggplant: `${CDN}/thumb/7/76/Solanum_melongena_24_08_2012_%281%29.JPG/960px-Solanum_melongena_24_08_2012_%281%29.JPG`,
  'other-seasonal-vegetables': `${CDN}/thumb/2/24/Marketvegetables.jpg/960px-Marketvegetables.jpg`,
};

export const PHOTO_CREDITS: readonly PhotoCredit[] = [
  { slug: 'mango', title: 'Mangos - single and halved', artist: 'Ivar Leidus', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mangos_-_single_and_halved.jpg' },
  { slug: 'watermelon', title: 'Watermelon Bahar1', artist: 'Shams948', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Watermelon_Bahar1.jpg' },
  { slug: 'melon', title: 'Meloen vrucht met bloem', artist: 'Rasbak', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Meloen_vrucht_met_bloem.jpg' },
  { slug: 'falsa', title: 'Phalsa03 Asit', artist: 'Asit K. Ghosh Thaumaturgist', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Phalsa03_Asit.jpg' },
  { slug: 'jamun', title: 'Ripe jamun fruits', artist: 'Rajesh dangi', license: 'CC BY 2.5', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ripe_jamun_fruits.jpg' },
  { slug: 'apple', title: 'Pink lady and cross section', artist: 'fir0002 (flagstaffotos)', license: 'GFDL 1.2', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pink_lady_and_cross_section.jpg' },
  { slug: 'pear', title: 'Pears', artist: 'Keith Weller, USDA', license: 'Public domain', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pears.jpg' },
  { slug: 'pomegranate', title: 'Punica granatum fruit', artist: 'Jebulon', license: 'CC0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Punica_granatum_fruit_Grenade.jpg' },
  { slug: 'grapes', title: 'Grapes, Rostov-on-Don', artist: 'Vyacheslav Argenberg', license: 'CC BY 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Grapes,_Rostov-on-Don,_Russia.jpg' },
  { slug: 'peach', title: 'Autumn Red peaches', artist: 'Jack Dykinga, USDA', license: 'Public domain', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Autumn_Red_peaches.jpg' },
  { slug: 'plum', title: 'Plums African Rose', artist: 'Ivar Leidus', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Plums_African_Rose_-_whole,_halved_and_slice.jpg' },
  { slug: 'apricot', title: 'Apricot and cross section', artist: 'Fir0002', license: 'GFDL 1.2', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Apricot_and_cross_section.jpg' },
  { slug: 'cherry', title: 'Cherry season', artist: 'spurekar', license: 'CC BY 2.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Cherry_season_(48216568227).jpg' },
  { slug: 'orange', title: 'Oranges - whole, halved, segment', artist: 'Ivar Leidus', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Oranges_-_whole-halved-segment.jpg' },
  { slug: 'sweet-lime', title: 'Citrus limetta', artist: 'Wikimedia Commons contributor', license: 'Public domain', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Citrus_limetta.jpeg' },
  { slug: 'banana', title: 'Banana varieties', artist: 'TimothyPilgrim', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bananavarieties.jpg' },
  { slug: 'guava', title: 'Guava pink fruit', artist: 'Ivar Leidus', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Guava_pink_fruit.jpg' },
  { slug: 'papaya', title: 'Papaya stall', artist: 'Md. Saiful Aziz Shamseer', license: 'Public domain', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Papaya_iftar_sell.JPG' },
  { slug: 'chikoo', title: 'Sapota (chikoo)', artist: 'Sugeesh', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:%E0%B4%B8%E0%B4%AA%E0%B5%8D%E0%B4%AA%E0%B5%8B%E0%B4%9F%E0%B5%8D%E0%B4%9F.jpg' },
  { slug: 'dates', title: 'Dates', artist: 'Nepenthes', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dates005.jpg' },
  { slug: 'other-seasonal-fruit', title: 'Greengrocer shopfront', artist: 'Dave souza', license: 'CC BY-SA 2.5', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gourock_greengrocers_ext.jpg' },
  { slug: 'potato', title: 'Potatoes', artist: 'Scott Bauer, USDA ARS', license: 'Public domain', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Patates.jpg' },
  { slug: 'onion', title: 'Mixed onions', artist: 'Colin', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mixed_onions.jpg' },
  { slug: 'tomato', title: 'Tomato', artist: 'Softeis', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tomato_je.jpg' },
  { slug: 'green-chilli', title: 'Chillies', artist: 'Takeaway', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Madame_Jeanette_and_other_chillies.jpg' },
  { slug: 'garlic', title: 'Opened garlic bulb', artist: 'Dubravko Sorić', license: 'CC BY 2.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Opened_garlic_bulb_with_garlic_clove.jpg' },
  { slug: 'ginger', title: 'Ginger rhizome', artist: 'Shijan Kaakkara', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ginger_-_%E0%B4%87%E0%B4%9E%E0%B5%8D%E0%B4%9A%E0%B4%BF_10.jpg' },
  { slug: 'lemon', title: 'Lemons', artist: 'Elena Chochkova', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:P1030323.JPG' },
  { slug: 'cucumber', title: 'Cucumber', artist: 'Stephen Ausmus, USDA ARS', license: 'Public domain', sourceUrl: 'https://commons.wikimedia.org/wiki/File:ARS_cucumber.jpg' },
  { slug: 'bitter-gourd', title: 'Bitter gourd at market', artist: 'Bhaskaranaidu', license: 'Public domain', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bitter_gourd_at_Hyderabad_market.jpg' },
  { slug: 'ridge-gourd', title: 'Luffa acutangula', artist: 'Nayan j Nath', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Luffa_acutangula_Chinese_okra.jpg' },
  { slug: 'bottle-gourd', title: 'Bottle gourd', artist: 'カールおじさん', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Courge_encore_verte.jpg' },
  { slug: 'tinda', title: 'Tinda', artist: 'Tomaszrp', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tinda.jpg' },
  { slug: 'pumpkin', title: 'Market pumpkins', artist: 'Infrogmation of New Orleans', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:FrenchMarketPumpkinsB.jpg' },
  { slug: 'spinach', title: 'Fresh spinach leaves', artist: 'Charipearl', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Fresh_Spinach_leaves.jpg' },
  { slug: 'cabbage', title: 'Cabbage and cross section', artist: 'fir0002 (flagstaffotos)', license: 'GFDL 1.2', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Cabbage_and_cross_section_on_white.jpg' },
  { slug: 'cauliflower', title: 'Cauliflower', artist: 'Coyau', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chou-fleur_02.jpg' },
  { slug: 'okra', title: 'Okra', artist: 'Earth100', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hong_Kong_Okra_Aug_25_2012.JPG' },
  { slug: 'peas', title: 'Pea pods', artist: 'Rasbak', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Doperwt_rijserwt_peulen_Pisum_sativum.jpg' },
  { slug: 'beans', title: 'Heaps of beans', artist: 'Wikimedia Commons contributor', license: 'GFDL 1.2', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Heaps_of_beans.jpg' },
  { slug: 'carrot', title: 'Carrot bundle', artist: 'Evan-Amos', license: 'Public domain', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Vegetable-Carrot-Bundle-wStalks.jpg' },
  { slug: 'eggplant', title: 'Solanum melongena', artist: 'Joydeep', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Solanum_melongena_24_08_2012_(1).JPG' },
  { slug: 'other-seasonal-vegetables', title: 'Market vegetables', artist: 'Jasper Greek Golangco', license: 'Copyrighted free use', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Marketvegetables.jpg' },
];

export function photoFor(slug: string): string | undefined {
  return PRODUCE_PHOTOS[slug];
}
