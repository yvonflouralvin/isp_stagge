import React from 'react';
import { PageProps } from "@/lib/shared/types/config";
import Breadcrumb from '@/components/ui/Breadcrumb'
import { OptionIcon, Settings2Icon } from 'lucide-react';
import ListProjetTutores from '../widgets/projet-tutore/ListProjetTutores';
import ProjetTutoreOptions from '../widgets/projet-tutore/ProjetTutoreOptions';
import { DepartmentSettings } from '../types';
import api from '@/lib/network/api';
import { cookies } from 'next/headers';


export default async function ProjetTutoresPage(props: PageProps) {
    var department_settings: DepartmentSettings | undefined = undefined;
    try {
        department_settings = ((await api(await cookies()).get(`/isp_stage/department-settings/me/`)).data)
    } catch (e) { 
        
    }
    return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
        <Breadcrumb links={[
            {
                label: "Projets Tutorés",
                link: "/apps/isp_stage/projets-tutores"
            }
        ]} />
        <div className='border-t border-inherent mt-[15px] pt-[15px] h-full'>
            <div className="flex items-start">
                <div className='flex flex-col flex-1'>
                    <p className='font-semibold text-[20px] m-0'>Projets Tutorés</p>
                    {/* <p className='text-gray-500 font-light m-0 text-[13px]'>27 inscripts</p> */}
                </div>
                {
                    props.user.permissions.find(perm => perm === "isp_departement_officier") && <div>
                        <ProjetTutoreOptions department_settings={department_settings} />
                    </div>
                }

            </div>
            <div className="mt-[10px]">
                <ListProjetTutores />
            </div>
        </div>

    </div>
}