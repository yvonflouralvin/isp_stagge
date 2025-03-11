import Breadcrumb from "@/components/ui/Breadcrumb";
import api from "@/lib/network/api";
import { PageProps } from "@/lib/shared/types/config";
import { cookies } from "next/headers";
import React from 'react';
import { ProjetTutore, StudentMemoire } from "../../../types";

interface Props extends PageProps {

}
export default async function DirectorReportView(props: Props) {
    try {
        const reports: any = (await api(await cookies()).get(`/isp_stage/department-resumes-for-director/${props.params.app[4]}`)).data
        return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
            <Breadcrumb links={[
                {
                    label: "Rapports",
                    link: "/apps/isp_stage/reports"
                },
                {
                    label: reports.director.fullname,
                    link: `/apps/isp_stage/reports/director/${reports.director.id}`
                }
            ]} />
            <div className="border-t border-inherent mt-[15px] w-full pt-[15px] h-full">
                <div className="w-full">
                    <div className='w-full'>
                        <p className='font-semibold text-[20px] m-0'>{reports.director.fullname}</p>
                        <p className="text-[13px] text-gray-400">Département : {reports.department.libelle}</p>
                    </div>
                    <div className="border-t border-inherent mt-[10px] w-full">
                        <p className="text-[16px] text-gray-400 font-semibold py-[3px] bg-primary/40 px-[15px] text-white">Mémoires ({reports.memoires.length})</p>
                        <div className="border-t border-inherent w-full flex flex-col divide-x-[1px]">
                            {
                                reports.memoires.map((memoire: StudentMemoire, index: number) => {
                                    return <div key={memoire.id} className={`flex items-start gap-[4px]`}>
                                        <p className="w-[40%]">{index + 1}. {memoire.student.user.name} {memoire.student.user.last_name} {memoire.student.user.first_name}</p>
                                        <p className="w-[60%]">{memoire.subject}</p>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                    <div className="border-t border-inherent mt-[10px] w-full">
                        <p className="text-[16px] text-gray-400 font-semibold py-[3px] bg-primary/40 px-[15px] text-white">Projets Tutorés ({reports.projects.length})</p>
                        <div className="border-t border-inherent w-full flex flex-col divide-x-[1px]">
                            {
                                reports.projects.map((projet: ProjetTutore, index: number) => {
                                    return <div key={projet.id} className={`flex items-start gap-[4px]`}>
                                        <p className="w-[40%]">{index + 1}. {projet.head.user.name} {projet.head.user.last_name} {projet.head.user.first_name}</p>
                                        <p className="w-[60%]">{projet.subject}</p>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    } catch (e) {
        return <p>404</p>
    }
}