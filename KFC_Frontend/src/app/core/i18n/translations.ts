/**
 * Runtime translations for English and Sindhi.
 *
 * `SD` is typed against the keys of `EN`, so a missing Sindhi string is a compile error rather than
 * an English word leaking into the Sindhi layout.
 *
 * The Sindhi strings are written in the common market register. They should be reviewed by a native
 * Sindhi speaker before launch - treat them as a working draft, not a signed-off translation.
 */

export type Lang = 'en' | 'sd';

export const EN = {
  // Navigation
  'nav.home': 'Home',
  'nav.fruits': 'Fruits',
  'nav.vegetables': 'Vegetables',
  'nav.about': 'About Us',
  'nav.contact': 'Contact',

  // Accessibility
  'a11y.skipToContent': 'Skip to main content',
  'a11y.mainNav': 'Main navigation',
  'a11y.footerNav': 'Footer navigation',
  'a11y.openMenu': 'Open menu',
  'a11y.closeMenu': 'Close menu',
  'a11y.languageSwitcher': 'Change language',
  'a11y.mapTitle': 'Map of the Sabzi Mandi area in Larkana',

  // Shared labels
  'common.whatsapp': 'WhatsApp',
  'common.whatsappInquiry': 'WhatsApp Inquiry',
  'common.call': 'Call',
  'common.getDirections': 'Get Directions',
  'common.openInMaps': 'Open in Google Maps',
  'common.directions': 'Directions',
  'common.search': 'Search',
  'common.searchPlaceholder': 'Search a name, e.g. mango or tamatar',
  'common.allCategories': 'All',
  'common.inSeasonNow': 'In season',
  'common.inSeasonFilter': 'In season now only',
  'common.clearFilters': 'Clear filters',
  'common.noResults': 'Nothing matched that search',
  'common.noResultsHint': 'Try a shorter word, or clear the filters.',
  'common.showingCount': 'Showing {count} of {total}',
  'common.copy': 'Copy number',
  'common.copied': 'Copied',
  'common.language': 'Language',

  // AI assistant
  'chat.open': 'Open the AI assistant',
  'chat.title': 'AI Assistant',
  'chat.close': 'Close the assistant',
  'chat.placeholder': 'Ask about fruits, vegetables or the mandi…',
  'chat.send': 'Send message',
  'chat.thinking': 'The assistant is typing',
  'chat.greeting':
    'Assalam-o-Alaikum! Ask me about fruits, vegetables or how the mandi works. For today’s rates and orders, please message us on WhatsApp.',
  'chat.disclaimer': 'AI answers can be wrong. It cannot see live prices or stock.',
  'chat.offline':
    'The assistant is not switched on yet — no API key is configured. Please use WhatsApp to reach us.',

  // Shop
  'shop.add': 'Add',
  'shop.packSize': 'Pack size',
  'shop.increase': 'Increase quantity',
  'shop.decrease': 'Decrease quantity',
  'shop.priceOnRequest': 'Price on request',

  // Basket
  'cart.title': 'Your basket',
  'cart.short': 'Basket',
  'cart.open': 'Open basket',
  'cart.close': 'Close basket',
  'cart.empty': 'Your basket is empty',
  'cart.emptyHint': 'Add fruits and vegetables and they will show up here.',
  'cart.subtotal': 'Subtotal',
  'cart.checkout': 'Send order on WhatsApp',
  'cart.clear': 'Clear basket',
  'cart.remove': 'Remove',
  'cart.continue': 'Continue shopping',
  'cart.note':
    'This sends your basket to us as a WhatsApp message. Nothing is charged here — we confirm today’s rate and availability before anything is packed.',
  'cart.itemCount': '{count} item(s)',

  // Placeholder price notice
  'banner.placeholderPrices':
    'Sample prices. The rates shown are placeholders for setup and are not Khuhra Fruit Company’s real rates — message us for today’s rate.',
  'banner.dismiss': 'Dismiss',

  // Hero carousel
  'hero.label': 'Featured',
  'hero.prev': 'Previous slide',
  'hero.next': 'Next slide',
  'hero.goTo': 'Go to slide {n}',
  'hero.guavaTitle': 'Larkana Amrood',
  'hero.guavaSub': 'Guava, graded and sold by the crate at Sabzi Mandi, Larkana.',
  'hero.guavaCta': 'Shop Fruits',
  'hero.s1Title': 'Fresh Fruits & Vegetables from Larkana',
  'hero.s1Sub':
    'Khuhra Fruit Company — Sabzi Fruit Commission Agent at Sabzi Mandi, Larkana, Sindh.',
  'hero.s1Cta': 'Shop Now',
  'hero.s2Title': 'Fresh Vegetables Every Day',
  'hero.s2Sub': 'Potatoes, onions, tomatoes, gourds, greens and roots.',
  'hero.s2Cta': 'Shop Vegetables',
  'hero.s3Title': 'Seasonal Fruit from the Mandi',
  'hero.s3Sub': 'Mangoes, dates, guavas, melons and citrus, in season.',
  'hero.s3Cta': 'Shop Fruits',
  'hero.s4Title': 'Order on WhatsApp',
  'hero.s4Sub': 'Build your basket and send it to us in one message.',
  'hero.s4Cta': 'Message Us',

  // Home
  'home.shopByCategory': 'Shop by category',
  'home.inSeasonTitle': 'In season now',
  'home.fruitsTitle': 'Fresh fruits',
  'home.vegetablesTitle': 'Fresh vegetables',
  'home.seeMore': 'See more',
  'home.info1Title': 'Sabzi Mandi, Larkana',
  'home.info1Body': 'We trade on the market floor in Larkana, Sindh.',
  'home.info2Title': 'Order on WhatsApp',
  'home.info2Body': 'Build your basket and send it in one message.',
  'home.info3Title': 'English & Sindhi',
  'home.info3Body': 'Browse the whole shop in either language.',

  // Shop pages
  'cat.fruitsTitle': 'Fruits',
  'cat.vegetablesTitle': 'Vegetables',
  'cat.filterCategory': 'Category',

  // About
  'about.title': 'About Khuhra Fruit Company',
  'about.subtitle': 'A Sabzi Fruit Commission Agent at the Sabzi Fruit Market in Larkana, Sindh.',
  'about.roleTitle': 'What a commission agent does',
  'about.roleBody':
    'A commission agent, or arhti, stands between the grower and the buyer on the mandi floor. Produce arrives from the grower, the agent sells it on the day’s market, and the grower is paid against that sale. Buyers get graded lots and a single point of contact; growers get access to the market without having to sell it themselves.',
  'about.factsTitle': 'At a glance',
  'about.fact.business': 'Business',
  'about.fact.role': 'Role',
  'about.fact.location': 'Location',
  'about.fact.languages': 'Languages',
  'about.fact.languagesValue': 'English and Sindhi',
  'about.honestyTitle': 'What this site does not claim',
  'about.honestyBody':
    'This website lists the fruit and vegetable lines the business trades in. It does not publish a founding year, delivery coverage, farm ownership, certifications or customer testimonials, because none of that has been confirmed by the owner. Prices move with the market, so we confirm the rate on every order. If you need anything else, please ask on the phone.',
  'about.ctaTitle': 'Questions about a product or a price?',

  // Contact
  'contact.title': 'Contact',
  'contact.subtitle': 'Call us, or send a WhatsApp message.',
  'contact.phonesTitle': 'Phone',
  'contact.whatsappTitle': 'WhatsApp',
  'contact.whatsappBody': 'Send your product and quantity and we will reply with today’s rate.',
  'contact.addressTitle': 'Address',
  'contact.mapTitle': 'Find us',
  'contact.mapNote':
    'The map shows the Sabzi Mandi area in Larkana. The exact shop pin has not been confirmed yet, so use the market as your landmark and call when you arrive.',
  'contact.hoursTitle': 'Market timings',
  'contact.hoursBody':
    'Trading hours are not published on this site. Call the number above to confirm before you travel.',
  'contact.primary': 'Primary',

  // Not found
  'notFound.title': 'Page not found',
  'notFound.body': 'That page does not exist. The shop is below.',
  'notFound.cta': 'Back to home',

  // Footer
  'footer.quickLinks': 'Quick links',
  'footer.contactTitle': 'Contact',
  'footer.findUs': 'Find us',
  'footer.rights': 'All rights reserved.',
  'footer.note': 'Prices move with the market. We confirm today’s rate when you send your order.',

  // WhatsApp message bodies
  'msg.product':
    'Assalam-o-Alaikum, I would like to inquire about the current rate and availability of {product}. Please share today’s rate and available quantity.',
  'msg.general':
    'Assalam-o-Alaikum, I would like to inquire about today’s rates and availability at Khuhra Fruit Company.',

  // Months
  'month.1': 'Jan',
  'month.2': 'Feb',
  'month.3': 'Mar',
  'month.4': 'Apr',
  'month.5': 'May',
  'month.6': 'Jun',
  'month.7': 'Jul',
  'month.8': 'Aug',
  'month.9': 'Sep',
  'month.10': 'Oct',
  'month.11': 'Nov',
  'month.12': 'Dec',
} as const;

export type TranslationKey = keyof typeof EN;

export const SD: Record<TranslationKey, string> = {
  // Navigation
  'nav.home': 'مُک صفحو',
  'nav.fruits': 'ميوا',
  'nav.vegetables': 'ڀاڄيون',
  'nav.about': 'اسان بابت',
  'nav.contact': 'رابطو',

  // Accessibility
  'a11y.skipToContent': 'مُک مواد تي وڃو',
  'a11y.mainNav': 'مُک فهرست',
  'a11y.footerNav': 'هيٺيون فهرست',
  'a11y.openMenu': 'فهرست کوليو',
  'a11y.closeMenu': 'فهرست بند ڪريو',
  'a11y.languageSwitcher': 'ٻولي تبديل ڪريو',
  'a11y.mapTitle': 'لاڙڪاڻي جي سبزي منڊي جو نقشو',

  // Shared labels
  'common.whatsapp': 'واٽس ايپ',
  'common.whatsappInquiry': 'واٽس ايپ تي پڇو',
  'common.call': 'ڪال',
  'common.getDirections': 'رستو ڏسو',
  'common.openInMaps': 'گوگل نقشي ۾ کوليو',
  'common.directions': 'رستو',
  'common.search': 'ڳوليو',
  'common.searchPlaceholder': 'نالو لکو، مثال: انبو يا ٽماٽا',
  'common.allCategories': 'سڀ',
  'common.inSeasonNow': 'موسم ۾',
  'common.inSeasonFilter': 'فقط موسم وارا',
  'common.clearFilters': 'فلٽر ختم ڪريو',
  'common.noResults': 'ڪجھ به نه مليو',
  'common.noResultsHint': 'ننڍو لفظ لکي ڏسو، يا فلٽر ختم ڪريو.',
  'common.showingCount': '{total} مان {count} ڏيکاريل',
  'common.copy': 'نمبر ڪاپي ڪريو',
  'common.copied': 'ڪاپي ٿي ويو',
  'common.language': 'ٻولي',

  // AI assistant
  'chat.open': 'اي آءِ مددگار کوليو',
  'chat.title': 'اي آءِ مددگار',
  'chat.close': 'مددگار بند ڪريو',
  'chat.placeholder': 'ميون، ڀاڄين يا منڊي بابت پڇو…',
  'chat.send': 'پيغام موڪليو',
  'chat.thinking': 'مددگار لکي رهيو آهي',
  'chat.greeting':
    'السلام عليڪم! مون کان ميون، ڀاڄين يا منڊي بابت پڇو. اڄوڪي ريٽ ۽ آرڊر لاءِ مهرباني ڪري واٽس ايپ تي پيغام موڪليو.',
  'chat.disclaimer': 'اي آءِ جا جواب غلط به ٿي سگهن ٿا. هي موجوده قيمتون يا اسٽاڪ نٿو ڏسي سگهي.',
  'chat.offline':
    'مددگار اڃا شروع نه ٿيو آهي — ڪو API ڪيئي سيٽ نه ٿيو آهي. مهرباني ڪري واٽس ايپ تي رابطو ڪريو.',

  // Shop
  'shop.add': 'شامل ڪريو',
  'shop.packSize': 'پيڪ جي ماپ',
  'shop.increase': 'تعداد وڌايو',
  'shop.decrease': 'تعداد گھٽايو',
  'shop.priceOnRequest': 'قيمت پڇو',

  // Basket
  'cart.title': 'توهان جي ٽوڪري',
  'cart.short': 'ٽوڪري',
  'cart.open': 'ٽوڪري کوليو',
  'cart.close': 'ٽوڪري بند ڪريو',
  'cart.empty': 'توهان جي ٽوڪري خالي آهي',
  'cart.emptyHint': 'ميوا ۽ ڀاڄيون شامل ڪريو، اهي هتي ڏيکاربيون.',
  'cart.subtotal': 'ڪل رقم',
  'cart.checkout': 'واٽس ايپ تي آرڊر موڪليو',
  'cart.clear': 'ٽوڪري خالي ڪريو',
  'cart.remove': 'هٽايو',
  'cart.continue': 'خريداري جاري رکو',
  'cart.note':
    'هي توهان جي ٽوڪري واٽس ايپ پيغام طور اسان ڏانهن موڪليندو. هتي ڪا به ادائگي نه ٿيندي — اسان اڄوڪو ريٽ ۽ دستيابي پڪ ڪنداسين.',
  'cart.itemCount': '{count} شيون',

  // Placeholder price notice
  'banner.placeholderPrices':
    'نموني وارا ريٽ. ڏيکاريل قيمتون سيٽ اپ لاءِ نموني طور آهن ۽ کُهڙا فروٽ ڪمپني جا اصل ريٽ ناهن — اڄوڪي ريٽ لاءِ اسان کي پيغام موڪليو.',
  'banner.dismiss': 'بند ڪريو',

  // Hero carousel
  'hero.label': 'نمايان',
  'hero.prev': 'پوئين سلائيڊ',
  'hero.next': 'اڳيين سلائيڊ',
  'hero.goTo': 'سلائيڊ {n} تي وڃو',
  'hero.guavaTitle': 'لاڙڪاڻي جو ڳدرو',
  'hero.guavaSub': 'ڳدرو، سبزي منڊي، لاڙڪاڻي ۾ درجي بندي سان پيتين ۾ وڪامندو.',
  'hero.guavaCta': 'ميوا ڏسو',
  'hero.s1Title': 'لاڙڪاڻي کان تازا ميوا ۽ ڀاڄيون',
  'hero.s1Sub':
    'کُهڙا فروٽ ڪمپني — سبزي منڊي، لاڙڪاڻو، سنڌ ۾ سبزي فروٽ ڪميشن ايجنٽ.',
  'hero.s1Cta': 'هاڻي خريد ڪريو',
  'hero.s2Title': 'روزانو تازيون ڀاڄيون',
  'hero.s2Sub': 'پٽاٽا، بصر، ٽماٽا، ڪدو قسم، پَنَ واريون ڀاڄيون ۽ پاڙون.',
  'hero.s2Cta': 'ڀاڄيون ڏسو',
  'hero.s3Title': 'منڊي جا موسمي ميوا',
  'hero.s3Sub': 'انبو، کجور، ڳدرو، ڦوٽ ۽ نارنگي، موسم موجب.',
  'hero.s3Cta': 'ميوا ڏسو',
  'hero.s4Title': 'واٽس ايپ تي آرڊر ڪريو',
  'hero.s4Sub': 'پنهنجي ٽوڪري ٺاهيو ۽ هڪ پيغام ۾ اسان ڏانهن موڪليو.',
  'hero.s4Cta': 'پيغام موڪليو',

  // Home
  'home.shopByCategory': 'قسم موجب خريداري',
  'home.inSeasonTitle': 'هن وقت موسم ۾',
  'home.fruitsTitle': 'تازا ميوا',
  'home.vegetablesTitle': 'تازيون ڀاڄيون',
  'home.seeMore': 'وڌيڪ ڏسو',
  'home.info1Title': 'سبزي منڊي، لاڙڪاڻو',
  'home.info1Body': 'اسان لاڙڪاڻي، سنڌ جي منڊي ۾ ڪم ڪريون ٿا.',
  'home.info2Title': 'واٽس ايپ تي آرڊر',
  'home.info2Body': 'پنهنجي ٽوڪري ٺاهيو ۽ هڪ پيغام ۾ موڪليو.',
  'home.info3Title': 'انگريزي ۽ سنڌي',
  'home.info3Body': 'سڄو شاپ ٻنهي ٻولين ۾ ڏسو.',

  // Shop pages
  'cat.fruitsTitle': 'ميوا',
  'cat.vegetablesTitle': 'ڀاڄيون',
  'cat.filterCategory': 'قسم',

  // About
  'about.title': 'کُهڙا فروٽ ڪمپني بابت',
  'about.subtitle': 'لاڙڪاڻي، سنڌ جي سبزي فروٽ مارڪيٽ ۾ سبزي فروٽ ڪميشن ايجنٽ.',
  'about.roleTitle': 'ڪميشن ايجنٽ ڇا ڪندو آهي',
  'about.roleBody':
    'ڪميشن ايجنٽ، يا آڙھتي، منڊي ۾ زميندار ۽ خريدار جي وچ ۾ بيهندو آهي. مال زميندار کان اچي ٿو، ايجنٽ اهو اڄوڪي منڊي ۾ وڪڻي ٿو، ۽ زميندار کي انهي وڪري جي حساب سان پيسا ملن ٿا. خريدار کي درجي بندي ٿيل مال ۽ هڪ ئي رابطو ملي ٿو؛ زميندار کي منڊي تائين رسائي ملي ٿي.',
  'about.factsTitle': 'هڪ نظر ۾',
  'about.fact.business': 'ڪاروبار',
  'about.fact.role': 'ڪم',
  'about.fact.location': 'جڳھ',
  'about.fact.languages': 'ٻوليون',
  'about.fact.languagesValue': 'انگريزي ۽ سنڌي',
  'about.honestyTitle': 'هي ويب سائيٽ ڪهڙي دعوي نه ڪندي',
  'about.honestyBody':
    'هي ويب سائيٽ اهي ميون ۽ ڀاڄين جا قسم ڏيکاري ٿي جن ۾ ڪاروبار ڪم ڪري ٿو. هي سائيٽ ڪاروبار جي شروعات جو سال، ڊليوري جو علائقو، زمين جي ملڪيت، سرٽيفڪيٽ يا گراهڪن جا رايا نه ٻڌائي ٿي، ڇاڪاڻ ته انهن جي مالڪ پاران تصديق نه ٿي آهي. قيمتون منڊي سان گڏ بدلجن ٿيون، تنهنڪري اسان هر آرڊر تي ريٽ جي تصديق ڪريون ٿا. ٻي ڪا ضرورت هجي ته فون تي پڇو.',
  'about.ctaTitle': 'ڪنهن شيءِ يا قيمت بابت سوال آهي؟',

  // Contact
  'contact.title': 'رابطو',
  'contact.subtitle': 'اسان کي ڪال ڪريو، يا واٽس ايپ تي پيغام موڪليو.',
  'contact.phonesTitle': 'فون',
  'contact.whatsappTitle': 'واٽس ايپ',
  'contact.whatsappBody': 'پنهنجي شيءِ ۽ مقدار موڪليو، اسان اڄوڪو ريٽ ٻڌائينداسين.',
  'contact.addressTitle': 'پتو',
  'contact.mapTitle': 'اسان کي ڳوليو',
  'contact.mapNote':
    'نقشو لاڙڪاڻي جي سبزي منڊي وارو علائقو ڏيکاري ٿو. دڪان جي بلڪل صحيح نشاندهي اڃا تصديق ٿيل ناهي، تنهنڪري منڊي کي نشاني طور استعمال ڪريو ۽ پهچي ڪال ڪريو.',
  'contact.hoursTitle': 'منڊي جو وقت',
  'contact.hoursBody': 'ڪاروبار جو وقت هن سائيٽ تي ڏنل ناهي. سفر کان اڳ مٿين نمبر تي ڪال ڪري تصديق ڪريو.',
  'contact.primary': 'مُک',

  // Not found
  'notFound.title': 'صفحو نه مليو',
  'notFound.body': 'اهو صفحو موجود ناهي. شاپ هيٺ ڏنل آهي.',
  'notFound.cta': 'مُک صفحي تي واپس',

  // Footer
  'footer.quickLinks': 'تڪڙا لنڪ',
  'footer.contactTitle': 'رابطو',
  'footer.findUs': 'اسان کي ڳوليو',
  'footer.rights': 'سڀ حق محفوظ آهن.',
  'footer.note': 'قيمتون منڊي سان گڏ بدلجن ٿيون. آرڊر موڪلڻ تي اسان اڄوڪو ريٽ ٻڌائينداسين.',

  // WhatsApp message bodies
  'msg.product':
    'السلام عليڪم، مان {product} جي اڄوڪي ريٽ ۽ دستيابي بابت پڇڻ چاهيان ٿو. مهرباني ڪري اڄوڪو ريٽ ۽ موجود مقدار موڪليو.',
  'msg.general':
    'السلام عليڪم، مان کُهڙا فروٽ ڪمپني کان اڄوڪي ريٽ ۽ دستيابي بابت پڇڻ چاهيان ٿو.',

  // Months
  'month.1': 'جنوري',
  'month.2': 'فيبروري',
  'month.3': 'مارچ',
  'month.4': 'اپريل',
  'month.5': 'مئي',
  'month.6': 'جون',
  'month.7': 'جولاءِ',
  'month.8': 'آگسٽ',
  'month.9': 'سيپٽمبر',
  'month.10': 'آڪٽوبر',
  'month.11': 'نومبر',
  'month.12': 'ڊسمبر',
};

export const TRANSLATIONS: Record<Lang, Record<TranslationKey, string>> = {
  en: EN,
  sd: SD,
};
