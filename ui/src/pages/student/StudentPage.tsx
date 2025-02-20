import { PageProps } from "@/lib/shared/types/config"; 
import Breadcrumb from '@/components/ui/Breadcrumb'; 
import StudentList from "./StudentList"; 

interface Props extends PageProps {

}
export default function StudentPage(props: Props) {

    return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
        <Breadcrumb links={[
            {
                label: "Étudiants",
                link: "/apps/isp_stage/students"
            }
        ]} />

        <StudentList {...props} />

    </div>
}