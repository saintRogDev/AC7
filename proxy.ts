import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !publishableKey) {
    if (request.nextUrl.pathname.startsWith("/admin")) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = "/login"
      loginUrl.searchParams.set("reason", "configuration")
      return NextResponse.redirect(loginUrl)
    }
    return response
  }

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const user = await supabase.auth.getUser().then(({ data }) => data.user).catch(() => null)

  if (!user && request.nextUrl.pathname.startsWith("/admin")) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    return copyCookies(NextResponse.redirect(loginUrl), response)
  }

  return response
}

function copyCookies(target: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie))
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(header)
    if (value) target.headers.set(header, value)
  }
  return target
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/accept-invite"],
}
