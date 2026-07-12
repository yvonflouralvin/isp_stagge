import React from 'react'
import { PageProps } from "@/lib/shared/types/config";
import Breadcrumb from '@/components/ui/Breadcrumb';
import AcademicYearLists from './AcademicYearLists';

export default async function AcademicYearPage(props: PageProps){
    const breadcrumb: any [] = [
        {
            label:"Année Academiques"
        }
    ] 

    return   <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
                <Breadcrumb links={breadcrumb} /> 
                <div className="flex items-start">
                    <div className='flex flex-col flex-1'>
                        <p className='font-semibold text-[20px] m-0'>Année Academiques</p> 
                    </div>
                </div>
                <AcademicYearLists />
            </div>
}