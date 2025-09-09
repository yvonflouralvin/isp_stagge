import { PageProps } from "@/lib/shared/types/config";
import Breadcrumb from '@/components/ui/Breadcrumb'; 
import { StudentMemoire } from "../types";
import api from "@/lib/network/api";
import { cookies } from "next/headers"; 
import { Student } from "/addons/uscitech_academy/ui/src/types"; 
import StudentMemoireForm from "../widgets/projet-tutore/StudentMemoireForm"; 


export default async function StudentMemoireDetailPage(props: PageProps) {
    const breadcrumb = [
        {
            label: "Memoire"
        }
    ]
    var memoire: StudentMemoire | undefined = undefined;
    var student: Student | undefined = undefined;
    try {
        const _tmp: StudentMemoire = (await api(await cookies()).get(`/isp_stage/students-memoires/${props.params.app[3]}/`)).data
        memoire = _tmp
        breadcrumb.push({
            label: `${_tmp.student.user.name} ${_tmp.student.user.last_name} ${_tmp.student.user.first_name}`
        })
    } catch (e) { }


    return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
        <Breadcrumb links={breadcrumb} />

        <div className='border-t border-inherent mt-[15px] pt-[15px] h-full'>
            <div className="">
                <div className=''>
                    <p className='font-semibold text-[20px] m-0'>Memoire</p>
                </div>
                <div>
                    {<StudentMemoireForm student={student} {...props} for={"detail"} memoire={memoire} />}
                </div>
            </div>
        </div>

    </div>
}