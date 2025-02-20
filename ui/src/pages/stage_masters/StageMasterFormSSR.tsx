import { PageProps } from "@/lib/shared/types/config";
import Breadcrumb from '@/components/ui/Breadcrumb'
import { StageMaster } from "../../types";
import api from "@/lib/network/api";
import { cookies } from "next/headers"; 
import StageMasterFormCS from "./StageMasterFormCS";

export default async function StageMasterFormSSR(props: PageProps) {
    var stageMaster: StageMaster | undefined = undefined;
    const breadcrumb = [
        {
            label: "Maitres de Stages",
            link: "/apps/isp_stage/stage-masters"
        }
    ]
    if (props.params.app[3] === "create")
        breadcrumb.push({
            label: "Nouveau",
            link: "/apps/isp_stage/stage-masters/create"
        })
    else {
        try {
            stageMaster = (await api(await cookies()).get(`/isp_stage/stage-master/${props.params.app[3]}/`)).data
            if(stageMaster === undefined) return <div>404</div>
            breadcrumb.push({
                label: stageMaster.employee.fullname,
                link: `/apps/isp_stage/stage-masters/${stageMaster.id}`
            })
        } catch (e) {
            return <div>404</div>
        }
    }
    return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
        <Breadcrumb links={breadcrumb} /> 
        <StageMasterFormCS {...props} stageMaster={stageMaster}/>
    </div>
}
