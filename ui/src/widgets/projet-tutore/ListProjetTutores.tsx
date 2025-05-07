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
import ListView, { ListViewLoadData } from '@/components/ListView';
import TabView from '@/components/TabView';
import { Student } from '/addons/uscitech_academy/ui/src/types';

interface Props extends PageProps {
    department_settings?: DepartmentSettings
}
export default function ListProjetTutores(props: Props) {
    const [selectedTab, setSelectedTab] = React.useState(1);
    const [totals, setTotals] = React.useState({list: 0, rest: 0});

    return <>
        {
            props.user.permissions.find((perm:string)=> perm === "isp_departement_officier") ?  <>
            <TabView tabs={[
                {key:1, label:`Liste Memoires ${totals.list >= 0 ? `(${totals.list})` : ""}`},
                {key:2, label:`Etudiants Restants ${totals.rest >= 0 ? `(${totals.rest})` : ""}`}
            ]} onChange={(e)=>setSelectedTab(Number(e))} />

            <div className="mt-[10px]">
                {
                    selectedTab === 1 ? <ListAllProjetTutores {...props} onLoaded={(data)=> setTotals({...totals, list: data.count})}/> : <><ListStudentWithoutProjetTutore {...props} onLoaded={(data)=> setTotals({...totals, rest: data.count})}/></>
                }
            </div>

            </> : <>
            <ListAllProjetTutores {...props} onLoaded={(data)=> setTotals({...totals, list: data.count})}/>
        </> 
        }
    </>
   
}

interface ListStudentWithoutProjetTutoreProps extends Props {
    onLoaded: (data: ListViewLoadData) => any
}

const ListStudentWithoutProjetTutore = (props: ListStudentWithoutProjetTutoreProps) => {
    return <>
         <ListView
        {...props}
        showBreadcrumb={false}
        breadcrumb={[]}
        showTitle={false}
        renderColumns={() => {
            return <div className="sm:flex hidden  flex-col md:flex-row gap-[5px] font-light  my-[3px] rounded w-full">
                <p className="w-[100%] sm:w-[50%]">Nom et Prénom</p>
                {/* <p className="w-[25%]">Professeur</p> */}
                <div className='flex flex-col sm:flex-row items-center gap-[5px] w-[50%]'>
                    <p className="w-[50%]">Téléphone</p>
                    <p className="w-[50%]">Email</p>
                </div>
            </div>
        }}
        renderRow={(student: Student) => {
            return <Link href={`/apps/isp_stage/projets-tutores/${student.id}`} key={student.id} className="duration-300 flex flex-col md:flex-row gap-[5px] text-[13px] text-gray-500 px-[20px] py-[6px] my-[3px] cursor-pointer hover:bg-[0,0,0,0.02] w-full">
                <p className="w-[100%] md:w-[50%]">{student.user.name} {student.user.last_name} {student.user.first_name}</p>
                {/* <p className="w-[50%]">{student.teacher}</p> */}
                <div className='flex w-[100%]  md:w-[50%] flex-col  sm:flex-row items-start sm:items-center gap-[5px]'>
                    <p className='sm:hidden flex text-[13px] text-gray-400 mt-[7px] font-semibold'>{student.user.name} {student.user.last_name} {student.user.first_name}</p>
                    <p className="w-[100%] sm:w-[50%]">{`${student.user.phone}`}</p> 
                    <p className="w-[100%] sm:w-[50%]">{`${student.user.email}`}</p>
                </div>
            </Link>
        }}
        subtitle={(projects: ProjetTutore[]) => `${projects.length} projets`}
        title='Projets Tutorés'
        url={`/isp_stage/projets-tutores/student-without-project/`}
    />
    </>
}

interface ListAllProjetTutoresProps extends Props {
    onLoaded: (data: ListViewLoadData) => any
}

const ListAllProjetTutores = (props: ListAllProjetTutoresProps) => {
    return <>
    <ListView
        {...props}
        showBreadcrumb={false}
        breadcrumb={[]}
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