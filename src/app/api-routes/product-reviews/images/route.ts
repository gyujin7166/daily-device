import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  return NextResponse.json(
    {
      message:
        'Review image upload has moved to direct Cloudinary signed upload. Use /api/cloudinary/sign.',
    },
    { status: 410 },
  );
}
