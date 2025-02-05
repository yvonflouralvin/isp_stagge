import { PageProps } from "@/lib/shared/types/config";
import { ArchiveIcon } from "lucide-react";


export default async function NoActiveFeatures(props: PageProps){
    return <div className="flex items-center justify-center h-full bg-white rounded p-[20px]">
        <div className="flex flex-col items-center justify-center">
            <ArchiveIcon />
            <p>Cet option n'est pas encore actif</p>
        </div>
    </div>
}