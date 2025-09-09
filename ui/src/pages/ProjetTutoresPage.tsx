import React from 'react';
import { PageProps } from "@/lib/shared/types/config"; 
import ListProjetTutores from '../widgets/projet-tutore/ListProjetTutores'; 
import { DepartmentSettings } from '../types';
import api from '@/lib/network/api';
import { cookies } from 'next/headers';
import Breadcrumb from '@/components/ui/Breadcrumb';


export default async function ProjetTutoresPage(props: PageProps) {
    var department_settings: DepartmentSettings | undefined = undefined;
    try {
        department_settings = ((await api(await cookies()).get(`/isp_stage/department-settings/me/`)).data)
    } catch (e) { 
        
    }
    return <div className='border-t border-inherent mt-[15px] pt-[15px] h-full'>
                <Breadcrumb links={[
                {
                    label: "Projets Tutorés",
                    link: "/apps/isp_stage/projets-tutores"
                }
            ]} />
                <div className="flex items-start">
                    <div className='flex flex-col flex-1'>
                        <p className='font-semibold text-[20px] m-0'>Projets Tutorés</p>
                        {/* <p className='text-[13px] text-gray-400'>{count} mémoires</p> */}
                    </div>
                </div> 
                <ListProjetTutores {...props} />
        </div>
}