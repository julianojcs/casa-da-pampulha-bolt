import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary.server';
import { CLOUDINARY_FOLDERS, type CloudinaryFolder } from '@/lib/cloudinary';

// Configurações de avatar
const AVATAR_CONFIG = {
  maxWidth: 400,
  maxHeight: 400,
  quality: 80,
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as CloudinaryFolder;
    const publicId = formData.get('publicId') as string | null;
    const isAvatar = formData.get('isAvatar') === 'true';
    const userId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validate folder
    const validFolders = Object.values(CLOUDINARY_FOLDERS);
    if (!folder || !validFolders.includes(folder)) {
      return NextResponse.json(
        { error: `Pasta inválida. Use uma das: ${validFolders.join(', ')}` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determinar transformações baseado no tipo de imagem
    let transformation: any[] = [{ quality: 'auto', fetch_format: 'auto' }];

    // Para avatares, aplicar redimensionamento e recorte
    if (isAvatar || folder === CLOUDINARY_FOLDERS.GUESTS) {
      transformation = [
        {
          width: AVATAR_CONFIG.maxWidth,
          height: AVATAR_CONFIG.maxHeight,
          crop: 'fill',
          gravity: 'face', // Foca no rosto se houver
          quality: AVATAR_CONFIG.quality,
          fetch_format: 'auto',
        }
      ];
    }

    // Para avatares, usar public_id fixo baseado no userId para sobrescrever
    let finalPublicId = publicId || undefined;
    if (isAvatar && userId) {
      finalPublicId = `avatar_${userId}`;
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: finalPublicId,
          resource_type: 'auto',
          overwrite: true, // Sempre sobrescrever se o public_id existir
          invalidate: true, // Invalidar cache do CDN
          transformation
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    });

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload da imagem' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID não informado' },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Erro ao deletar imagem' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar imagem' },
      { status: 500 }
    );
  }
}
