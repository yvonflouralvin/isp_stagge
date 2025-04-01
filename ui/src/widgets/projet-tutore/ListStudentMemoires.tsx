'use client'
import React from 'react';
import { Pagination } from '@nextui-org/react'
import {  StudentMemoire } from '../../types'
import { SearchIcon } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/network/api';
import cookies from '@/lib/shared/cookies';
import TabView from '@/components/TabView'
import ListView from '@/components/ListView'
import { PageProps } from '@/lib/shared/types/config';
import { Student } from '/addons/uscitech_academy/ui/src/types';

interface Props extends PageProps {

}
export default function ListStudentMemoires(props: Props) {

    const [total_pages, setTotal_pages] = React.useState(0);
    const [count, setCount] = React.useState(0);
    const [results, setResults] = React.useState([]);
    const [current_page, setCurrent_page] = React.useState(1);
    const [selectedTab, setSelectedTab] = React.useState<any>(1)

    const load = async () => {
        const url = `/isp_stage/students-memoires/?page=${current_page}`
        try {
            const tmp = await api(cookies).get(url);
            setResults(tmp.data.results);
            setCount(tmp.data.count);
            setTotal_pages(tmp.data.total_pages)
        } catch (e) {

        }
    }

    React.useEffect(() => {
        load();
    }, [current_page])

    return <div className='border-t border-inherent mt-[15px] pt-[15px] h-full'>
                <div className="flex items-start">
                    <div className='flex flex-col flex-1'>
                        <p className='font-semibold text-[20px] m-0'>Mémoires</p>
                        {/* <p className='text-[13px] text-gray-400'>{count} mémoires</p> */}
                    </div>
                </div>
                {
                    props.user.permissions.find((perm:string)=> perm === "isp_departement_officier") ?  <>
                    <TabView tabs={[
                        {key:1, label:"Liste Memoires"},
                        {key:2, label:"Etudiants Restants"}
                    ]} onChange={(e)=>setSelectedTab(e)} />
    
                    <div className="mt-[10px]">
                        {
                            selectedTab === 1 ? <ListMemoire current_page={current_page} results={results} setCurrent_page={setCurrent_page} total_pages={total_pages}/> : <><ListStudentWithoutMemoire {...props}/></>
                        }
                    </div>
    
                    </> : <>
                    <ListMemoire current_page={current_page} results={results} setCurrent_page={setCurrent_page} total_pages={total_pages}/>
                </> 
                }

            </div>
}

interface ListMemoireProps {
    results: StudentMemoire[]
    total_pages: number
    current_page: number
    setCurrent_page: (e: number) => any
}
const ListMemoire = (props: ListMemoireProps)=>{
    return <div>
                <div className="flex items-center w-full bg-[rgba(0,0,0,0.03)]  px-[20px] py-[10px] rounded mb-[10px]">
                    <input placeholder='Search' className='outline-none border-0 text-[13px] bg-transparent text-gray-500 flex-1' />
                    <SearchIcon size="13px" className="cursor-pointer" />
                </div>
                <div>
                    <div className="flex gap-[2px] px-[20px] py-[10px] bg-[rgba(0,0,0,0.03)] font-light  my-[3px] rounded ">
                        <p className="w-[50%]">Sujet du groupe</p>
                        {/* <p className="w-[25%]">Professeur</p> */}
                        <p className="w-[25%]">Etudiant</p>
                        <p className="w-[25%]">Directeur</p>
                    </div>
                    {
                        props.results.map((subject: StudentMemoire, index) => {
                            return <Link href={`/apps/isp_stage/students-memoires/${subject.id}`} key={subject.id} className="duration-300 flex gap-[2px] text-[13px] text-gray-500 px-[20px] py-[6px] my-[3px] cursor-pointer hover:bg-[0,0,0,0.02]">
                                <p className="w-[50%]">{subject.subject}</p>
                                {/* <p className="w-[25%]">{subject.teacher}</p> */}
                                <p className="w-[25%]">{`${subject.student.user.name} ${subject.student.user.last_name} ${subject.student.user.first_name}`}</p>
                                <p className="w-[25%]">{`${subject.director ? subject.director?.employee.fullname : "--"}`}</p>
                            </Link>
                        })
                    }
                </div>
                {
                    props.total_pages > 1 && <div>
                        <Pagination total={props.total_pages} page={props.current_page} onChange={props.setCurrent_page} />
                    </div>
                }
            </div>
}

interface ListStudentWithoutMemoireProps extends Props {

}
const ListStudentWithoutMemoire = (props: ListStudentWithoutMemoireProps)=>{
    return <ListView 
        {...props}
        breadcrumb={[]}
        renderRow={(e: Student)=> {
            return <p>{e.user.name} {e.user.last_name} {e.user.first_name}</p>
        }}
        subtitle={e => ``}
        title=''
        url='/isp_stage/dept-recherche-officier/student_without_memoires/'
        showBreadcrumb={false}
        padding={false}
        showTitle={false}
    />
}