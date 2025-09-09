import { PageProps } from "@/lib/shared/types/config";
import Breadcrumb from '@/components/ui/Breadcrumb'
import Link from "next/link";
import DirecteursPageCS from "./DirecteursPageCS";
import { DepartmentSettings } from "../../types";
import api from "@/lib/network/api";
import { cookies } from "next/headers";


export default async function DirecteursPageSSR(props: PageProps) {
    var department_settings: DepartmentSettings | undefined = undefined;
    try {
        department_settings = ((await api(await cookies()).get(`/isp_stage/department-settings/me/`)).data)
    } catch (e) {   
        console.log(e)
    }
    return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
        <Breadcrumb links={[
            {
                label: `${ props.params.app[3] === "projet-tutore" ? `Directeur Projets Tutorés` : ``}
                        ${ props.params.app[3] === "memoire" ? `Directeur Mémoires` : ``}
                        ${ props.params.app[3] === "stage" ? `Maitres de  Stage` : ``}`,
                link: `/apps/isp_stage/directeur-travaux/${props.params.app[3]}`
            }
        ]} />
        <div className='border-t border-inherent mt-[15px] pt-[15px] w-full h-full'>
            <DirecteursPageCS {...props} department_settings={department_settings} />
        </div>
    </div>
}