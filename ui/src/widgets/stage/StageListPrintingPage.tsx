import api from "@/lib/network/api";
import { PageProps } from "@/lib/shared/types/config";
import { cookies } from "next/headers";
import ListStageForStageMaster from "./list_stage/ListStageForStageMaster";
import { Grade } from "/addons/uscitech_academy/ui/src/types";


export default async function StageListPrintingPage(props: PageProps){
    const stages: any[] = ((await api(await cookies()).get(`/isp_stage/student/all?filter_dept=${props.params.app[4]}`)).data)
    const dept : Grade = ((await api(await cookies()).get(`/uscitech_academy/gradeclasses/${props.params.app[4]}/`)).data);
    return <>
        <div>
            <div className="mb-[20px] pb-[20px] text-center border-b-[2px] border-black">
                <p className="text-[20px] font-bold">Ministère de l'Enseignement Supérieur et Universitaire</p>
                <p>INSTITUT SUPERIEUR PEDAGOGIQUE DE LA GOMBE</p>
                <p>B.P. 3580. TEL : (243) 822358732</p>
                <p className="underline">KINSHASA/GOMBE</p>
            </div>
            <div>
                <p>DEPARTEMENT : {dept.libelle}</p>
                <p>Année académique : 2024-2025</p>
            </div>
            <div className="border border-black mt-[10px]">
            <ListStageForStageMaster {...props} stages={stages}  stagemaster={undefined} />
            </div>
        </div>
    </>
}