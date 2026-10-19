export type CommodityCategory =
  | 'Cereals'
  | 'Pulses'
  | 'Oilseeds'
  | 'Vegetables'
  | 'Spices'
  | 'Fruits'
  | 'Cash Crops';

export interface CommodityImageRecord {
  key: string;
  name: string;
  category: CommodityCategory;
  aliases: string[];
  emoji: string;
  imagePath: string;
  imageUrl?: string;
}

export const COMMODITY_IMAGE_DATASET: CommodityImageRecord[] = [
  { key: 'rice', name: 'Rice', category: 'Cereals', aliases: ['rice', 'paddy', 'raw rice', 'rice grain', 'arisi', 'nel'], emoji: '🌾', imagePath: '/images/commodities/rice.jpg', imageUrl: 'https://images.unsplash.com/photo-1705147271933-5c7052f15a90?auto=format&fit=crop&w=1200&q=85' },
  { key: 'wheat', name: 'Wheat', category: 'Cereals', aliases: ['wheat', 'wheat grain', 'gehun', 'godhumai'], emoji: '🌾', imagePath: '/images/commodities/wheat.jpg' },
  { key: 'banana', name: 'Banana', category: 'Fruits', aliases: ['banana', 'vazhai pazham', 'kela'], emoji: '🍌', imagePath: '/images/commodities/banana.jpg', imageUrl: 'https://images.unsplash.com/photo-1528279335935-f486951a6adf?auto=format&fit=crop&w=1200&q=85' },
  { key: 'maize', name: 'Maize', category: 'Cereals', aliases: ['maize', 'corn', 'maize grain', 'makkacholam'], emoji: '🌽', imagePath: '/images/commodities/maize.jpg' },
  { key: 'bajra', name: 'Pearl Millet', category: 'Cereals', aliases: ['bajra', 'pearl millet', 'kambu'], emoji: '🌾', imagePath: '/images/commodities/bajra.jpg' },
  { key: 'jowar', name: 'Sorghum', category: 'Cereals', aliases: ['jowar', 'sorghum', 'cholam'], emoji: '🌾', imagePath: '/images/commodities/jowar.jpg' },
  { key: 'ragi', name: 'Finger Millet', category: 'Cereals', aliases: ['ragi', 'finger millet', 'kezhvaragu'], emoji: '🌾', imagePath: '/images/commodities/ragi.jpg' },
  { key: 'chana', name: 'Chickpea', category: 'Pulses', aliases: ['chana', 'gram', 'bengal gram', 'chickpea', 'kondakadalai'], emoji: '🫘', imagePath: '/images/commodities/chana.jpg' },
  { key: 'tur', name: 'Arhar Dal', category: 'Pulses', aliases: ['arhar', 'tur', 'toor', 'red gram', 'thuvaram paruppu', 'pigeon pea'], emoji: '🫘', imagePath: '/images/commodities/tur.jpg' },
  { key: 'moong', name: 'Green Gram', category: 'Pulses', aliases: ['moong', 'green gram', 'mung bean', 'paasi payaru'], emoji: '🫘', imagePath: '/images/commodities/moong.jpg' },
  { key: 'urad', name: 'Black Gram', category: 'Pulses', aliases: ['urad', 'black gram', 'ulundhu'], emoji: '🫘', imagePath: '/images/commodities/urad.jpg' },
  { key: 'masoor', name: 'Red Lentil', category: 'Pulses', aliases: ['masoor', 'red lentil', 'lentil'], emoji: '🫘', imagePath: '/images/commodities/masoor.jpg' },
  { key: 'groundnut', name: 'Groundnut', category: 'Oilseeds', aliases: ['groundnut', 'peanut', 'verkadalai'], emoji: '🥜', imagePath: '/images/commodities/groundnut.jpg' },
  { key: 'mustard', name: 'Mustard Seed', category: 'Oilseeds', aliases: ['mustard', 'mustard seed', 'sarson'], emoji: '🌱', imagePath: '/images/commodities/mustard.jpg' },
  { key: 'soybean', name: 'Soybean', category: 'Oilseeds', aliases: ['soybean', 'soya', 'soy bean'], emoji: '🫘', imagePath: '/images/commodities/soybean.jpg' },
  { key: 'sunflower', name: 'Sunflower Seed', category: 'Oilseeds', aliases: ['sunflower', 'sunflower seed'], emoji: '🌻', imagePath: '/images/commodities/sunflower.jpg' },
  { key: 'sesame', name: 'Sesame Seed', category: 'Oilseeds', aliases: ['sesame', 'gingelly', 'ellu', 'til'], emoji: '🌱', imagePath: '/images/commodities/sesame.jpg' },
  { key: 'onion', name: 'Onion', category: 'Vegetables', aliases: ['onion', 'vengayam', 'pyaz'], emoji: '🧅', imagePath: '/images/commodities/onion.jpg', imageUrl: 'https://images.unsplash.com/photo-1668295037469-8b0e8d11cd2a?auto=format&fit=crop&w=1200&q=85' },
  { key: 'tomato', name: 'Tomato', category: 'Vegetables', aliases: ['tomato', 'thakkali'], emoji: '🍅', imagePath: '/images/commodities/tomato.jpg', imageUrl: 'https://images.unsplash.com/photo-1467020323552-36f7bf0e30e6?auto=format&fit=crop&w=1200&q=85' },
  { key: 'potato', name: 'Potato', category: 'Vegetables', aliases: ['potato', 'urulai kizhangu', 'aloo'], emoji: '🥔', imagePath: '/images/commodities/potato.jpg', imageUrl: 'https://images.unsplash.com/photo-1603048719539-9ecb4aa395e3?auto=format&fit=crop&w=1200&q=85' },
  { key: 'brinjal', name: 'Brinjal', category: 'Vegetables', aliases: ['brinjal', 'eggplant', 'aubergine', 'kathirikai'], emoji: '🍆', imagePath: '/images/commodities/brinjal.jpg' },
  { key: 'okra', name: 'Okra', category: 'Vegetables', aliases: ['okra', 'lady finger', 'vendakkai', 'bhindi'], emoji: '🥬', imagePath: '/images/commodities/okra.jpg' },
  { key: 'cabbage', name: 'Cabbage', category: 'Vegetables', aliases: ['cabbage'], emoji: '🥬', imagePath: '/images/commodities/cabbage.jpg' },
  { key: 'cauliflower', name: 'Cauliflower', category: 'Vegetables', aliases: ['cauliflower'], emoji: '🥦', imagePath: '/images/commodities/cauliflower.jpg' },
  { key: 'carrot', name: 'Carrot', category: 'Vegetables', aliases: ['carrot'], emoji: '🥕', imagePath: '/images/commodities/carrot.jpg' },
  { key: 'green_chilli', name: 'Green Chilli', category: 'Vegetables', aliases: ['green chilli', 'green chili', 'chilli', 'chili', 'milagai'], emoji: '🌶️', imagePath: '/images/commodities/green_chilli.jpg' },
  { key: 'garlic', name: 'Garlic', category: 'Vegetables', aliases: ['garlic', 'poondu', 'lahsun'], emoji: '🧄', imagePath: '/images/commodities/garlic.jpg' },
  { key: 'ginger', name: 'Ginger', category: 'Spices', aliases: ['ginger', 'inji', 'adrak'], emoji: '🫚', imagePath: '/images/commodities/ginger.jpg' },
  { key: 'turmeric', name: 'Turmeric', category: 'Spices', aliases: ['turmeric', 'haldi', 'manjal'], emoji: '🟠', imagePath: '/images/commodities/turmeric.jpg' },
  { key: 'red_chilli', name: 'Red Chilli', category: 'Spices', aliases: ['red chilli', 'red chili', 'dry chilli', 'dry chili'], emoji: '🌶️', imagePath: '/images/commodities/red_chilli.jpg', imageUrl: 'https://images.unsplash.com/photo-1783067893308-d77e435bfe14?auto=format&fit=crop&w=1200&q=85' },
  { key: 'coriander', name: 'Coriander Seed', category: 'Spices', aliases: ['coriander seed', 'coriander', 'dhania', 'kothamalli seed'], emoji: '🌿', imagePath: '/images/commodities/coriander.jpg' },
  { key: 'cumin', name: 'Cumin Seed', category: 'Spices', aliases: ['cumin', 'jeera'], emoji: '🌿', imagePath: '/images/commodities/cumin.jpg' },
  { key: 'banana', name: 'Banana', category: 'Fruits', aliases: ['banana', 'vazhai pazham', 'kela'], emoji: '🍌', imagePath: '/images/commodities/banana.jpg' },
  { key: 'mango', name: 'Mango', category: 'Fruits', aliases: ['mango', 'maampazham', 'aam'], emoji: '🥭', imagePath: '/images/commodities/mango.jpg' },
  { key: 'grapes', name: 'Grapes', category: 'Fruits', aliases: ['grapes', 'draksha'], emoji: '🍇', imagePath: '/images/commodities/grapes.jpg' },
  { key: 'orange', name: 'Orange', category: 'Fruits', aliases: ['orange', 'santra'], emoji: '🍊', imagePath: '/images/commodities/orange.jpg' },
  { key: 'papaya', name: 'Papaya', category: 'Fruits', aliases: ['papaya', 'pappali'], emoji: '🍈', imagePath: '/images/commodities/papaya.jpg' },
  { key: 'watermelon', name: 'Watermelon', category: 'Fruits', aliases: ['watermelon', 'tharpoosani'], emoji: '🍉', imagePath: '/images/commodities/watermelon.jpg' },
  { key: 'coconut', name: 'Coconut', category: 'Fruits', aliases: ['coconut', 'thengai'], emoji: '🥥', imagePath: '/images/commodities/coconut.jpg' },
  { key: 'sugarcane', name: 'Sugarcane', category: 'Cash Crops', aliases: ['sugarcane', 'karumbu'], emoji: '🎋', imagePath: '/images/commodities/sugarcane.jpg' },
  { key: 'cotton', name: 'Cotton', category: 'Cash Crops', aliases: ['cotton', 'kapas'], emoji: '☁️', imagePath: '/images/commodities/cotton.jpg' },
  { key: 'coffee', name: 'Coffee', category: 'Cash Crops', aliases: ['coffee bean', 'coffee beans', 'coffee'], emoji: '🫘', imagePath: '/images/commodities/coffee.jpg' },
  { key: 'tea', name: 'Tea', category: 'Cash Crops', aliases: ['tea leaves', 'tea'], emoji: '🍃', imagePath: '/images/commodities/tea.jpg' },
];

function normalizeCommodityName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

const aliasIndex = new Map<string, CommodityImageRecord>();
for (const record of COMMODITY_IMAGE_DATASET) {
  aliasIndex.set(normalizeCommodityName(record.name), record);
  aliasIndex.set(normalizeCommodityName(record.key.replace(/_/g, ' ')), record);
  for (const alias of record.aliases) aliasIndex.set(normalizeCommodityName(alias), record);
}

export function resolveCommodityImageRecord(...candidates: Array<string | null | undefined>): CommodityImageRecord | null {
  for (const candidate of candidates) {
    const normalized = normalizeCommodityName(candidate || '');
    if (!normalized) continue;
    const exact = aliasIndex.get(normalized);
    if (exact) return exact;
    // Only match whole-word aliases; do not let "green chilli" resolve to chilli
    // inside an unrelated commodity name.
    for (const record of COMMODITY_IMAGE_DATASET) {
      if (record.aliases.some((alias) => {
        const normalizedAlias = normalizeCommodityName(alias);
        return normalizedAlias.length >= 4 && ` ${normalized} `.includes(` ${normalizedAlias} `);
      })) return record;
    }
  }
  return null;
}

export function getCommodityImagePath(...candidates: Array<string | null | undefined>): string | null {
  return resolveCommodityImageRecord(...candidates)?.imagePath || null;
}
