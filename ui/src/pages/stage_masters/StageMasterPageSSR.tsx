import { PageProps } from "@/lib/shared/types/config";
import Breadcrumb from '@/components/ui/Breadcrumb'
import Link from "next/link";
import StageMasterPageCS from "./StageMasterPageCS";


export default async function StageMasterPageSSR(props: PageProps) {
    return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
        <Breadcrumb links={[
            {
                label: "Maitres de Stages",
                link: "/apps/isp_stage/stage-masters"
            }
        ]} />
        <div className='border-t border-inherent mt-[15px] pt-[15px] w-full h-full'>
            <StageMasterPageCS {...props} />
        </div>
    </div>
}