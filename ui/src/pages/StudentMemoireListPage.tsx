import React from 'react';
import { PageProps } from "@/lib/shared/types/config";
import Breadcrumb from '@/components/ui/Breadcrumb' 
import ListProjetTutores from '../widgets/projet-tutore/ListProjetTutores'; 
import StudentMemoireOptions from '../widgets/projet-tutore/StudentMemoireOptions';
import ListStudentMemoires from '../widgets/projet-tutore/ListStudentMemoires';
import { DepartmentSettings } from '../types';
import api from '@/lib/network/api';
import { cookies } from 'next/headers';


export default async function StudentMemoireListPage(props: PageProps) {
    var department_settings: DepartmentSettings | undefined = undefined;
    try {
        department_settings = ((await api(await cookies()).get(`/isp_stage/department-settings/me/`)).data)
    } catch (e) { }
    return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[20px]'>
        <Breadcrumb links={[
            {
                label: "Projets Tutorés",
                link: "/apps/isp_stage/projets-tutores"
            }
        ]} />
        <div className='border-t border-inherent mt-[15px] pt-[15px] h-full'>
            <div className="flex items-start">
                <div className='flex flex-col flex-1'>
                    <p className='font-semibold text-[20px] m-0'>Mémoires</p> 
                </div>
                { props.user.permissions.find(perm => perm === "isp_departement_officier") &&
                <div>
                    <StudentMemoireOptions department_settings={department_settings} />
                </div>
}
            </div>
            <div className="mt-[10px]">
                <ListStudentMemoires />
            </div>
        </div>

    </div>
}