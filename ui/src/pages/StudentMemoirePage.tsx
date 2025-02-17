import { PageProps } from "@/lib/shared/types/config";
import Breadcrumb from '@/components/ui/Breadcrumb';
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { ProjetTutore, StudentMemoire } from "../types";
import api from "@/lib/network/api";
import { cookies } from "next/headers";
import ProjetTutoreForm from "../widgets/projet-tutore/ProjetTutoreForm";
import { Student } from "/addons/uscitech_academy/ui/src/types";
import ButtonCreateProjetTutore from "../widgets/projet-tutore/ButtonCreateProjetTutore";
import StudentMemoireForm from "../widgets/projet-tutore/StudentMemoireForm";
import ButtonCreateStudentMemoire from "../widgets/projet-tutore/ButtonCreateStudentMemoire";


export default async function StudentMemoirePage(props: PageProps) {
    var memoire: StudentMemoire | undefined = undefined;
    var student: Student | undefined = undefined;
    const members: Student[] = []
    try {
        student = (await api(await cookies()).get(`/uscitech_academy/students/me/`)).data;
        const _tmp: StudentMemoire = (await api(await cookies()).get(`/isp_stage/students-memoires/my_memoire/`)).data
        memoire = _tmp

    } catch (e) { }
    return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[20px]'>
        <Breadcrumb links={[
            {
                label: "Memoire"
            }
        ]} />

        <div className='border-t border-inherent mt-[15px] pt-[15px] h-full'>
            <div className="">
                <div className=''>
                    <p className='font-semibold text-[20px] m-0'>Memoire</p>
                </div>
                <div>
                    {
                        memoire !== undefined ? <StudentMemoireForm student={student} {...props} for={props.user.id === student?.user.id ? "create" : "detail"} memoire={memoire} /> :
                            <>
                                {
                                    student !== undefined && <div>
                                        <p>Vous n'avez pas encore crée votre mémoire</p>
                                        <div className="mt-[10px] ml-[10px] text-[13px]">
                                            <p>Vous pouvez créeer un nouveau groupe : <ButtonCreateStudentMemoire {...props} student={student} /></p>
                                        </div>
                                    </div>
                                }
                            </>
                    }
                </div>
            </div>
        </div>

    </div>
}