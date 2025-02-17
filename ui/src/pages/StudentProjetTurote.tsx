import { PageProps } from "@/lib/shared/types/config";
import Breadcrumb from '@/components/ui/Breadcrumb';
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { DepartmentSettings, ProjetTutore } from "../types";
import api from "@/lib/network/api";
import { cookies } from "next/headers";
import ProjetTutoreForm from "../widgets/projet-tutore/ProjetTutoreForm";
import { Student } from "/addons/uscitech_academy/ui/src/types";
import ButtonCreateProjetTutore from "../widgets/projet-tutore/ButtonCreateProjetTutore";


export default async function StudentProjetTurote(props: PageProps){
    var projet: ProjetTutore|undefined = undefined;
    var student: Student | undefined = undefined;
    var department_settings: DepartmentSettings|undefined = undefined;
    const members: Student[] = []
    try{    
        department_settings = (await api(await cookies()).get(`/isp_stage/department-settings/me/`)).data;
        student = (await api(await cookies()).get(`/uscitech_academy/students/me/`)).data;
        const _tmp: ProjetTutore  = (await api(await cookies()).get(`/isp_stage/projets-tutores/my_projects/`)).data
        projet = _tmp 
        for (let index = 0; index < projet.member.length; index++) {
            const _id = projet.member[index];
            const _tmp: Student = (await api(await cookies()).get(`/uscitech_academy/students/${_id}/`)).data
            members.push(_tmp);
        }
    }catch(e){}
    return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[20px]'>
    <Breadcrumb links={[
        {
            label: "Projet Tutoré"
        }
    ]} />

    <div className='border-t border-inherent mt-[15px] pt-[15px] h-full'>
        <div className="">
            <div className=''>
                <p className='font-semibold text-[20px] m-0'>Projet Tutoré</p>
            </div>
            <div>
                { 
                    projet !== undefined ?  <ProjetTutoreForm department_settings={department_settings} student={student} {...props} for={ props.user.id === student?.user.id ? "create" : "detail" } projet={projet} members={members}/> : 
                   <>
                     <div>
                        <p>Vous ne faites pas encore partie d'aucun groupe</p>
                        <div className="mt-[10px] ml-[10px] text-[13px]">
                        <p>1. Vous pouvez soit demander à votre Chef de groupe de vous intégré dans groupe</p>
                        <p>2. Vous pouvez créeer un nouveau groupe : <ButtonCreateProjetTutore {...props} student={student} /></p>
                        </div>
                    </div>
                   </>
                }
            </div>
        </div> 
    </div>

</div>
}