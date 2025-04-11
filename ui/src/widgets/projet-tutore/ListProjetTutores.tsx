'use client'
import React from 'react';
import { Pagination } from '@nextui-org/react'
import { DepartmentSettings, ProjetTutore } from '../../types'
import { SearchIcon } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/network/api';
import cookies from '@/lib/shared/cookies';
import { PageProps } from '@/lib/shared/types/config';
import ProjetTutoreOptions from './ProjetTutoreOptions';
import ListView from '@/components/ListView';

interface Props extends PageProps {
    department_settings?: DepartmentSettings
}
export default function ListProjetTutores(props: Props) {

    return <>
        <ListView
            {...props}
            breadcrumb={[
                {
                    label: "Projets Tutorés",
                    link: "/apps/isp_stage/projets-tutores"
                }
            ]}
            showTitle={false}
            renderColumns={() => {
                return <div className="sm:flex hidden  flex-col md:flex-row gap-[5px] font-light  my-[3px] rounded w-full">
                    <p className="w-[100%] sm:w-[50%]">Sujet du groupe</p>
                    {/* <p className="w-[25%]">Professeur</p> */}
                    <div className='flex flex-col sm:flex-row items-center gap-[5px] w-[50%]'>
                        <p className="w-[50%]">Chef de groupe</p>
                        <p className="w-[50%]">Directeur</p>
                    </div>
                </div>
            }}
            renderRow={(subject: ProjetTutore) => {
                return <Link href={`/apps/isp_stage/projets-tutores/${subject.id}`} key={subject.id} className="duration-300 flex flex-col md:flex-row gap-[5px] text-[13px] text-gray-500 px-[20px] py-[6px] my-[3px] cursor-pointer hover:bg-[0,0,0,0.02] w-full">
                    <p className="w-[100%] md:w-[50%]">{subject.subject}</p>
                    {/* <p className="w-[50%]">{subject.teacher}</p> */}
                    <div className='flex w-[100%]  md:w-[50%] flex-col  sm:flex-row items-start sm:items-center gap-[5px]'>
                        <p className='sm:hidden flex text-[13px] text-gray-400 mt-[7px] font-semibold'>Chef de groupe</p>
                        <p className="w-[100%] sm:w-[50%]">{`${subject.head.user.name} ${subject.head.user.last_name} ${subject.head.user.first_name}`}</p>
                        <p className='sm:hidden flex text-[13px] text-gray-400 mt-[7px] font-semibold'>Directeur</p>
                        <p className="w-[100%] sm:w-[50%]">{`${subject.director ? subject.director?.employee.fullname : "--"}`}</p>
                    </div>
                </Link>
            }}
            subtitle={(projects: ProjetTutore[]) => `${projects.length} projets`}
            title='Projets Tutorés'
            url={`/isp_stage/projets-tutores/`}
        />

    </>
}