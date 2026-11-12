/**
 * Verified business facts for Khuhra Fruit Company.
 *
 * Everything in this file came from the business card supplied by the owner. Nothing here is
 * inferred: there are no delivery areas, no founding year, no certifications and no farm claims,
 * because none were provided. Add to this file only what the owner has confirmed.
 */

export interface PhoneNumber {
  /** As printed on the card, for display. */
  readonly display: string;
  /** International form, for tel: links. */
  readonly tel: string;
  readonly isWhatsApp: boolean;
}

export const BUSINESS = {
  nameEn: 'Khuhra Fruit Company',
  nameSd: 'کُهڙا فروٽ ڪمپني',

  taglineEn: 'Sabzi Fruit Commission Agent',
  taglineSd: 'سبزي فروٽ ڪميشن ايجنٽ',

  addressEn: 'Sabzi Mandi, Larkana, Sindh, Pakistan',
  addressSd: 'سبزي منڊي، لاڙڪاڻو، سنڌ، پاڪستان',

  marketEn: 'Sabzi Fruit Market, Larkana',
  marketSd: 'سبزي فروٽ مارڪيٽ، لاڙڪاڻو',

  cityEn: 'Larkana',
  citySd: 'لاڙڪاڻو',

  phones: [
    { display: '0311-1476412', tel: '+923111476412', isWhatsApp: false },
    { display: '0331-3154225', tel: '+923313154225', isWhatsApp: true },
  ] as readonly PhoneNumber[],

  whatsApp: {
    display: '0331-3154225',
    tel: '+923313154225',
    /** wa.me takes the number without a plus or separators. */
    waNumber: '923313154225',
    link: 'https://wa.me/923313154225',
  },

  maps: {
    /**
     * A market-area search, not a confirmed shop pin. The copy next to the map says so, and this
     * should be replaced with the exact place URL once the owner confirms the pin.
     */
    searchUrl:
      'https://www.google.com/maps/search/?api=1&query=Khuhra+Fruit+Company%2C+Sabzi+Mandi%2C+Larkana%2C+Sindh%2C+Pakistan',
    directionsUrl:
      'https://www.google.com/maps/dir/?api=1&destination=Khuhra+Fruit+Company%2C+Sabzi+Mandi%2C+Larkana%2C+Sindh%2C+Pakistan',
    /** Keyless embed form, so the footer map needs no Google Maps API key. */
    embedUrl:
      'https://www.google.com/maps?q=Khuhra+Fruit+Company%2C+Sabzi+Mandi%2C+Larkana%2C+Sindh%2C+Pakistan&output=embed',
  },
} as const;

/** The market this site quotes rates for. */
export const PRIMARY_MARKET = 'Larkana';
