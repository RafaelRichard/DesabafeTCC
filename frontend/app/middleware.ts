import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const tokenCookie = req.cookies.get('token'); // Obtendo o cookie
    if (!tokenCookie) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    const token = tokenCookie.value; // Pegando a string do token
    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decodificando o JWT
        const role = payload.role;

        const pathname = req.nextUrl.pathname;

        // Protegendo rotas específicas
        if (pathname.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL('/403', req.url));
        }
        if (pathname.startsWith('/psicologo') && role !== 'psicologo') {
            return NextResponse.redirect(new URL('/403', req.url));
        }
        if (pathname.startsWith('/psiquiatra') && role !== 'psiquiatra') {
            return NextResponse.redirect(new URL('/403', req.url));
        }
        if (pathname.startsWith('/paciente') && role !== 'paciente') {
            return NextResponse.redirect(new URL('/403', req.url));
        }

    } catch (error) {
        console.error('Erro ao decodificar o token:', error);
        return NextResponse.redirect(new URL('/login', req.url)); // Redireciona se houver erro no token
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/psicologo/:path*', '/psiquiatra/:path*', '/paciente/:path*'],
};
