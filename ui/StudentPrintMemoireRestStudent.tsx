import api from "@/lib/network/api";
import PrintPageHeader from "./src/widgets/PrintPageHeader";
import { cookies } from "next/headers";
import { Grade, Student } from "/addons/uscitech_academy/ui/src/types";
import { PageProps } from "@/lib/shared/types/config";
import { DepartmentOfficier } from "./src/types";
import PrintingClientAction from "./src/pages/reports/director/PrintingClientAction";


export default async function StudentPrintMemoireRestStudent(props: PageProps){
    const students: Student[] = ((await api(await cookies()).get(`/isp_stage/dept-recherche-officier/student_without_memoires/?disable_pagination=1`)).data)
    const dept: DepartmentOfficier = ((await api(await cookies()).get(`/isp_stage/dept-recherche-officier/get_by_user/`)).data)
    // get_by_user
    // console.log(students)
    return <>
        <div>
        <PrintPageHeader />
        <div>
            <p>DEPARTEMENT : <span className="font-semibold">{dept.dept.libelle}</span></p>
            <p>Année académique : <span className="font-semibold">2024-2025</span></p>
            <p>Effectif : <span className="font-semibold">{students.length} étudiant{students.length > 1 ? "s" : ""}</span></p>
            <p>Liste d'étudiant n'ayant pas encore choisie de directeur</p>
        </div>

        <div className="border border-black mt-[10px] divide-y-1 divide-gray-600">
            {
                students.map((student: Student, index: number)=>{
                    return <div key={index+1} className='w-full flex items-center px-[7px] text-[13px] divide-x-1 divide-gray-600'>
                        <p className="w-[50px] text-center px-[5px]">{index+1}</p>
                        <p className="flex-1 px-[10px]">{student.user.name} {student.user.last_name} {student.user.first_name}</p> 
                    </div>
                })
            }
        </div>
      
    </div>
    <PrintingClientAction />
    </>
}