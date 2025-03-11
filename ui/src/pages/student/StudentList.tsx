'use client'
import React from 'react';

import { Pagination, Spinner } from '@nextui-org/react'
import { PlusIcon, SearchIcon } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/network/api';
import cookies from '@/lib/shared/cookies';
import useEvent from '@/lib/hooks/useEvent';
import { Student } from '/addons/uscitech_academy/ui/src/types';
import StudentUploadLists from './StudentUploadLists';
import { PageProps } from '@/lib/shared/types/config';

interface Props extends PageProps {
    filter_promotion?: string
    page_size?: number
}
export default function StudentList(props: Props) {

    const [total_pages, setTotal_pages] = React.useState(0);
    const [count, setCount] = React.useState(0);
    const [results, setResults] = React.useState<any[]>([]);
    const [current_page, setCurrent_page] = React.useState(1);
    const [isSearching, setIsSearching] = React.useState(false)

    const load = async (page: number, search?: string) => {
        const url = `/isp_stage/students/?page=${page}${search !== undefined ? `&search=${search}` : ""}${props.filter_promotion !== undefined ? `&filter_promotion=${props.filter_promotion}`: ""}${props.page_size !== undefined ? `&page_size=${props.page_size}`: ""}`
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
        if (eventId === "list-department-creation") load(total_pages)
    }, ["list-department-creation"]);

    React.useEffect(() => {
        load(current_page);
    }, [current_page])


    return <div className='h-full w-fll'>
        <div className="w-full h-full">
            <div>
                <div className="flex items-center w-full bg-[rgba(0,0,0,0.03)]  px-[20px] py-[10px] rounded mb-[10px]">
                    <input id="search-input" onKeyUp={e => { if (e.key === "Enter") handleSearch() }} placeholder='Search' className='outline-none border-0 text-[13px] bg-transparent text-gray-500 flex-1' />
                    {
                        isSearching === true ? <Spinner size='sm' /> : <SearchIcon size="13px" onClick={handleSearch} className="cursor-pointer" />
                    }

                </div>
                <div>
                    <div className="flex gap-[2px] px-[20px] py-[10px] bg-[rgba(0,0,0,0.03)] font-light  my-[3px] rounded ">
                        <p className="w-[50%]">Nom complet</p>
                        <p className="w-[25%]">Classe</p>
                    </div>
                    {
                        results.map((item: Student, index) => {
                            return <Link href={`/apps/isp_stage/students/${item.id}`} key={item.id} className="duration-300 flex gap-[2px] text-[13px] text-gray-500 px-[20px] py-[6px] my-[3px] cursor-pointer hover:bg-[rgba(0,0,0,0.02)] border-b border-inherent">
                                <p className="w-[50%]">{item.user?.name} {item.user?.last_name}</p>
                                <p className="w-[25%]">{item.promotion.libelle} {item.promotion.grade.libelle}</p>
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
}