import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://dypkjnewrldcnpsegwxo.functions.supabase.co/hijri-date', {
      headers: {
        "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY ?? ""}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hijri date');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching hijri date:', error);
    return NextResponse.json({ hijri: '' }, { status: 200 }); // Return empty string as fallback
  }
}