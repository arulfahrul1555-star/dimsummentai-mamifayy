import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const ADMIN_EMAIL = 'adminmamifay@gmail.com';
    const ADMIN_PASSWORD = 'admin123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const response = NextResponse.json({
        success: true,
        user: {
          email: ADMIN_EMAIL,
          name: 'Admin Dimsummentai Mamifayy',
          role: 'admin',
        },
      });

      // Set auth cookie
      response.cookies.set('mamifay_admin_auth', 'authenticated_admin', {
        httpOnly: false, // Accessible to client-side auth checks easily
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Email atau password admin salah!' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
