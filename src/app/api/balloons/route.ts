export const runtime = 'edge';

export async function GET() {
  try {
    const response = await fetch('https://a.windbornesystems.com/treasure/00.json', {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch');
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (_) { // Using underscore to indicate intentionally unused parameter
    return new Response(
      JSON.stringify({ error: 'Failed to fetch data' }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}