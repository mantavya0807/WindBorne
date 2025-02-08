export async function GET() {
    try {
      const response = await fetch('https://a.windbornesystems.com/treasure/00.json', {
        next: { revalidate: 300 }, // Cache for 5 minutes
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
  
      const data = await response.json();
      return Response.json(data);
    } catch (error) {
      return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
  }