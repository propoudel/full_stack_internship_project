import{NextRequest,NextResponse} from  "next/server";
export function middleware(request:NextRequest){

    //Retrive the authentication token
    const token = request.cookies.get("token")?.value;
    const {pathname} = request.nextUrl;

    // Define protected routes path
    // if user tries to access /dashboard without token redirect to login
    if(pathname.startsWith("/dashboard") && !token){
        return NextResponse.redirect(new URL("/login",request.url))
    }
    
    if((pathname.startsWith("/login") || pathname.startsWith("/register")) && token){
        return NextResponse.redirect(new URL("/dashboard",request.url))
    }
    return NextResponse.next();
}

export const config = {
    matcher:["/dashboard/:path*","/login","/register"]
}