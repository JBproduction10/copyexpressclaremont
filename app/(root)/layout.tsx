import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export default function Layout({children}: {children: ReactNode}){
    return(
        <div>
            <Navbar />
            {children}
            <Footer />
            <Toaster position="top-center"/>
        </div>
    )
}