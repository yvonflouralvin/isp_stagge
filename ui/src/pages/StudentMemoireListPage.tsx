import React from 'react';
import { PageProps } from "@/lib/shared/types/config";
import Breadcrumb from '@/components/ui/Breadcrumb' 
import ListStudentMemoires from '../widgets/projet-tutore/ListStudentMemoires';
import { DepartmentSettings } from '../types';
import api from '@/lib/network/api';
import { cookies } from 'next/headers';


export default async function StudentMemoireListPage(props: PageProps) {
    var department_settings: DepartmentSettings | undefined = undefined;
    try {
        department_settings = ((await api(await cookies()).get(`/isp_stage/department-settings/me/`)).data)
    } catch (e) { }
    return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
        <Breadcrumb links={[
            {
                label: "Memoires",
                link: "/apps/isp_stage/students-memoires"
            }
        ]} />
       
                <ListStudentMemoires {...props} />
            </div>
         
}