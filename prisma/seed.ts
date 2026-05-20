import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const notes = [
  // Citrus
  { name: "Bergamot", family: "citrus" },
  { name: "Lemon", family: "citrus" },
  { name: "Grapefruit", family: "citrus" },
  { name: "Orange", family: "citrus" },
  { name: "Mandarin", family: "citrus" },
  { name: "Lime", family: "citrus" },
  { name: "Neroli", family: "citrus" },
  { name: "Yuzu", family: "citrus" },
  // Floral
  { name: "Rose", family: "floral" },
  { name: "Jasmine", family: "floral" },
  { name: "Lily of the Valley", family: "floral" },
  { name: "Iris", family: "floral" },
  { name: "Peony", family: "floral" },
  { name: "Violet", family: "floral" },
  { name: "Magnolia", family: "floral" },
  { name: "Tuberose", family: "floral" },
  { name: "Ylang-Ylang", family: "floral" },
  { name: "Gardenia", family: "floral" },
  // Woody
  { name: "Sandalwood", family: "woody" },
  { name: "Cedar", family: "woody" },
  { name: "Vetiver", family: "woody" },
  { name: "Oud", family: "woody" },
  { name: "Patchouli", family: "woody" },
  { name: "Guaiac Wood", family: "woody" },
  { name: "Birch", family: "woody" },
  { name: "Amber Wood", family: "woody" },
  // Fresh / Aquatic
  { name: "Sea Salt", family: "aquatic" },
  { name: "Ambergris", family: "aquatic" },
  { name: "Ozonic Notes", family: "aquatic" },
  { name: "Aquatic Notes", family: "aquatic" },
  { name: "Marine Notes", family: "aquatic" },
  // Spicy
  { name: "Black Pepper", family: "spicy" },
  { name: "Cardamom", family: "spicy" },
  { name: "Cinnamon", family: "spicy" },
  { name: "Ginger", family: "spicy" },
  { name: "Clove", family: "spicy" },
  { name: "Pink Pepper", family: "spicy" },
  { name: "Saffron", family: "spicy" },
  { name: "Nutmeg", family: "spicy" },
  // Oriental / Amber
  { name: "Vanilla", family: "gourmand" },
  { name: "Benzoin", family: "resinous" },
  { name: "Labdanum", family: "resinous" },
  { name: "Tonka Bean", family: "gourmand" },
  { name: "Coumarin", family: "gourmand" },
  { name: "Amber", family: "oriental" },
  { name: "Incense", family: "oriental" },
  { name: "Frankincense", family: "resinous" },
  { name: "Myrrh", family: "resinous" },
  // Musky
  { name: "White Musk", family: "musky" },
  { name: "Clean Musk", family: "musky" },
  { name: "Cashmere", family: "musky" },
  { name: "Ambrette", family: "musky" },
  // Green / Herbal
  { name: "Basil", family: "herbal" },
  { name: "Mint", family: "herbal" },
  { name: "Lavender", family: "herbal" },
  { name: "Rosemary", family: "herbal" },
  { name: "Sage", family: "herbal" },
  { name: "Thyme", family: "herbal" },
  { name: "Grass", family: "green" },
  { name: "Tea", family: "green" },
  { name: "Fig Leaf", family: "green" },
  // Fruity
  { name: "Apple", family: "fruity" },
  { name: "Peach", family: "fruity" },
  { name: "Pear", family: "fruity" },
  { name: "Blackberry", family: "fruity" },
  { name: "Raspberry", family: "fruity" },
  { name: "Plum", family: "fruity" },
  { name: "Mango", family: "fruity" },
  { name: "Pineapple", family: "fruity" },
  // Earthy / Leather
  { name: "Leather", family: "leather" },
  { name: "Tobacco", family: "leather" },
  { name: "Suede", family: "leather" },
  { name: "Oakmoss", family: "earthy" },
  { name: "Treemoss", family: "earthy" },
  { name: "Musk", family: "musky" },
];

const sampleFragrances = [
  {
    name: "Sauvage",
    brand: "Dior",
    year: 2015,
    concentration: "EDP",
    description:
      "A radically fresh composition, both raw and noble. Wild at heart. An open sky above the Sauvage lands.",
    season: JSON.stringify(["spring", "fall"]),
    timeOfDay: JSON.stringify(["day", "night"]),
    occasion: JSON.stringify(["casual", "office"]),
    accords: JSON.stringify(["fresh spicy", "woody", "citrus", "musky"]),
    rating: 9.0,
    sillage: 4.0,
    projection: 4.5,
    longevity: 9,
    bottleShape: "rectangular",
    bottleVolume: 100,
    owned: true,
    notes: [
      { name: "Bergamot", layer: "top" },
      { name: "Pink Pepper", layer: "top" },
      { name: "Lavender", layer: "heart" },
      { name: "Vetiver", layer: "base" },
      { name: "Ambrette", layer: "base" },
      { name: "Cedar", layer: "base" },
    ],
  },
  {
    name: "Bleu de Chanel",
    brand: "Chanel",
    year: 2010,
    concentration: "EDP",
    description:
      "An ode to masculine freedom. A fresh, clean, and profoundly sensual woody fragrance.",
    season: JSON.stringify(["spring", "fall", "winter"]),
    timeOfDay: JSON.stringify(["day", "night"]),
    occasion: JSON.stringify(["formal", "office", "date"]),
    accords: JSON.stringify(["citrus", "woody", "aromatic", "fresh"]),
    rating: 8.5,
    sillage: 3.5,
    projection: 3.5,
    longevity: 8,
    bottleShape: "round",
    bottleVolume: 100,
    owned: true,
    notes: [
      { name: "Lemon", layer: "top" },
      { name: "Grapefruit", layer: "top" },
      { name: "Mint", layer: "top" },
      { name: "Ginger", layer: "top" },
      { name: "Jasmine", layer: "heart" },
      { name: "Nutmeg", layer: "heart" },
      { name: "Sandalwood", layer: "base" },
      { name: "Cedar", layer: "base" },
      { name: "Vetiver", layer: "base" },
      { name: "White Musk", layer: "base" },
    ],
  },
  {
    name: "Black Orchid",
    brand: "Tom Ford",
    year: 2006,
    concentration: "EDP",
    description:
      "A luxurious and sensual fragrance of rich, dark accords and an alluring potion of black orchids.",
    season: JSON.stringify(["fall", "winter"]),
    timeOfDay: JSON.stringify(["night"]),
    occasion: JSON.stringify(["date", "formal"]),
    accords: JSON.stringify(["floral", "dark spicy", "gourmand", "woody"]),
    rating: 8.8,
    sillage: 4.5,
    projection: 4.0,
    longevity: 11,
    bottleShape: "flacon",
    bottleVolume: 50,
    owned: true,
    notes: [
      { name: "Black Pepper", layer: "top" },
      { name: "Bergamot", layer: "top" },
      { name: "Ylang-Ylang", layer: "heart" },
      { name: "Jasmine", layer: "heart" },
      { name: "Patchouli", layer: "base" },
      { name: "Sandalwood", layer: "base" },
      { name: "Vanilla", layer: "base" },
    ],
  },
  {
    name: "Oud Wood",
    brand: "Tom Ford",
    year: 2007,
    concentration: "EDP",
    description:
      "Rare oud wood is blended with sandalwood, rosewood, cardamom, and exotic spices for an unprecedented sensual woody fragrance.",
    season: JSON.stringify(["fall", "winter"]),
    timeOfDay: JSON.stringify(["night", "day"]),
    occasion: JSON.stringify(["formal", "date"]),
    accords: JSON.stringify(["woody", "oud", "spicy", "oriental"]),
    rating: 9.2,
    sillage: 3.0,
    projection: 3.0,
    longevity: 8,
    bottleShape: "rectangular",
    bottleVolume: 50,
    owned: false, // wishlist
    notes: [
      { name: "Cardamom", layer: "top" },
      { name: "Oud", layer: "heart" },
      { name: "Rosewood", layer: "heart" },
      { name: "Sandalwood", layer: "base" },
      { name: "Vetiver", layer: "base" },
      { name: "Tonka Bean", layer: "base" },
    ],
  },
  {
    name: "Light Blue",
    brand: "Dolce & Gabbana",
    year: 2001,
    concentration: "EDT",
    description:
      "A fresh, clean scent that captures the spirit of the Mediterranean with aquatic notes.",
    season: JSON.stringify(["spring", "summer"]),
    timeOfDay: JSON.stringify(["day"]),
    occasion: JSON.stringify(["casual", "sport"]),
    accords: JSON.stringify(["citrus", "aquatic", "fruity", "musky"]),
    rating: 7.5,
    sillage: 2.5,
    projection: 2.5,
    longevity: 5,
    bottleShape: "rectangular",
    bottleVolume: 100,
    owned: true,
    notes: [
      { name: "Grapefruit", layer: "top" },
      { name: "Lemon", layer: "top" },
      { name: "Apple", layer: "top" },
      { name: "Rose", layer: "heart" },
      { name: "Jasmine", layer: "heart" },
      { name: "Cedar", layer: "base" },
      { name: "Ambergris", layer: "base" },
      { name: "White Musk", layer: "base" },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  // Upsert notes
  for (const note of notes) {
    await prisma.note.upsert({
      where: { name: note.name },
      update: {},
      create: note,
    });
  }
  console.log(`✓ Seeded ${notes.length} notes`);

  // Create sample fragrances
  for (const fragData of sampleFragrances) {
    const { notes: fragranceNotes, ...fragranceData } = fragData;

    const fragrance = await prisma.fragrance.create({
      data: fragranceData,
    });

    // Create collection item for owned fragrances
    if (fragrance.owned) {
      await prisma.collectionItem.create({
        data: {
          fragranceId: fragrance.id,
          position: sampleFragrances
            .filter((f) => f.owned)
            .findIndex((f) => f.name === fragrance.name),
        },
      });
    }

    // Create fragrance notes
    for (const noteData of fragranceNotes) {
      const note = await prisma.note.findUnique({
        where: { name: noteData.name },
      });
      if (!note) continue;

      await prisma.fragranceNote.upsert({
        where: {
          fragranceId_noteId_layer: {
            fragranceId: fragrance.id,
            noteId: note.id,
            layer: noteData.layer,
          },
        },
        update: {},
        create: {
          fragranceId: fragrance.id,
          noteId: note.id,
          layer: noteData.layer,
        },
      });
    }
  }
  console.log(`✓ Seeded ${sampleFragrances.length} fragrances`);
  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
