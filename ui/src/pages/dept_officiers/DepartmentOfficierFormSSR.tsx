import { PageProps } from "@/lib/shared/types/config";
import Breadcrumb from '@/components/ui/Breadcrumb'
import { DepartmentOfficier } from "../../types";
import api from "@/lib/network/api";
import { cookies } from "next/headers";
import DepartmentOfficierFormCS from "./DepartmentOfficierFormCS";

export default async function DepartmentOfficierFormSSR(props: PageProps) {
    var departmentOfficier: DepartmentOfficier | undefined = undefined;
    const breadcrumb = [
        {
            label: "Responsable à la Recherche",
            link: "/apps/isp_stage/dept_search_off"
        }
    ]
    if (props.params.app[3] === "create")
        breadcrumb.push({
            label: "Nouveau",
            link: "/apps/isp_stage/dept_search_off/create"
        })
    else {
        try {
            departmentOfficier = (await api(await cookies()).get(`/isp_stage/dept-recherche-officier/${props.params.app[3]}/`)).data
            if(departmentOfficier === undefined) return <div>404</div>
            breadcrumb.push({
                label: departmentOfficier.employee.fullname,
                link: "/apps/isp_stage/dept_search_off/create"
            })
        } catch (e) {
            return <div>404</div>
        }
    }
    return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
        <Breadcrumb links={breadcrumb} /> 
        <DepartmentOfficierFormCS {...props} departmentOffier={departmentOfficier}/>
    </div>
}
