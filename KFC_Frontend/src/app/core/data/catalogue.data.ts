import { Category, Product } from '../models/catalogue.model';

/**
 * The bundled catalogue.
 *
 * Two things to understand before editing this file:
 *
 * 1. Every product ships with `isConfirmedByBusiness: false`. A catalogue listing is a category the
 *    business trades in as a commission agent, not a claim that the item is in the shed today. The
 *    cards say so, and availability is confirmed on WhatsApp. Set the flag to `true` only for items
 *    the owner has actually confirmed.
 *
 * 2. `seasonMonths` is the typical market season for the crop in Sindh, not a statement about this
 *    business. An empty array means the item is generally traded year round.
 *
 * `originRegion` stays empty and `isOriginVerified` stays false everywhere, because no origin has
 * been confirmed by the owner or a supplier.
 *
 * Sindhi names are the common market names; they should be reviewed by a native Sindhi speaker
 * before launch.
 */

const YEAR_ROUND: readonly number[] = [];

export const CATEGORIES: readonly Category[] = [
  // Fruits
  { id: 1, kind: 'fruit', slug: 'summer-fruit', nameEn: 'Summer Fruit', nameSd: 'اونهاري جا ميوا', sortOrder: 1 },
  { id: 2, kind: 'fruit', slug: 'orchard-fruit', nameEn: 'Orchard Fruit', nameSd: 'باغ جا ميوا', sortOrder: 2 },
  { id: 3, kind: 'fruit', slug: 'stone-fruit', nameEn: 'Stone Fruit', nameSd: 'ڪڻي وارا ميوا', sortOrder: 3 },
  { id: 4, kind: 'fruit', slug: 'citrus', nameEn: 'Citrus', nameSd: 'نارنگي قسم', sortOrder: 4 },
  { id: 5, kind: 'fruit', slug: 'tropical-dates', nameEn: 'Tropical & Dates', nameSd: 'گرم علائقي جا ميوا ۽ کجور', sortOrder: 5 },

  // Vegetables
  { id: 6, kind: 'vegetable', slug: 'everyday-staples', nameEn: 'Everyday Staples', nameSd: 'روزاني ضرورت', sortOrder: 1 },
  { id: 7, kind: 'vegetable', slug: 'gourds-cucurbits', nameEn: 'Gourds', nameSd: 'ڪدو قسم', sortOrder: 2 },
  { id: 8, kind: 'vegetable', slug: 'leafy-greens', nameEn: 'Leafy Greens', nameSd: 'پَنَ واريون ڀاڄيون', sortOrder: 3 },
  { id: 9, kind: 'vegetable', slug: 'pods-beans', nameEn: 'Pods & Beans', nameSd: 'ڦريون', sortOrder: 4 },
  { id: 10, kind: 'vegetable', slug: 'roots-others', nameEn: 'Roots & Others', nameSd: 'پاڙ واريون ۽ ٻيون', sortOrder: 5 },
];

export const PRODUCTS: readonly Product[] = [
  // ---------------------------------------------------------------- Fruits
  {
    id: 1, kind: 'fruit', categorySlug: 'summer-fruit', slug: 'mango',
    nameEn: 'Mangoes', nameSd: 'انبو', localName: 'Ambo',
    descriptionEn: 'The headline summer fruit of the Sindh mandi, traded by the crate across the Sindhri, Sindhri Late and Chaunsa varieties.',
    descriptionSd: 'اونهاري جو خاص ميوو، منڊي ۾ پيتين ۾ وڪامندو آهي.',
    artKey: 'mango', seasonMonths: [5, 6, 7, 8],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 1,
  },
  {
    id: 2, kind: 'fruit', categorySlug: 'summer-fruit', slug: 'watermelon',
    nameEn: 'Watermelon', nameSd: 'هنداڻو', localName: 'Tarbooz',
    descriptionEn: 'Large summer melon sold by the piece and by the load, at its heaviest volume through the hot months.',
    descriptionSd: 'اونهاري جو وڏو ميوو، داڻي ۽ لوڊ تي وڪامندو آهي.',
    artKey: 'watermelon', seasonMonths: [4, 5, 6, 7, 8],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'PIECE', sortOrder: 2,
  },
  {
    id: 3, kind: 'fruit', categorySlug: 'summer-fruit', slug: 'melon',
    nameEn: 'Melon', nameSd: 'ڦوٽ', localName: 'Kharbooza',
    descriptionEn: 'Sweet netted summer melon, graded by size and sugar before it moves to retail.',
    descriptionSd: 'مٺو اونهاري جو ميوو، ماپ موجب درجي بندي ٿيندي آهي.',
    artKey: 'melon', seasonMonths: [4, 5, 6, 7],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 3,
  },
  {
    id: 4, kind: 'fruit', categorySlug: 'summer-fruit', slug: 'falsa',
    nameEn: 'Falsa', nameSd: 'فالسو', localName: 'Falsa',
    descriptionEn: 'Small tart purple berry with a short, sharp season, moved quickly because it does not keep.',
    descriptionSd: 'ننڍو کٽو ميوو، موسم ننڍي هوندي آهي.',
    artKey: 'falsa', seasonMonths: [5, 6, 7],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 4,
  },
  {
    id: 5, kind: 'fruit', categorySlug: 'summer-fruit', slug: 'jamun',
    nameEn: 'Jamun', nameSd: 'جامڻ', localName: 'Jaman',
    descriptionEn: 'Deep purple monsoon fruit with a single stone, handled in shallow crates to avoid bruising.',
    descriptionSd: 'ڳاڙهي واڱڻائي رنگ جو ميوو، احتياط سان کنيو ويندو آهي.',
    artKey: 'jamun', seasonMonths: [6, 7, 8],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 5,
  },
  {
    id: 6, kind: 'fruit', categorySlug: 'orchard-fruit', slug: 'apple',
    nameEn: 'Apples', nameSd: 'صوف', localName: 'Saib',
    descriptionEn: 'Firm orchard fruit traded in tray-packed cartons and graded by size and colour.',
    descriptionSd: 'سخت ميوو، ڪارٽن ۾ درجي بندي سان وڪامندو آهي.',
    artKey: 'apple', seasonMonths: [8, 9, 10, 11, 12, 1],
    isConfirmedByBusiness: false, isOriginVerified: false,
    defaultUnit: 'KG', sortOrder: 6,
  },
  {
    id: 7, kind: 'fruit', categorySlug: 'orchard-fruit', slug: 'pear',
    nameEn: 'Pears', nameSd: 'ناشپاتي', localName: 'Nashpati',
    descriptionEn: 'Crisp autumn orchard fruit, packed in trays because it marks easily.',
    descriptionSd: 'سرءُ جو ميوو، ٽري ۾ بند ٿيندو آهي.',
    artKey: 'pear', seasonMonths: [7, 8, 9, 10],
    isConfirmedByBusiness: false, isOriginVerified: false,
    defaultUnit: 'KG', sortOrder: 7,
  },
  {
    id: 8, kind: 'fruit', categorySlug: 'orchard-fruit', slug: 'pomegranate',
    nameEn: 'Pomegranates', nameSd: 'ڏاڙهون', localName: 'Anar',
    descriptionEn: 'Hard-skinned autumn fruit graded by size and skin colour, sold by the carton.',
    descriptionSd: 'سخت کَل وارو ميوو، ماپ ۽ رنگ موجب درجي بندي.',
    artKey: 'pomegranate', seasonMonths: [9, 10, 11, 12],
    isConfirmedByBusiness: false, isOriginVerified: false,
    defaultUnit: 'KG', sortOrder: 8,
  },
  {
    id: 9, kind: 'fruit', categorySlug: 'orchard-fruit', slug: 'grapes',
    nameEn: 'Grapes', nameSd: 'انگور', localName: 'Angoor',
    descriptionEn: 'Bunched table fruit handled in shallow crates and sold on bunch condition.',
    descriptionSd: 'ڇڳن ۾ ايندو ميوو، ننڍين پيتين ۾ رکيو ويندو آهي.',
    artKey: 'grapes', seasonMonths: [6, 7, 8, 9],
    isConfirmedByBusiness: false, isOriginVerified: false,
    defaultUnit: 'KG', sortOrder: 9,
  },
  {
    id: 10, kind: 'fruit', categorySlug: 'stone-fruit', slug: 'peach',
    nameEn: 'Peaches', nameSd: 'آڙو', localName: 'Aaroo',
    descriptionEn: 'Soft summer stone fruit, tray-packed and moved fast because it ripens in transit.',
    descriptionSd: 'نرم ميوو، جلدي پچي ويندو آهي.',
    artKey: 'peach', seasonMonths: [5, 6, 7, 8],
    isConfirmedByBusiness: false, isOriginVerified: false,
    defaultUnit: 'KG', sortOrder: 10,
  },
  {
    id: 11, kind: 'fruit', categorySlug: 'stone-fruit', slug: 'plum',
    nameEn: 'Plums', nameSd: 'آلوبخارو', localName: 'Aalu Bukhara',
    descriptionEn: 'Small stone fruit with a short season, graded on colour and firmness.',
    descriptionSd: 'ننڍو ڪڻي وارو ميوو، موسم ننڍي.',
    artKey: 'plum', seasonMonths: [5, 6, 7],
    isConfirmedByBusiness: false, isOriginVerified: false,
    defaultUnit: 'KG', sortOrder: 11,
  },
  {
    id: 12, kind: 'fruit', categorySlug: 'stone-fruit', slug: 'apricot',
    nameEn: 'Apricots', nameSd: 'خوباني', localName: 'Khubani',
    descriptionEn: 'Delicate summer stone fruit with a very short shelf life, sold fresh and dried.',
    descriptionSd: 'نازڪ ميوو، تازو ۽ سڪل ٻئي وڪامن ٿا.',
    artKey: 'apricot', seasonMonths: [6, 7, 8],
    isConfirmedByBusiness: false, isOriginVerified: false,
    defaultUnit: 'KG', sortOrder: 12,
  },
  {
    id: 13, kind: 'fruit', categorySlug: 'stone-fruit', slug: 'cherry',
    nameEn: 'Cherries', nameSd: 'چيري', localName: 'Cherry',
    descriptionEn: 'Short-season stone fruit handled in small boxes; a seasonal arrival only.',
    descriptionSd: 'ٿوري موسم وارو ميوو، ننڍن دٻن ۾.',
    artKey: 'cherry', seasonMonths: [5, 6, 7],
    isConfirmedByBusiness: false, isOriginVerified: false,
    defaultUnit: 'KG', sortOrder: 13,
  },
  {
    id: 14, kind: 'fruit', categorySlug: 'citrus', slug: 'orange',
    nameEn: 'Oranges', nameSd: 'نارنگي', localName: 'Kinnow',
    descriptionEn: 'Winter citrus traded by the carton and counted in hundreds as well as by weight.',
    descriptionSd: 'سياري جو ميوو، ڪارٽن ۾ وڪامندو آهي.',
    artKey: 'orange', seasonMonths: [12, 1, 2, 3],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 14,
  },
  {
    id: 15, kind: 'fruit', categorySlug: 'citrus', slug: 'sweet-lime',
    nameEn: 'Sweet Lime', nameSd: 'موسمبي', localName: 'Mosambi',
    descriptionEn: 'Mild winter citrus, mostly moved for juicing.',
    descriptionSd: 'سياري جو مٺو ميوو، گھڻو ڪري رس لاءِ.',
    artKey: 'sweet-lime', seasonMonths: [11, 12, 1, 2, 3],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 15,
  },
  {
    id: 16, kind: 'fruit', categorySlug: 'tropical-dates', slug: 'banana',
    nameEn: 'Bananas', nameSd: 'ڪيلو', localName: 'Kela',
    descriptionEn: 'Year-round fruit traded by the dozen and by the hand, ripened in stages.',
    descriptionSd: 'سڄو سال ملندو، درجن جي حساب سان.',
    artKey: 'banana', seasonMonths: YEAR_ROUND,
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'DOZEN', sortOrder: 16,
  },
  {
    id: 17, kind: 'fruit', categorySlug: 'tropical-dates', slug: 'guava',
    nameEn: 'Guavas', nameSd: 'ڳدرو', localName: 'Amrood',
    descriptionEn: 'Aromatic winter fruit, graded by size and sold in baskets and crates.',
    descriptionSd: 'سياري جو خوشبودار ميوو، ٽوڪرين ۾ ايندو آهي.',
    artKey: 'guava', seasonMonths: [8, 9, 10, 11, 12, 1, 2],
    // Featured first: Larkana is a guava town, so amrood leads the fruit list.
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 0,
  },
  {
    id: 18, kind: 'fruit', categorySlug: 'tropical-dates', slug: 'papaya',
    nameEn: 'Papaya', nameSd: 'پپيتو', localName: 'Papita',
    descriptionEn: 'Large soft tropical fruit available through most of the year, sold by weight.',
    descriptionSd: 'نرم ميوو، گھڻو سال ملندو، وزن تي.',
    artKey: 'papaya', seasonMonths: YEAR_ROUND,
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 18,
  },
  {
    id: 19, kind: 'fruit', categorySlug: 'tropical-dates', slug: 'chikoo',
    nameEn: 'Chikoo', nameSd: 'چيڪو', localName: 'Chikoo',
    descriptionEn: 'Small brown-skinned sweet fruit, handled gently and sold ripe.',
    descriptionSd: 'ننڍو مٺو ميوو، احتياط سان کنيو ويندو آهي.',
    artKey: 'chikoo', seasonMonths: [2, 3, 4, 5, 6],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 19,
  },
  {
    id: 20, kind: 'fruit', categorySlug: 'tropical-dates', slug: 'dates',
    nameEn: 'Dates / Khajoor', nameSd: 'کجور', localName: 'Khajoor',
    descriptionEn: 'Traded fresh at harvest and dried thereafter; Sindh is a major date-growing region.',
    descriptionSd: 'تازي ۽ سڪل ٻئي صورتن ۾، سنڌ جي خاص پيداوار.',
    artKey: 'dates', seasonMonths: [7, 8, 9],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 20,
  },
  {
    id: 21, kind: 'fruit', categorySlug: 'summer-fruit', slug: 'other-seasonal-fruit',
    nameEn: 'Other Seasonal Fruits', nameSd: 'ٻيا موسمي ميوا',
    descriptionEn: 'Whatever else is arriving in the mandi this week. Message us and we will tell you what is on the floor today.',
    descriptionSd: 'هن هفتي منڊي ۾ ايندڙ ٻيا ميوا. اسان کان پڇو.',
    artKey: 'seasonal-basket', seasonMonths: YEAR_ROUND,
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 99,
  },

  // ---------------------------------------------------------------- Vegetables
  {
    id: 22, kind: 'vegetable', categorySlug: 'everyday-staples', slug: 'potato',
    nameEn: 'Potatoes', nameSd: 'پٽاٽا', localName: 'Aloo',
    descriptionEn: 'Stored and traded all year in jute bags, graded by size and skin condition.',
    descriptionSd: 'سڄو سال ملندا، ڳوڻين ۾ وڪامندا آهن.',
    artKey: 'potato', seasonMonths: YEAR_ROUND,
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 1,
  },
  {
    id: 23, kind: 'vegetable', categorySlug: 'everyday-staples', slug: 'onion',
    nameEn: 'Onions', nameSd: 'بصر', localName: 'Piyaz',
    descriptionEn: 'A core mandi staple sold in bags year round, with price moving sharply on arrivals.',
    descriptionSd: 'منڊي جي بنيادي شيءِ، سڄو سال ڳوڻين ۾.',
    artKey: 'onion', seasonMonths: YEAR_ROUND,
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 2,
  },
  {
    id: 24, kind: 'vegetable', categorySlug: 'everyday-staples', slug: 'tomato',
    nameEn: 'Tomatoes', nameSd: 'ٽماٽا', localName: 'Tamatar',
    descriptionEn: 'Traded year round in shallow crates; the most price-sensitive line on the floor.',
    descriptionSd: 'سڄو سال ملندا، قيمت جلدي بدلجندي آهي.',
    artKey: 'tomato', seasonMonths: YEAR_ROUND,
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 3,
  },
  {
    id: 25, kind: 'vegetable', categorySlug: 'everyday-staples', slug: 'green-chilli',
    nameEn: 'Green Chillies', nameSd: 'سائي مرچ', localName: 'Hari Mirch',
    descriptionEn: 'Sold in sacks year round; Sindh is a major chilli-growing province.',
    descriptionSd: 'سڄو سال ڳوڻين ۾، سنڌ جي خاص پيداوار.',
    artKey: 'green-chilli', seasonMonths: YEAR_ROUND,
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 4,
  },
  {
    id: 26, kind: 'vegetable', categorySlug: 'everyday-staples', slug: 'garlic',
    nameEn: 'Garlic', nameSd: 'ٿوم', localName: 'Lehsan',
    descriptionEn: 'Dry bulb line traded year round from stored stock, graded on bulb size.',
    descriptionSd: 'سڄو سال ملندو، ڳنڍ جي ماپ موجب.',
    artKey: 'garlic', seasonMonths: YEAR_ROUND,
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 5,
  },
  {
    id: 27, kind: 'vegetable', categorySlug: 'everyday-staples', slug: 'ginger',
    nameEn: 'Ginger', nameSd: 'ادرڪ', localName: 'Adrak',
    descriptionEn: 'Rhizome line sold by weight all year, mostly from stored and imported stock.',
    descriptionSd: 'سڄو سال وزن تي وڪامندو آهي.',
    artKey: 'ginger', seasonMonths: YEAR_ROUND,
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 6,
  },
  {
    id: 28, kind: 'vegetable', categorySlug: 'everyday-staples', slug: 'lemon',
    nameEn: 'Lemon', nameSd: 'ليمو', localName: 'Limo',
    descriptionEn: 'Small citrus traded with the vegetable lines, sold by weight year round.',
    descriptionSd: 'ننڍو ميوو، ڀاڄين سان گڏ وڪامندو آهي.',
    artKey: 'lemon', seasonMonths: YEAR_ROUND,
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 7,
  },
  {
    id: 29, kind: 'vegetable', categorySlug: 'gourds-cucurbits', slug: 'cucumber',
    nameEn: 'Cucumber', nameSd: 'ڪڪڙي', localName: 'Kheera',
    descriptionEn: 'Summer salad line sold by weight, strongest through the hot months.',
    descriptionSd: 'اونهاري جي ڀاڄي، وزن تي وڪامندي آهي.',
    artKey: 'cucumber', seasonMonths: [3, 4, 5, 6, 7, 8, 9],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 8,
  },
  {
    id: 30, kind: 'vegetable', categorySlug: 'gourds-cucurbits', slug: 'bitter-gourd',
    nameEn: 'Bitter Gourd', nameSd: 'ڪريلو', localName: 'Karela',
    descriptionEn: 'Ridged summer gourd graded on size and colour, sold by weight.',
    descriptionSd: 'اونهاري جي ڀاڄي، ماپ موجب درجي بندي.',
    artKey: 'bitter-gourd', seasonMonths: [4, 5, 6, 7, 8, 9],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 9,
  },
  {
    id: 31, kind: 'vegetable', categorySlug: 'gourds-cucurbits', slug: 'ridge-gourd',
    nameEn: 'Ridge Gourd', nameSd: 'تورئي', localName: 'Tori',
    descriptionEn: 'Long ridged summer gourd, sold fresh and handled in open crates.',
    descriptionSd: 'ڊگھي اونهاري جي ڀاڄي، کُليل پيتين ۾.',
    artKey: 'ridge-gourd', seasonMonths: [4, 5, 6, 7, 8, 9],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 10,
  },
  {
    id: 32, kind: 'vegetable', categorySlug: 'gourds-cucurbits', slug: 'bottle-gourd',
    nameEn: 'Bottle Gourd', nameSd: 'ڪدو', localName: 'Lauki',
    descriptionEn: 'Large pale gourd sold by weight across most of the warm season.',
    descriptionSd: 'وڏي ڀاڄي، گرم موسم ۾ وزن تي.',
    artKey: 'bottle-gourd', seasonMonths: [3, 4, 5, 6, 7, 8, 9, 10],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 11,
  },
  {
    id: 33, kind: 'vegetable', categorySlug: 'gourds-cucurbits', slug: 'tinda',
    nameEn: 'Tinda', nameSd: 'ٽينڊو', localName: 'Tinda',
    descriptionEn: 'Small round summer gourd, sold by weight and graded small for the best price.',
    descriptionSd: 'ننڍي گول ڀاڄي، ننڍي ماپ جي قيمت وڌيڪ.',
    artKey: 'tinda', seasonMonths: [4, 5, 6, 7, 8],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 12,
  },
  {
    id: 34, kind: 'vegetable', categorySlug: 'gourds-cucurbits', slug: 'pumpkin',
    nameEn: 'Pumpkin', nameSd: 'حلوا ڪدو', localName: 'Kaddu',
    descriptionEn: 'Heavy keeping gourd sold whole and in cut pieces by weight.',
    descriptionSd: 'ڳري ڀاڄي، سڄي ۽ ڪٽيل ٻئي طرح.',
    artKey: 'pumpkin', seasonMonths: [5, 6, 7, 8, 9, 10],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 13,
  },
  {
    id: 35, kind: 'vegetable', categorySlug: 'leafy-greens', slug: 'spinach',
    nameEn: 'Spinach', nameSd: 'پالڪ', localName: 'Palak',
    descriptionEn: 'Winter leafy line tied in bundles and moved the same day it arrives.',
    descriptionSd: 'سياري جي ڀاڄي، ڳٺڙين ۾، جلدي وڪامندي آهي.',
    artKey: 'spinach', seasonMonths: [10, 11, 12, 1, 2, 3],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 14,
  },
  {
    id: 36, kind: 'vegetable', categorySlug: 'leafy-greens', slug: 'cabbage',
    nameEn: 'Cabbage', nameSd: 'بند گوبي', localName: 'Band Gobi',
    descriptionEn: 'Dense winter head sold by weight; keeps better than most greens.',
    descriptionSd: 'سياري جي ڀاڄي، وزن تي، گھڻو وقت رهندي آهي.',
    artKey: 'cabbage', seasonMonths: [11, 12, 1, 2, 3],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 15,
  },
  {
    id: 37, kind: 'vegetable', categorySlug: 'leafy-greens', slug: 'cauliflower',
    nameEn: 'Cauliflower', nameSd: 'گل گوبي', localName: 'Phool Gobi',
    descriptionEn: 'Winter head graded on curd whiteness and tightness, sold by weight.',
    descriptionSd: 'سياري جي ڀاڄي، اڇي رنگ تي درجي بندي.',
    artKey: 'cauliflower', seasonMonths: [10, 11, 12, 1, 2, 3],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 16,
  },
  {
    id: 38, kind: 'vegetable', categorySlug: 'pods-beans', slug: 'okra',
    nameEn: 'Okra / Bhindi', nameSd: 'ڀينڊي', localName: 'Bhindi',
    descriptionEn: 'Tender summer pod picked young; graded small and sold by weight.',
    descriptionSd: 'اونهاري جي نرم ڦري، ننڍي چُني ويندي آهي.',
    artKey: 'okra', seasonMonths: [3, 4, 5, 6, 7, 8, 9],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 17,
  },
  {
    id: 39, kind: 'vegetable', categorySlug: 'pods-beans', slug: 'peas',
    nameEn: 'Peas', nameSd: 'مٽر', localName: 'Matar',
    descriptionEn: 'Winter pod line sold in sacks, priced on pod fill and freshness.',
    descriptionSd: 'سياري جي ڦري، ڳوڻين ۾ وڪامندي آهي.',
    artKey: 'peas', seasonMonths: [11, 12, 1, 2],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 18,
  },
  {
    id: 40, kind: 'vegetable', categorySlug: 'pods-beans', slug: 'beans',
    nameEn: 'Beans', nameSd: 'ڦري', localName: 'Phali',
    descriptionEn: 'Green pod line of the cooler months, sold by weight and graded on snap.',
    descriptionSd: 'ٿڌي موسم جي سائي ڦري، وزن تي.',
    artKey: 'beans', seasonMonths: [10, 11, 12, 1, 2, 3],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 19,
  },
  {
    id: 41, kind: 'vegetable', categorySlug: 'roots-others', slug: 'carrot',
    nameEn: 'Carrots', nameSd: 'گاجر', localName: 'Gajar',
    descriptionEn: 'Winter root washed and bunched or bagged, sold by weight.',
    descriptionSd: 'سياري جي پاڙ، ڌوپي ڳوڻين ۾ ايندي آهي.',
    artKey: 'carrot', seasonMonths: [11, 12, 1, 2, 3],
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 20,
  },
  {
    id: 42, kind: 'vegetable', categorySlug: 'roots-others', slug: 'eggplant',
    nameEn: 'Eggplant / Baingan', nameSd: 'واڱڻ', localName: 'Baingan',
    descriptionEn: 'Traded year round in round and long shapes, graded on skin gloss.',
    descriptionSd: 'سڄو سال ملندي، گول ۽ ڊگھي ٻنهي شڪلين ۾.',
    artKey: 'eggplant', seasonMonths: YEAR_ROUND,
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 21,
  },
  {
    id: 43, kind: 'vegetable', categorySlug: 'roots-others', slug: 'other-seasonal-vegetables',
    nameEn: 'Other Seasonal Vegetables', nameSd: 'ٻيون موسمي ڀاڄيون',
    descriptionEn: 'Coriander, mint, turnip, radish and whatever else the season brings. Message us for what is on the floor today.',
    descriptionSd: 'ڌاڻا، پودينو، گوگڙو ۽ ٻيون موسمي ڀاڄيون. اسان کان پڇو.',
    artKey: 'seasonal-basket', seasonMonths: YEAR_ROUND,
    isConfirmedByBusiness: false, isOriginVerified: false, defaultUnit: 'KG', sortOrder: 99,
  },
];
