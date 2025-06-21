import { PageProps } from "@/lib/shared/types/config";
import { Grade, Student } from "/addons/uscitech_academy/ui/src/types";
import Image from "next/image";
import PrintingClientAction from "./reports/director/PrintingClientAction";
import api from "@/lib/network/api";
import { cookies } from "next/headers";
const logo = require('../assets/images.png')


export default async function StudentPrintProjetTutoreRestStudent(props: PageProps) {
    const students: Student[] = ((await api(await cookies()).get(`/isp_stage/projets-tutores/student-without-project/?disable_pagination=1&filter_dept=${props.params.app[4]}`)).data)
//    const dept : Grade = ((await api(await cookies()).get(`/uscitech_academy/gradeclasses/${props.params.app[4]}/`)).data);
    return <>
        <div>
            <div className="mb-[20px] pb-[20px] text-center border-b-[2px] border-black">
                <p className="text-[20px] font-bold">Ministère de l'Enseignement Supérieur et Universitaire</p>
                <p>INSTITUT SUPERIEUR PEDAGOGIQUE DE LA GOMBE</p>
                <div className="flex items-center justify-center">
                <Image width={60} height={60} alt="Logo ISP Gombe" src={logo} />
                </div>
                <p>B.P. 3580. TEL : (243) 822358732</p>
                <p className="underline">KINSHASA/GOMBE</p>
            </div>
            <div>
 
                <p>Année académique : <span className="font-semibold">2024-2025</span></p>
                <p>Effectif : <span className="font-semibold">{students.length} étudiant{students.length > 1 ? "s" : ""}</span></p>
            </div>
            <div className="border border-black mt-[10px] divide-y-[1px] divide-black">
                {
                    students.map((student:any, index:number) => {
                        return <p key={student.id} className="text-[13px] text-gray-500 px-[20px] py-[6px] my-[3px] cursor-pointer hover:bg-[0,0,0,0.02] w-full">{index+1}. {student.user.name} {student.user.last_name} {student.user.first_name}</p>
                    })
                }
            {/* <ListStageForStageMaster  {...props} stages={stages}  stagemaster={undefined}  quoteFields={props.params.app[3] === "cotations" ? quoteFields : centralisatriceFields}/> */}
            </div>
        </div>
        <PrintingClientAction />
    </>
}
