import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const fragrances = await prisma.fragrance.findMany({
      include: {
        collectionItem: true,
        fragranceNotes: { include: { note: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const parsed = fragrances.map((f) => ({
      ...f,
      season: JSON.parse(f.season),
      timeOfDay: JSON.parse(f.timeOfDay),
      occasion: JSON.parse(f.occasion),
      accords: JSON.parse(f.accords),
    }));

    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, brand, year, concentration, imageUrl, fragranticaUrl,
      description, season = [], timeOfDay = [], occasion = [], accords = [],
      rating, owned = true, bottleVolume, bottleShape, purchasePrice,
      notes = [],
    } = body;

    const fragrance = await prisma.fragrance.create({
      data: {
        name,
        brand,
        year: year ? parseInt(year) : null,
        concentration: concentration || null,
        imageUrl: imageUrl || null,
        fragranticaUrl: fragranticaUrl || null,
        description: description || null,
        season: JSON.stringify(season),
        timeOfDay: JSON.stringify(timeOfDay),
        occasion: JSON.stringify(occasion),
        accords: JSON.stringify(accords),
        rating: rating ? parseFloat(rating) : null,
        owned,
        bottleVolume: bottleVolume ? parseFloat(bottleVolume) : null,
        bottleShape: bottleShape || "tall",
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
      },
    });

    // Create collection item if owned
    if (owned) {
      const count = await prisma.collectionItem.count();
      await prisma.collectionItem.create({
        data: { fragranceId: fragrance.id, position: count },
      });
    }

    // Create fragrance notes if provided
    for (const { name: noteName, layer } of notes) {
      let note = await prisma.note.findUnique({ where: { name: noteName } });
      if (!note) {
        note = await prisma.note.create({
          data: { name: noteName, family: "other" },
        });
      }
      await prisma.fragranceNote.upsert({
        where: { fragranceId_noteId_layer: { fragranceId: fragrance.id, noteId: note.id, layer } },
        update: {},
        create: { fragranceId: fragrance.id, noteId: note.id, layer },
      });
    }

    const full = await prisma.fragrance.findUnique({
      where: { id: fragrance.id },
      include: { collectionItem: true, fragranceNotes: { include: { note: true } } },
    });

    return NextResponse.json({
      ...full,
      season: JSON.parse(full!.season),
      timeOfDay: JSON.parse(full!.timeOfDay),
      occasion: JSON.parse(full!.occasion),
      accords: JSON.parse(full!.accords),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
