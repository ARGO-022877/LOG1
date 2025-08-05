import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Neo4j Python API 서버 URL (실제 운영 중)
    const apiBaseUrl = process.env.NEO4J_API_URL || 'http://localhost:5000';
    const queryUrl = `${apiBaseUrl}/api/v1/query`;

    console.log('Forwarding query to Neo4j Knowledge Engine:', queryUrl);

    const response = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Neo4j API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Python API 응답을 UI에서 사용할 수 있는 형태로 변환
    if (result.success && result.data) {
      const transformedData = {
        success: true,
        data: {
          nodes: result.data.map((item: Record<string, unknown>, index: number) => ({
            id: index.toString(),
            label: item.name || item.title || `Item ${index}`,
            type: 'developer',
            properties: item
          })),
          relationships: []
        },
        message: result.message
      };
      return NextResponse.json(transformedData);
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('API Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}