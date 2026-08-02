import { NextResponse } from 'next/server';

// Rotas que NÃO precisam de login
const PUBLIC_ROUTES = ['/login', '/register'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value
    || request.headers.get('authorization')?.replace('Bearer ', '');

  // Deixa rotas públicas passarem
  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));
  if (isPublic) return NextResponse.next();

  // Rota raiz — redireciona conforme login
  if (pathname === '/') {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    return NextResponse.next();
  }

  // Rotas protegidas — sem token redireciona para login
  if (!token && (pathname.startsWith('/client') || pathname.startsWith('/worker'))) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Proteção de modo: rota /worker/* só para workers, /client/* só para clients
  // (verificação completa acontece no AuthContext no lado do cliente)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
