import { PageProps } from "@/lib/shared/types/config"; 
import Breadcrumb from '@/components/ui/Breadcrumb';  
import StudentLists from "./StudentLists";
import api from "@/lib/network/api";
import { cookies } from "next/headers";

interface Props extends PageProps {

}
export default async function StudentPage(props: Props) {
    var stats : {
        count: number;
        l2as: number;
        l2lmd: number;
        l3lmd: number;
    }= {
        count: 0,
        l2as: 0,
        l2lmd: 0,
        l3lmd: 0
    }
    try{
        stats = ((await api(await cookies()).get(`/isp_stage/students/stats/`)).data)
    }catch(e){}
    return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
        <Breadcrumb links={[
            {
                label: "Étudiants",
                link: "/apps/isp_stage/students"
            }
        ]} />
        <StudentLists {...props} stats={stats}/>
    </div>
}