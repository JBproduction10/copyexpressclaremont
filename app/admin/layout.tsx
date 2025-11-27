'use client';

import { ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Toaster } from "sonner";

export default function Layout({children}: {children: ReactNode}){
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    // Allow access to login, register, forgot-password, reset-password, and verify-email pages without authentication
    const publicPages = ['/admin/login', '/admin/register', '/admin/forgot-password', '/admin/reset-password', '/admin/verify-email'];
    const isPublicPage = publicPages.includes(pathname);

    useEffect(() => {
        if (status === 'loading') return; // Still loading

        if (!isPublicPage) {
            if (!session) {
                router.push('/admin/login');
                return;
            }

            if (session.user.role !== 'admin') {
                router.push('/'); // Redirect non-admins to home
                return;
            }
        }
    }, [session, status, router, isPublicPage]);

    if (status === 'loading' && !isPublicPage) {
        return <div>Loading...</div>;
    }

    if (!isPublicPage && (!session || session.user.role !== 'admin')) {
        return null; // Or a loading state
    }

    return(
        <div>
            {children}
            <Toaster position="top-center"/>
        </div>
    )
}
