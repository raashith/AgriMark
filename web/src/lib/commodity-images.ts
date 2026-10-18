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
  { key: 'rice', name: 'Rice', category: 'Cereals', aliases: ['rice', 'paddy', 'raw rice', 'rice grain', 'arisi', 'nel'], emoji: '🌾', imagePath: '/images/commodities/rice.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Basmati_Rice_India%2C_raw.jpg?width=1200' },
  { key: 'wheat', name: 'Wheat', category: 'Cereals', aliases: ['wheat', 'wheat grain', 'gehun', 'godhumai'], emoji: '🌾', imagePath: '/images/commodities/wheat.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Wheat_close-up.JPG?width=1200' },
  { key: 'maize', name: 'Maize', category: 'Cereals', aliases: ['maize', 'corn', 'maize grain', 'makkacholam'], emoji: '🌽', imagePath: '/images/commodities/maize.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Corncobs.jpg?width=1200' },
  { key: 'bajra', name: 'Pearl Millet', category: 'Cereals', aliases: ['bajra', 'pearl millet', 'kambu'], emoji: '🌾', imagePath: '/images/commodities/bajra.jpg' },
  { key: 'jowar', name: 'Sorghum', category: 'Cereals', aliases: ['jowar', 'sorghum', 'cholam'], emoji: '🌾', imagePath: '/images/commodities/jowar.jpg' },
  { key: 'ragi', name: 'Finger Millet', category: 'Cereals', aliases: ['ragi', 'finger millet', 'kezhvaragu'], emoji: '🌾', imagePath: '/images/commodities/ragi.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Finger_millet.jpg?width=1200' },
  { key: 'chana', name: 'Chickpea', category: 'Pulses', aliases: ['chana', 'gram', 'bengal gram', 'chickpea', 'kondakadalai'], emoji: '🫘', imagePath: '/images/commodities/chana.jpg' },
  { key: 'tur', name: 'Arhar Dal', category: 'Pulses', aliases: ['arhar', 'tur', 'toor', 'red gram', 'thuvaram paruppu', 'pigeon pea'], emoji: '🫘', imagePath: '/images/commodities/tur.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pigeon_pea.jpg?width=1200' },
  { key: 'moong', name: 'Green Gram', category: 'Pulses', aliases: ['moong', 'green gram', 'mung bean', 'paasi payaru'], emoji: '🫘', imagePath: '/images/commodities/moong.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mung_beans.jpg?width=1200' },
  { key: 'urad', name: 'Black Gram', category: 'Pulses', aliases: ['urad', 'black gram', 'ulundhu'], emoji: '🫘', imagePath: '/images/commodities/urad.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Black_gram.jpg?width=1200' },
  { key: 'masoor', name: 'Red Lentil', category: 'Pulses', aliases: ['masoor', 'red lentil', 'lentil'], emoji: '🫘', imagePath: '/images/commodities/masoor.jpg' },
  { key: 'groundnut', name: 'Groundnut', category: 'Oilseeds', aliases: ['groundnut', 'peanut', 'verkadalai'], emoji: '🥜', imagePath: '/images/commodities/groundnut.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Peanuts.jpg?width=1200' },
  { key: 'mustard', name: 'Mustard Seed', category: 'Oilseeds', aliases: ['mustard', 'mustard seed', 'sarson'], emoji: '🌱', imagePath: '/images/commodities/mustard.jpg' },
  { key: 'soybean', name: 'Soybean', category: 'Oilseeds', aliases: ['soybean', 'soya', 'soy bean'], emoji: '🫘', imagePath: '/images/commodities/soybean.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Soybeans.jpg?width=1200' },
  { key: 'sunflower', name: 'Sunflower Seed', category: 'Oilseeds', aliases: ['sunflower', 'sunflower seed'], emoji: '🌻', imagePath: '/images/commodities/sunflower.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sunflower_seeds.jpg?width=1200' },
  { key: 'sesame', name: 'Sesame Seed', category: 'Oilseeds', aliases: ['sesame', 'gingelly', 'ellu', 'til'], emoji: '🌱', imagePath: '/images/commodities/sesame.jpg' },
  { key: 'onion', name: 'Onion', category: 'Vegetables', aliases: ['onion', 'vengayam', 'pyaz'], emoji: '🧅', imagePath: '/images/commodities/onion.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Onion.jpg?width=1200' },
  { key: 'tomato', name: 'Tomato', category: 'Vegetables', aliases: ['tomato', 'thakkali'], emoji: '🍅', imagePath: '/images/commodities/tomato.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Vegetable_tomatoes.jpg?width=1200' },
  { key: 'potato', name: 'Potato', category: 'Vegetables', aliases: ['potato', 'urulai kizhangu', 'aloo'], emoji: '🥔', imagePath: '/images/commodities/potato.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Potatoes_in_Coop.jpg?width=1200' },
  { key: 'brinjal', name: 'Brinjal', category: 'Vegetables', aliases: ['brinjal', 'eggplant', 'aubergine', 'kathirikai'], emoji: '🍆', imagePath: '/images/commodities/brinjal.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Eggplant.jpg?width=1200' },
  { key: 'okra', name: 'Okra', category: 'Vegetables', aliases: ['okra', 'lady finger', 'vendakkai', 'bhindi'], emoji: '🥬', imagePath: '/images/commodities/okra.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Okra.jpg?width=1200' },
  { key: 'cabbage', name: 'Cabbage', category: 'Vegetables', aliases: ['cabbage'], emoji: '🥬', imagePath: '/images/commodities/cabbage.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cabbage.jpg?width=1200' },
  { key: 'cauliflower', name: 'Cauliflower', category: 'Vegetables', aliases: ['cauliflower'], emoji: '🥦', imagePath: '/images/commodities/cauliflower.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cauliflower.jpg?width=1200' },
  { key: 'carrot', name: 'Carrot', category: 'Vegetables', aliases: ['carrot'], emoji: '🥕', imagePath: '/images/commodities/carrot.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Carrots.jpg?width=1200' },
  { key: 'green_chilli', name: 'Green Chilli', category: 'Vegetables', aliases: ['green chilli', 'green chili', 'chilli', 'chili', 'milagai'], emoji: '🌶️', imagePath: '/images/commodities/green_chilli.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kashmiri_Green_Chillies.JPG?width=1200' },
  { key: 'garlic', name: 'Garlic', category: 'Vegetables', aliases: ['garlic', 'poondu', 'lahsun'], emoji: '🧄', imagePath: '/images/commodities/garlic.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Garlic.jpg?width=1200' },
  { key: 'ginger', name: 'Ginger', category: 'Spices', aliases: ['ginger', 'inji', 'adrak'], emoji: '🫚', imagePath: '/images/commodities/ginger.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ginger.jpg?width=1200' },
  { key: 'turmeric', name: 'Turmeric', category: 'Spices', aliases: ['turmeric', 'haldi', 'manjal'], emoji: '🟠', imagePath: '/images/commodities/turmeric.jpg' },
  { key: 'red_chilli', name: 'Red Chilli', category: 'Spices', aliases: ['red chilli', 'red chili', 'dry chilli', 'dry chili'], emoji: '🌶️', imagePath: '/images/commodities/red_chilli.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dried_Chilli.jpg?width=1200' },
  { key: 'coriander', name: 'Coriander Seed', category: 'Spices', aliases: ['coriander seed', 'coriander', 'dhania', 'kothamalli seed'], emoji: '🌿', imagePath: '/images/commodities/coriander.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Coriander_seeds.jpg?width=1200' },
  { key: 'cumin', name: 'Cumin Seed', category: 'Spices', aliases: ['cumin', 'jeera'], emoji: '🌿', imagePath: '/images/commodities/cumin.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cumin.jpg?width=1200' },
  { key: 'banana', name: 'Banana', category: 'Fruits', aliases: ['banana', 'vazhai pazham', 'kela'], emoji: '🍌', imagePath: '/images/commodities/banana.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Banana_Fruit.JPG?width=1200' },
  { key: 'mango', name: 'Mango', category: 'Fruits', aliases: ['mango', 'maampazham', 'aam'], emoji: '🥭', imagePath: '/images/commodities/mango.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mangoes.jpg?width=1200' },
  { key: 'grapes', name: 'Grapes', category: 'Fruits', aliases: ['grapes', 'draksha'], emoji: '🍇', imagePath: '/images/commodities/grapes.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Grapes.jpg?width=1200' },
  { key: 'orange', name: 'Orange', category: 'Fruits', aliases: ['orange', 'santra'], emoji: '🍊', imagePath: '/images/commodities/orange.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Oranges.jpg?width=1200' },
  { key: 'papaya', name: 'Papaya', category: 'Fruits', aliases: ['papaya', 'pappali'], emoji: '🍈', imagePath: '/images/commodities/papaya.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Papaya.jpg?width=1200' },
  { key: 'watermelon', name: 'Watermelon', category: 'Fruits', aliases: ['watermelon', 'tharpoosani'], emoji: '🍉', imagePath: '/images/commodities/watermelon.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Watermelon.jpg?width=1200' },
  { key: 'coconut', name: 'Coconut', category: 'Fruits', aliases: ['coconut', 'thengai'], emoji: '🥥', imagePath: '/images/commodities/coconut.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Coconut.jpg?width=1200' },
  { key: 'sugarcane', name: 'Sugarcane', category: 'Cash Crops', aliases: ['sugarcane', 'karumbu'], emoji: '🎋', imagePath: '/images/commodities/sugarcane.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sugarcane.jpg?width=1200' },
  { key: 'cotton', name: 'Cotton', category: 'Cash Crops', aliases: ['cotton', 'kapas'], emoji: '☁️', imagePath: '/images/commodities/cotton.jpg' },
  { key: 'coffee', name: 'Coffee', category: 'Cash Crops', aliases: ['coffee bean', 'coffee beans', 'coffee'], emoji: '🫘', imagePath: '/images/commodities/coffee.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Coffee_beans.jpg?width=1200' },
  { key: 'tea', name: 'Tea', category: 'Cash Crops', aliases: ['tea leaves', 'tea'], emoji: '🍃', imagePath: '/images/commodities/tea.jpg', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tea_leaves.jpg?width=1200' },
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
