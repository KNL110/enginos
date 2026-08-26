import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cheap edge-level guard, not the source of truth: `hasSession` just says
// "a session might exist" (see hooks/useSession.ts for why), so this only
// avoids flashing the dashboard shell at someone who's obviously logged
// out. The dashboard page itself still verifies via /me and bounces to
// /login client-side if that turns out to be stale/invalid.
export function proxy(request: NextRequest) {
    if (!request.cookies.has("hasSession")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
