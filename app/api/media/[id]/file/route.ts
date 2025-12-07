import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('library');
    
    // Get file metadata
    const file = await db.collection('media').findOne({ 
      _id: new ObjectId(params.id),
      type: 'pdf'
    });

    if (!file) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Fetch the actual file
    const response = await fetch(file.src);
    const blob = await response.blob();

    // Return the file with correct headers
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline', // This is the key to view in browser
        'Content-Length': blob.size.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Error serving file', { status: 500 });
  }
}