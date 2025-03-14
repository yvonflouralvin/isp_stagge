import api from '@/lib/network/api';
import { PageProps } from '@/lib/shared/types/config';
import { cookies } from 'next/headers';
import { DirecteurTravauxResumes, ProjetTutore, StudentMemoire } from '../types';
import { Student } from '/addons/uscitech_academy/ui/src/types';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ButtonCreateProjetTutore from '../widgets/projet-tutore/ButtonCreateProjetTutore';
import ButtonCreateStudentMemoire from '../widgets/projet-tutore/ButtonCreateStudentMemoire';

export default async function IspStageDashboardWidget(props: PageProps) {

    const dashboardWidget: any[] = []

    if (props.user?.permissions?.find(perm => (
        perm === "isp_departement_officier" ||
        perm === "isp_user_stage_master" ||
        perm === "academy_is_teacher"
    )) || props.user.is_superuser === true)
        try {
            const resumes = (await api(await cookies()).get(`/isp_stage/resumes`)).data
            dashboardWidget.push(<div className="flex w-full gap-[10px] flex-wrap mt-[20px]">
                <div className="p-[20px] rounded shadow-md bg-white flex flex-col">
                    <h4 className="text-[14px] font-bold">Etudiants Inscripts</h4>
                    <div className="flex-1 flex gap-1 items-center">
                        <h1>{resumes.students}</h1><p className="text-[10px] text-gray-400">étudiants</p>
                    </div>
                </div>

                <div className="p-[20px] rounded shadow-md bg-white flex flex-col">
                    <h4 className="text-[14px] font-bold">Stage Impregnation</h4>
                    <div className="flex-1 flex gap-1 items-center">
                        <h1>{resumes.impregnations}</h1><p className="text-[10px] text-gray-400">étudiants</p>
                    </div>
                </div>

                <div className="p-[20px] rounded shadow-md bg-white flex flex-col">
                    <h4 className="text-[14px] font-bold">Stage Pedagogique</h4>
                    <div className="flex-1 flex gap-1 items-center">
                        <h1>{resumes.pedagogiques}</h1><p className="text-[10px] text-gray-400">étudiants</p>
                    </div>
                </div>
                <div className="p-[20px] rounded shadow-md bg-white flex flex-col">
                    <h4 className="text-[14px] font-bold">Affecté</h4>
                    <div className="flex-1 flex gap-1 items-center">
                        <h1>{resumes.affected}</h1><p className="text-[10px] text-gray-400">étudiants</p>
                    </div>
                </div>
            </div>)
        } catch (e) {
            console.log(e)
        }

    if (props.user?.permissions?.find(perm => (
        perm === "isp_directeur_travaux"
    ))) {
        try {
            const teacher_resumes: DirecteurTravauxResumes[] = ((await api(await cookies()).get(`/isp_stage/directeur-travaux/resumes/`)).data)
            dashboardWidget.push(<div className='my-[30px] border-t border-inherent p-[15px]'>
                <div className='mb-[10px]'>
                    <p className='text-[20px] font-semibold'>Résumé Directeur Travaux</p>
                    <p className='text-gray-400 text-[13px]'>Votre résumé en tant que directeur des travaux</p>
                </div>
                {
                    teacher_resumes.map((e) => {
                        return <div key={e.department.id} className='mt-[10px]'>
                            <p className=''>{e.department.libelle}</p>
                            <div className='ml-[15px]'>
                                {
                                    e.directeurs.map((directeur) => {
                                        return <div key={directeur.id}>
                                            {
                                                directeur.direction_type === "projet-tutore" && <div className='flex items-center border-b border-inherent py-[4px] text-[13px]'>
                                                    <p className='flex-1'>{directeur.direction_type === "projet-tutore" ? "Projet Tutoré" : ""}</p>
                                                    <p>{directeur.category === "interne" ? `${e.used.used_tutore_projects_interne} /${e.quota.max_tutore_projects_interne} ` : `${e.used.used_tutore_projects_externe} /${e.quota.max_externe_tutore_projects} `}<span className='text-gray-400'>étudiants</span></p>
                                                </div>
                                            }

                                            {
                                                directeur.direction_type === "memoire" && <div className='flex items-center border-b border-inherent py-[4px] text-[13px]'>
                                                    <p className='flex-1'>{directeur.direction_type === "memoire" ? "Memoire" : ""}</p>
                                                    <p>{directeur.category === "interne" ? `${e.used.used_memoire_projects_interne} /${e.quota.max_memoire_projects_interne} ` : `${e.used.used_memoire_projects_externe} /${e.quota.max_externe_memoire_projects} `}<span className='text-gray-400'>étudiants</span></p>
                                                </div>
                                            }
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                    })
                }
            </div>)
        } catch (e) {

        }
    }

    if (props.user?.permissions.find(perm => (
        perm === "isp_user_student" ||
        perm === "academy_is_student"
    ))) {
        try {
            const student: Student = (await api(await cookies()).get(`/uscitech_academy/students/me/`)).data;
            dashboardWidget.push(<div className='mt-[15px] p-[10px] md:p-[20px] border-b border-inherent'>
                <p className='text-[13px] text-gray-400'>Détails sur l'étudiant</p>
                <p className='text-[20px]'>{student.user.name} {student.user.last_name} {student.user.first_name}</p>
                <p className='text-[13px]'>{student.promotion?.libelle} {student.promotion?.grade?.libelle}</p>
            </div>)

            try {
                if (student.promotion.libelle === "L3 (LMD)" || student.promotion.libelle === "L2 (LMD)") {
                    const stage = (await api(await cookies()).get(`/isp_stage/stage/get-by-user/`)).data;
                    // stage.stagemaster
                    dashboardWidget.push(<div className='p-[10px] md:p-[20px] border-b border-inherent'>
                        <p className='text-[13px] text-gray-400'>Informations du Stage { student.promotion.libelle === "L3 (LMD)" ? "Pédagogique" : `${student.promotion.libelle === "L2 (LMD)" ? "d'Impregnation" : ""}`}</p>
                        <p className='mt-[10px] text-[13px]'>Maitre de Stage</p>
                        {
                            (stage.stagemaster.length > 0) ? <p>{stage.stagemaster[0].user?.name} {stage.stagemaster[0].user?.last_name} {stage.stagemaster[0].user?.first_name} - Tel : {stage.stagemaster[0].user?.phone}</p>
                                : <p>Pas encore affecté</p>
                        }
                        <div className='flex'>
                            {
                               ( student.promotion.libelle === "L3 (LMD)") ?  <p><Link href={ student.promotion.libelle === "L3 (LMD)" ? "/apps/isp_stage/pedagogique" : `${student.promotion.libelle === "L2 (LMD)" ? "/apps/isp_stage/impregnation" : ""}`} className='mt-[5px] flex items-center text-[13px]  duration-300 text-primary gap-[5px] py-[2px]'>Voir les détails <ArrowRight size={"13px"} color='blue' /></Link></p> : <></>
                            }
                        </div>
                    </div>)
                }
            } catch (e) { }
            if (student.promotion.libelle === "L3 (LMD)") {

                try {

                    const projet_tutore: ProjetTutore = (await api(await cookies()).get(`/isp_stage/projets-tutores/my_projects/`)).data
                    dashboardWidget.push(<div className='p-[10px] md:p-[20px] border-b border-inherent'>
                        <p className='text-[13px] text-gray-400'>Informations du Projet Tutoré</p>
                        <p className='mt-[10px] text-[13px]'>Sujet du groupe</p>
                        <p className='text-[16px]'>{projet_tutore.subject}</p>
                        <p className='mt-[10px] text-[13px]'>Chef de groupe</p>
                        <p className='text-[16px]'>{projet_tutore.head.user.name} {projet_tutore.head.user.last_name} {projet_tutore.head.user.first_name}</p>
                        <div className='flex'>
                            <p><Link href={"/apps/isp_stage/projet-tutore"} className='mt-[5px] flex items-center text-[13px]  duration-300 text-primary gap-[5px] py-[2px]'>Voir les détails <ArrowRight size={"13px"} color='blue' /></Link></p>
                        </div>
                    </div>)

                } catch (e) {
                    dashboardWidget.push(
                        <div className='p-[10px] md:p-[20px] border-b border-inherent'>
                            <div>
                                <p>Vous ne faites pas encore partie d'aucun groupe</p>
                                <div className="mt-[10px] ml-[10px] text-[13px]">
                                    <p>1. Vous pouvez soit demander à votre Chef de groupe de vous intégré dans groupe</p>
                                    <p>2. Vous pouvez créeer un nouveau groupe : <ButtonCreateProjetTutore {...props} student={student} redirect='/apps/isp_stage/projet-tutore' /></p>
                                </div>
                            </div>
                        </div>
                    )
                }
            }

            if (student.promotion.libelle === "L2 (AS)") {
                try {
                    const student_memoire: StudentMemoire = (await api(await cookies()).get(`/isp_stage/students-memoires/my_memoire/`)).data
                    dashboardWidget.push(<div className='p-[10px] md:p-[20px] border-b border-inherent'>
                        <p className='text-[13px] text-gray-400'>Informations du Mémoire</p>
                        <p className='mt-[10px] text-[13px]'>Sujet </p>
                        <p className='text-[16px]'>{student_memoire.subject}</p>
                        <p className='mt-[10px] text-[13px]'>Directeur</p>
                        <p className='text-[16px]'>{student_memoire.director !== undefined  ? student_memoire.director?.employee.fullname : "Pas encore choisi"}</p>
                        <div className='flex'>
                            <p><Link href={"/apps/isp_stage/student-memoire"} className='mt-[5px] flex items-center text-[13px]  duration-300 text-primary gap-[5px] py-[2px]'>Voir les détails <ArrowRight size={"13px"} color='blue' /></Link></p>
                        </div>
                    </div>)
                } catch (e) {
                    dashboardWidget.push(<div className='p-[10px] md:p-[20px] border-b border-inherent'>
                        <p>Vous n'avez pas encore crée votre mémoire</p>
                        <div className="mt-[10px] ml-[10px] text-[13px]">
                            <p>Vous pouvez créeer un nouveau groupe : <ButtonCreateStudentMemoire redirect='/apps/isp_stage/student-memoire' {...props} student={student} /></p>
                        </div>
                    </div>)
                }
            }

        } catch (e) { }


    }

    return dashboardWidget;

}