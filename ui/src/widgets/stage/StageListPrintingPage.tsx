import api from "@/lib/network/api";
import { PageProps } from "@/lib/shared/types/config";
import { cookies } from "next/headers";
import ListStageForStageMaster from "./list_stage/ListStageForStageMaster";
import { Grade } from "/addons/uscitech_academy/ui/src/types";
import PrintingClientAction from "../../pages/reports/director/PrintingClientAction";
import Image from "next/image";
const logo = require('../../assets/images.png')


export default async function StageListPrintingPage(props: PageProps){
    const stages: any[] = ((await api(await cookies()).get(`/isp_stage/student/${props.params.app[2]}/?disable_pagination=1&filter_dept=${props.params.app[4]}`)).data)
    const dept : Grade = ((await api(await cookies()).get(`/uscitech_academy/gradeclasses/${props.params.app[4]}/`)).data);
    return <>
        <div>
            <div className="mb-[20px] pb-[20px] text-center border-b-[2px] border-black">
                <p className="text-[20px] font-bold">Ministère de l'Enseignement Supérieur et Universitaire</p>
                <p>INSTITUT SUPERIEUR PEDAGOGIQUE DE LA GOMBE</p>
                <div className="flex items-center justify-center">
                <Image width={60} height={60} alt="Logo ISP Gombe" src={logo} />
                </div>
                <p>B.P. 3580. TEL : (243) 822358732</p>
                <p className="underline">KINSHASA/GOMBE</p>
            </div>
            <div>
                <p>DEPARTEMENT : <span className="font-semibold">{dept.libelle}</span></p>
                <p>Année académique : <span className="font-semibold">2024-2025</span></p>
                <p>Effectif : <span className="font-semibold">{stages.length}</span></p>
            </div>
            <div className="border border-black mt-[10px]">
            <ListStageForStageMaster {...props} stages={stages}  stagemaster={undefined} />
            </div>
        </div>
        <PrintingClientAction />
    </>
}