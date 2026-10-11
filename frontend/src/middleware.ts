import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value || request.headers.get('Authorization')

  // We can't perfectly check localStorage in middleware, 
  // so for a complete SPA feel we might handle some auth checks client-side or use cookies.
  // Assuming a token in cookies or headers for SSR logic, else client side handles it.
  
  // Just return next() for now, as client-side AuthContext handles redirection better with localStorage
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
