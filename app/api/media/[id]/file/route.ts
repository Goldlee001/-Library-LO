import { NextResponse, NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest, { params }: any) {
  try {
    const client = await clientPromise;
    const db = client.db('library');

    const file = await db.collection('media').findOne({
      _id: new ObjectId(params.id),
      type: 'pdf'
    });

    if (!file) {
      return new NextResponse('File not found', { status: 404 });
    }

    const response = await fetch(file.src);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Error serving file', { status: 500 });
  }
}
