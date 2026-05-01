import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://dypkjnewrldcnpsegwxo.supabase.co/functions/v1/gold-price', {
      headers: {
        "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY ?? ""}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch gold price');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching gold price:', error);
    return NextResponse.json({ price: 92.45 }, { status: 200 }); // Return fallback value
  }
}