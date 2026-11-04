import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

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

    let finalImagePath = image;

    // If image is a base64 data url from browser file upload:
    if (image && typeof image === 'string' && image.startsWith('data:image/')) {
      const match = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (match) {
        const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
        const base64Data = match[2];
        const fileName = `${productId}-${Date.now()}.${ext}`;
        const targetDir = path.join(process.cwd(), 'public', 'images', 'products');
        try {
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          const filePath = path.join(targetDir, fileName);
          fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          finalImagePath = `/images/products/${fileName}`;
        } catch (fsErr) {
          // On serverless read-only platforms (like Vercel), fall back to keeping base64 data URL
          finalImagePath = image;
        }
      }
    }

    const updated = await db.updateProduct({
      id: productId,
      ...(finalImagePath ? { image: finalImagePath } : {}),
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
      message: 'Foto produk berhasil diperbarui!',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui produk' },
      { status: 500 }
    );
  }
}
