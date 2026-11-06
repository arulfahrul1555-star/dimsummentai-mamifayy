import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await db.getProducts();
    const settings = await db.getSettings();
    return NextResponse.json({
      success: true,
      data: {
        products,
        settings,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memuat menu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { productId, image, name, description } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'ID produk diperlukan' },
        { status: 400 }
      );
    }

    if (!image && !name && !description) {
      return NextResponse.json(
        { success: false, message: 'Data yang diperbarui tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Direct save: image can be compressed base64 data URI (data:image/jpeg;base64,...) or a URL.
    // Storing the image directly guarantees 100% reliability on Vercel and serverless,
    // avoiding 404 broken image errors caused by ephemeral filesystem writes.
    const updated = await db.updateProduct({
      id: productId,
      ...(image ? { image: String(image).trim() } : {}),
      ...(name ? { name } : {}),
      ...(description ? { description } : {}),
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Foto produk berhasil disimpan dan langsung live!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal memperbarui produk' },
      { status: 500 }
    );
  }
}
