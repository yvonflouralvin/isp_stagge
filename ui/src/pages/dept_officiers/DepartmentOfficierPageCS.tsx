'use client'
import React from 'react'
import { PageProps } from "@/lib/shared/types/config";
import Link from "next/link";
import { PlusIcon, SearchIcon } from "lucide-react";
import api from '@/lib/network/api';
import cookies from '@/lib/shared/cookies';
import useEvent from '@/lib/hooks/useEvent';
import { Pagination, Spinner } from '@nextui-org/react';
import { DepartmentOfficier } from '../../types';



export default function DepartmentOfficierPageCS(props: PageProps) {
    const [total_pages, setTotal_pages] = React.useState(0);
    const [counts, setCount] = React.useState(0);
    const [results, setResults] = React.useState<any[]>([]);
    const [current_page, setCurrent_page] = React.useState(1);
    const [isSearching, setIsSearching] = React.useState(false)

    const load = async (page: number, search?: string) => {
        const url = `/isp_stage/dept-recherche-officier/?page=${page}${search !== undefined ? `&search=${search}` : ""}`
        try {
            const tmp = await api(cookies).get(url);
            setResults(tmp.data.results);
            setCount(tmp.data.count);
            setTotal_pages(tmp.data.total_pages)
        } catch (e) {

        }
    }


    const handleSearch = async () => {
        const input_value: any = document.getElementById("search-input")
        setIsSearching(true)
        await load(1, input_value.value)
        setIsSearching(false)
    }

    const { } = useEvent((eventId, { }) => {
        if (eventId === "list-department-officier-creation") load(total_pages)
    }, ["list-department-officier-creation"]);

    React.useEffect(() => {
        load(current_page);
    }, [current_page])

    return <>

        <div className='w-full h-full'>
            <div className="flex items-start">
                <div className='flex flex-col flex-1'>
                    <p className='font-semibold text-[20px] m-0'>Responsables à la Recherche des Départements</p>
                    <p className='text-gray-500 font-light m-0 text-[13px]'>{counts} responsables</p>
                </div>
                <div>
                    <Link href="/apps/isp_stage/dept_search_off/create" className='duration-300 flex items-center gap-[2px] text-[13px] text-white font-bold cursor-pointer rounded py-[5px] px-[15px] bg-primary/80 hover:bg-primary'>
                        <PlusIcon size={"12px"} color='white' />
                        <p>Nouveau</p>
                    </Link>
                </div>
            </div>
            <div className="mt-[10px]">
                <div>
                    <div className="flex items-center w-full bg-[rgba(0,0,0,0.03)]  px-[20px] py-[10px] rounded mb-[10px]">
                        <input id="search-input" onKeyUp={e => { if (e.key === "Enter") handleSearch() }} placeholder='Search' className='outline-none border-0 text-[13px] bg-transparent text-gray-500 flex-1' />
                        {
                            isSearching === true ? <Spinner size='sm' /> : <SearchIcon size="13px" onClick={handleSearch} className="cursor-pointer" />
                        }
                    </div>
                    <div>
                        <div className="flex gap-[2px] px-[20px] py-[10px] bg-[rgba(0,0,0,0.03)] font-light  my-[3px] rounded ">
                            <p className="w-[50%]">Nom complet </p>
                            <p className="w-[25%]">Département</p>
                        </div>
                        {
                            results.map((item: DepartmentOfficier, index) => {
                                return <Link href={`/apps/isp_stage/dept_search_off/${item.id}`} key={item.id} className="duration-300 flex gap-[2px] text-[13px] text-gray-500 px-[20px] py-[6px] my-[3px] cursor-pointer hover:bg-[rgba(0,0,0,0.02)] border-b border-inherent">
                                    <p className="w-[50%]">{item.employee.fullname}</p>
                                    <p className="w-[25%]">{item.dept?.libelle}</p>
                                </Link>
                            })
                        }
                    </div>
                    <div className="mt-[10px]">
                        {(total_pages > 1) && <Pagination total={total_pages} page={current_page} onChange={setCurrent_page} />}
                    </div>
                </div>
            </div>
        </div>

    </>
}