import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const fragrance = await prisma.fragrance.findUnique({
      where: { id },
      include: { collectionItem: true, fragranceNotes: { include: { note: true } } },
    });
    if (!fragrance) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      ...fragrance,
      season: JSON.parse(fragrance.season),
      timeOfDay: JSON.parse(fragrance.timeOfDay),
      occasion: JSON.parse(fragrance.occasion),
      accords: JSON.parse(fragrance.accords),
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = { ...body };

    if (Array.isArray(body.season)) updateData.season = JSON.stringify(body.season);
    if (Array.isArray(body.timeOfDay)) updateData.timeOfDay = JSON.stringify(body.timeOfDay);
    if (Array.isArray(body.occasion)) updateData.occasion = JSON.stringify(body.occasion);
    if (Array.isArray(body.accords)) updateData.accords = JSON.stringify(body.accords);

    delete updateData.fragranceNotes;
    delete updateData.collectionItem;

    const fragrance = await prisma.fragrance.update({
      where: { id },
      data: updateData,
      include: { collectionItem: true, fragranceNotes: { include: { note: true } } },
    });

    return NextResponse.json({
      ...fragrance,
      season: JSON.parse(fragrance.season),
      timeOfDay: JSON.parse(fragrance.timeOfDay),
      occasion: JSON.parse(fragrance.occasion),
      accords: JSON.parse(fragrance.accords),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.fragrance.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
