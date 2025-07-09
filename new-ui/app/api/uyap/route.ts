import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    let endpoint = '';
    let method = 'POST';

    switch (action) {
      case 'login':
        endpoint = '/api/uyap/login';
        break;
      case 'logout':
        endpoint = '/api/uyap/logout';
        break;
      case 'search-files':
        endpoint = '/api/uyap/search-files';
        break;
      case 'extract-data':
        endpoint = '/api/uyap/extract-data';
        break;
      case 'query':
        endpoint = '/api/uyap/query';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.message || 'UYAP operation failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('UYAP API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'status') {
      const response = await fetch(`${BACKEND_API_URL}/api/uyap/status`);
      const result = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { error: result.message || 'Failed to get UYAP status' },
          { status: response.status }
        );
      }

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('UYAP status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 