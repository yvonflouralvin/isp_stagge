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

interface Props extends PageProps {
    department_settings?: DepartmentSettings
}
export default function ListProjetTutores(props: Props) {

    const [total_pages, setTotal_pages] = React.useState(0);
    const [count, setCount] = React.useState(0);
    const [results, setResults] = React.useState([]);
    const [current_page, setCurrent_page] = React.useState(1);

    const load = async () => {
        const url = `/isp_stage/projets-tutores/?page=${current_page}`
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
                <p className='font-semibold text-[20px] m-0'>Projets Tutorés</p>
                <p className='text-gray-500 font-light m-0 text-[13px]'>{count} projets</p>
            </div>
        </div>
        <div className="mt-[10px]"><div>
            <div className="flex items-center w-full bg-[rgba(0,0,0,0.03)]  px-[20px] py-[10px] rounded mb-[10px]">
                <input placeholder='Search' className='outline-none border-0 text-[13px] bg-transparent text-gray-500 flex-1' />
                <SearchIcon size="13px" className="cursor-pointer" />
            </div>
            <div>
                <div className="sm:flex hidden  flex-col md:flex-row gap-[5px] px-[20px] py-[10px] bg-[rgba(0,0,0,0.03)] font-light  my-[3px] rounded ">
                    <p className="w-[100%] sm:w-[50%]">Sujet du groupe</p>
                    {/* <p className="w-[25%]">Professeur</p> */}
                    <div className='flex flex-col sm:flex-row items-center gap-[5px] w-[50%]'>
                        <p className="w-[50%]">Chef de groupe</p>
                        <p className="w-[50%]">Directeur</p>
                    </div>
                </div>
                {
                    results.map((subject: ProjetTutore, index) => {
                        return <Link href={`/apps/isp_stage/projets-tutores/${subject.id}`} key={subject.id} className="duration-300 border-b border-inherent flex flex-col md:flex-row gap-[5px] text-[13px] text-gray-500 px-[20px] py-[6px] my-[3px] cursor-pointer hover:bg-[0,0,0,0.02]">
                            <p className="w-[100%] md:w-[50%]">{subject.subject}</p>
                            {/* <p className="w-[50%]">{subject.teacher}</p> */}
                            <div className='flex w-[100%]  md:w-[50%] flex-col  sm:flex-row items-start sm:items-center gap-[5px]'>
                                <p className='sm:hidden flex text-[13px] text-gray-400 mt-[7px] font-semibold'>Chef de groupe</p>
                                <p className="w-[100%] sm:w-[50%]">{`${subject.head.user.name} ${subject.head.user.last_name} ${subject.head.user.first_name}`}</p>
                                <p className='sm:hidden flex text-[13px] text-gray-400 mt-[7px] font-semibold'>Directeur</p>
                                <p className="w-[100%] sm:w-[50%]">{`${subject.director ? subject.director?.employee.fullname : "--"}`}</p>
                            </div>
                        </Link>
                    })
                }
            </div>
            {
                total_pages > 1 && <div>
                    <Pagination total={total_pages} page={current_page} onChange={setCurrent_page} />
                </div>
            }

        </div>
        </div></div>
}