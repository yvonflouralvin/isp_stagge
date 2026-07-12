import React from 'react'
import { PageProps } from "@/lib/shared/types/config";
import Breadcrumb from '@/components/ui/Breadcrumb';
import PaymentsLists from './PaymentsLists';

export default async function PaymentsPage(props: PageProps){
    const breadcrumb: any [] = [
        {
            label:"Paiements"
        }
    ] 

    return   <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
                <Breadcrumb links={breadcrumb} /> 
                <div className="flex items-start">
                    <div className='flex flex-col flex-1'>
                        <p className='font-semibold text-[20px] m-0'>Paiements</p> 
                    </div>
                </div>
                <PaymentsLists />
            </div>
}