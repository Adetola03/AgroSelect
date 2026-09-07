/* ==========================================================================
   AgroSelect — crop dataset
   --------------------------------------------------------------------------
   SOURCED FIGURES (price, yield, cost, revenue, return) come from the NAERLS
   Agricultural Performance Survey of the 2024 Wet Season in Nigeria, using
   North-West values. Market prices are July 2024. Where no comparable
   North-West price exists the figure is `null` and the site prints
   "Unavailable" rather than inventing a number.

   GUIDANCE FIELDS (`water`, `startupLoad`, `notes`) are general agronomic
   guidance, not NAERLS figures. Everything that renders them is labelled as
   guidance so the two are never confused.
   ========================================================================== */

window.AGRO_CROPS = [
  {
    id: 'maize',
    name: 'Maize',
    blurb: 'The region’s staple cereal. Reliable demand, but the highest input bill on this list.',
    pricePerKg: 858,
    yieldMtHa: 2.50,
    costPerHa: 990666,
    revenuePerHa: 2147684,
    returnPerHa: 1157018,
    planting: 'May–June',
    harvest: 'About 3–4 months',
    risks: 'Fall armyworm, stem borers, drought or dry spells, and flooding.',
    water: 'Rain-fed',
    startupLoad: 'high',
    notes: 'Widely grown across all seven states, so seed, agro-chemicals and buyers are easy to find.'
  },
  {
    id: 'rice',
    name: 'Rice',
    blurb: 'The strongest indicative return in the dataset — if you can manage water and flood risk.',
    pricePerKg: 1433,
    yieldMtHa: 2.12,
    costPerHa: 599250,
    revenuePerHa: 3035819,
    returnPerHa: 2436569,
    planting: 'Rainy season; irrigation can extend the window',
    harvest: 'About 3–5 months',
    risks: 'Flooding, rice blast, and weeds.',
    water: 'Needs reliable water or irrigation',
    startupLoad: 'medium',
    notes: 'Returns depend heavily on water control and on getting the crop milled or sold well.'
  },
  {
    id: 'sorghum',
    name: 'Sorghum',
    blurb: 'Hardy in dry conditions, with the smallest indicative return of the priced crops.',
    pricePerKg: 845,
    yieldMtHa: 1.20,
    costPerHa: 560000,
    revenuePerHa: 1018188,
    returnPerHa: 458188,
    planting: 'May–June',
    harvest: 'About 3–5 months',
    risks: 'Drought, stem borers, birds, and crop diseases.',
    water: 'Drought-tolerant',
    startupLoad: 'medium',
    notes: 'Copes with poorer soils and shorter rains better than maize.'
  },
  {
    id: 'millet',
    name: 'Millet',
    blurb: 'The most drought-tolerant cereal here. Modest cost, modest return.',
    pricePerKg: 837,
    yieldMtHa: 1.21,
    costPerHa: 496000,
    revenuePerHa: 1011331,
    returnPerHa: 515331,
    planting: 'May–June',
    harvest: 'About 3–4 months',
    risks: 'Drought, pests, birds, and crop diseases.',
    water: 'Drought-tolerant',
    startupLoad: 'low',
    notes: 'Often the safest cereal where rainfall is short or unreliable.'
  },
  {
    id: 'cowpea',
    name: 'Cowpea',
    blurb: 'A high price per kilo on a low input bill, and it puts nitrogen back in the soil.',
    pricePerKg: 1755,
    yieldMtHa: 0.92,
    costPerHa: 460000,
    revenuePerHa: 1607146,
    returnPerHa: 1147146,
    planting: 'Early/mid rainy season',
    harvest: 'About 2–4 months',
    risks: 'Pod borer, aphids, drought, and excessive rainfall.',
    water: 'Rain-fed',
    startupLoad: 'low',
    notes: 'Shortest time to harvest on this list, and a legume, so it helps the following season’s soil.'
  },
  {
    id: 'groundnut',
    name: 'Groundnut',
    blurb: 'The lowest production cost of any priced crop here, with a strong indicative return.',
    pricePerKg: 1640,
    yieldMtHa: 1.01,
    costPerHa: 386666,
    revenuePerHa: 1655332,
    returnPerHa: 1268666,
    planting: 'May–June',
    harvest: 'About 3–5 months',
    risks: 'Diseases, insect pests, drought, and poor seed quality.',
    water: 'Rain-fed',
    startupLoad: 'low',
    notes: 'Seed quality makes a large difference to the result; a legume, so it also benefits the soil.'
  },
  {
    id: 'soybean',
    name: 'Soybean',
    blurb: 'Low production cost, but no comparable North-West July 2024 price, so return cannot be shown.',
    pricePerKg: null,
    yieldMtHa: 0.96,
    costPerHa: 300000,
    revenuePerHa: null,
    returnPerHa: null,
    planting: 'May–June',
    harvest: 'About 3–5 months',
    risks: 'Insect pests, diseases, drought, and moisture stress.',
    water: 'Rain-fed',
    startupLoad: 'low',
    notes: 'Confirm a buyer and a price locally before committing land to it.'
  },
  {
    id: 'sesame',
    name: 'Sesame (Benniseed)',
    shortName: 'Sesame',
    blurb: 'Mainly an export crop. No comparable North-West July 2024 price in the dataset.',
    pricePerKg: null,
    yieldMtHa: 0.94,
    costPerHa: 500000,
    revenuePerHa: null,
    returnPerHa: null,
    planting: 'June–July',
    harvest: 'About 3–4 months',
    risks: 'Insect pests, diseases, drought, and excessive rainfall.',
    water: 'Drought-tolerant',
    startupLoad: 'medium',
    notes: 'Prices are driven by export buyers, so check the going rate with local aggregators.'
  }
];

window.AGRO_STATES = [
  { value: 'jigawa',  label: 'Jigawa'  },
  { value: 'kaduna',  label: 'Kaduna'  },
  { value: 'kano',    label: 'Kano'    },
  { value: 'katsina', label: 'Katsina' },
  { value: 'kebbi',   label: 'Kebbi'   },
  { value: 'sokoto',  label: 'Sokoto'  },
  { value: 'zamfara', label: 'Zamfara' }
];

window.AGRO_META = {
  source: 'NAERLS Agricultural Performance Survey of the 2024 Wet Season in Nigeria',
  sourceUrl: 'https://naerls.gov.ng/reports/',
  priceDate: 'July 2024',
  region: 'North-West Nigeria — Jigawa, Kaduna, Kano, Katsina, Kebbi, Sokoto and Zamfara'
};
