import { PageProps } from "@/lib/shared/types/config";
import Breadcrumb from '@/components/ui/Breadcrumb'
import Link from "next/link";
import DepartmentOfficierPageCS from "./DepartmentOfficierPageCS";


export default async function DepartmentOfficierPageSSR(props: PageProps) {
    return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
        <Breadcrumb links={[
            {
                label: "Responsable à la Recherche",
                link: "/apps/isp_stage/dept_search_off"
            }
        ]} />
        <div className='border-t border-inherent mt-[15px] pt-[15px] w-full h-full'>
            <DepartmentOfficierPageCS {...props} />
        </div>
    </div>
}