import { ReactNode } from "react";
import { Toaster } from "sonner";

export default function Layout({children}: {children: ReactNode}){
    return(
        <div>{children}
            <Toaster position="top-center"/>
        </div>
    )
}