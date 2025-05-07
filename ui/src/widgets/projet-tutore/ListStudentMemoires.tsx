'use client'
import React from 'react'; 
import {  StudentMemoire } from '../../types'
import { PrinterIcon } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/network/api';
import cookies from '@/lib/shared/cookies';
import TabView from '@/components/TabView'
import ListView, { ListViewLoadData } from '@/components/ListView'
import { PageProps } from '@/lib/shared/types/config';
import { Student } from '/addons/uscitech_academy/ui/src/types';

interface Props extends PageProps {

}
export default function ListStudentMemoires(props: Props) {

    const [total_pages, setTotal_pages] = React.useState(0);
    const [count, setCount] = React.useState(0);
    const [results, setResults] = React.useState([]);
    const [current_page, setCurrent_page] = React.useState(1);
    const [selectedTab, setSelectedTab] = React.useState<any>(1);

    const [totals, setTotals] = React.useState<{list:number, rest:number}>({list:-1, rest: -1}) 

    const load = async () => {
        const url = `/isp_stage/students-memoires/?page=${current_page}`
        try {
            const tmp = await api(cookies).get(url);
            setResults(tmp.data.results);
            setCount(tmp.data.count);
            setTotal_pages(tmp.data.total_pages)
            setTotals({
                ...totals,
                list: tmp.data.count
            })
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
                        {key:1, label:`Liste Memoires ${totals.list >= 0 ? `(${totals.list})` : ""}`},
                        {key:2, label:`Etudiants Restants ${totals.rest >= 0 ? `(${totals.rest})` : ""}`}
                    ]} onChange={(e)=>setSelectedTab(e)} />
    
                    <div className="mt-[10px]">
                        {
                            selectedTab === 1 ? <ListMemoire {...props} onLoaded={(data)=> setTotals({...totals, list: data.count})}/> : <><ListStudentWithoutMemoire {...props} onLoaded={(data)=> setTotals({...totals, rest: data.count})}/></>
                        }
                    </div>
    
                    </> : <>
                    <ListMemoire {...props} onLoaded={(data)=> setTotals({...totals, list: data.count})}/>
                </> 
                }

            </div>
}

interface ListMemoireProps extends Props {
    onLoaded: (data: ListViewLoadData) => any
}
const ListMemoire = (props: ListMemoireProps)=>{
    return  <ListView 
        {...props}
        className='p-0'
        breadcrumb={[]}
        renderRow={(student: StudentMemoire)=> {
            return <Link href={`/apps/isp_stage/students-memoires/${student.id}`} key={student.id} className="duration-300 flex gap-[2px] text-[13px] text-gray-500 px-[20px] py-[6px] my-[3px] cursor-pointer hover:bg-[0,0,0,0.02] w-full">
                        <p className="w-[50%]">{student.subject}</p> 
                        <p className="w-[25%]">{`${student.student.user.name} ${student.student.user.last_name} ${student.student.user.first_name}`}</p>
                        <p className="w-[25%]">{`${student.director ? student.director?.employee.fullname : "--"}`}</p>
                    </Link>
        }}
        subtitle={e => ``}
        title=''
        url='/isp_stage/students-memoires/'
        showBreadcrumb={false}
        padding={false}
        showTitle={false}
    />
}

interface ListStudentWithoutMemoireProps extends Props {
    onLoaded: (data: ListViewLoadData) => any
}
const ListStudentWithoutMemoire = (props: ListStudentWithoutMemoireProps)=>{
    return <div className='w-full'>
        <ListView 
        {...props}
        className='p-0'
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
    <Link href={`/apps/isp_stage/students-memoires/printing/rest`} className='flex gap-[10px] mt-[10px]'>Imprimer <PrinterIcon size={"13px"}/></Link>
    </div>
}