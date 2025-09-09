import { PageProps } from "@/lib/shared/types/config";
import Breadcrumb from '@/components/ui/Breadcrumb'
import { DepartmentOfficier, DirecteurTravaux, StageMaster } from "../../types";
import api from "@/lib/network/api";
import { cookies } from "next/headers"; 
import DirecteursFormCS from "./DirecteursFormCS";

export default async function DirecteursFormSSR(props: PageProps) {
    
    var departmentOfficier : DepartmentOfficier|undefined = undefined;
    try{
        departmentOfficier = ((await api(await cookies()).get(`/isp_stage/dept-recherche-officier/me/`)).data)
    }catch(e){
        
    }
    var directeur: DirecteurTravaux | undefined = undefined;
    
    const breadcrumb = [
        {
            label: `${ props.params.app[3] === "projet-tutore" ? `Directeur Projets Tutorés` : ``}
                    ${ props.params.app[3] === "memoire" ? `Directeur Mémoires` : ``}
                    ${ props.params.app[3] === "stage" ? `Maitres de  Stage` : ``}`,
            link: `/apps/isp_stage/directeur-travaux/${props.params.app[3]}`
        }
    ]

    if (props.params.app[4] === "create")
        breadcrumb.push({
            label: "Nouveau",
            link: `/apps/isp_stage/directeur-travaux/${props.params.app[3]}create`
        })
    else {
        try {
            directeur = (await api(await cookies()).get(`/isp_stage/directeur-travaux/${props.params.app[4]}/`)).data
            if(directeur === undefined) return <div>404</div>
            breadcrumb.push({
                label: directeur.employee.fullname,
                link: `/apps/isp_stage/directeur-travaux/${props.params.app[3]}/${directeur.id}`
            })
        } catch (e) {
            return <div>404</div>
        }
    }
    return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
        <Breadcrumb links={breadcrumb} /> 
        <DirecteursFormCS  {...props} directeur={directeur} departmentOfficier={departmentOfficier}/>
    </div>
}
