'use client'
import React from 'react'
import { PageProps } from "@/lib/shared/types/config";
import {
    Accordion,
    AccordionItem
} from '@nextui-org/react'
import Breadcrumb from '@/components/ui/Breadcrumb';
import Link from 'next/link';
interface Props {
    reports: any
}
export default function ReportsForDepartmentOfficier(props: Props) {

    const breadcrumb: any[] = [
        {
            label: "Rapports"
        }
    ]
    return <>
        <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
            <Breadcrumb links={breadcrumb} />
            <div className="flex items-start">
                <div className='flex flex-col flex-1'>
                    <p className='font-semibold text-[20px] m-0'>Rapports</p>
                </div>
            </div>
            <Accordion>
                <AccordionItem key="4" aria-label="directors-reports" title="Rapport des Directeurs" subtitle={`Directeurs (${props.reports.directors.count})`}>
                    <div className='w-full'>
                        <div className='duration-300 hidden bg-primary/30 sm:flex flex-col sm:flex-row items-center py-[4px] px-[15px]'>
                            <p className='w-full sm:w-[70%] sm:text-[13px] text-[14px] text-black sm:text-gray-500'>Directeur</p>
                            <div className='flex items-center w-full sm:w-[30%]'>
                                <p className='flex-1 text-[13px] text-gray-500'>Projets</p>
                                <p className='flex-1 text-[13px] text-gray-500'>Mémoires</p>
                            </div>
                        </div>
                        <div className='flex flex-col items-start w-full divide-y-1 divide-y-gray-400'>
                            {
                                props.reports.directors.directors.map((director: any, index: number) => {
                                    return <Link href={`/apps/isp_stage/reports/director/${director.employee_id}`} key={index + 1} className='duration-300 hover:bg-primary/10 w-full flex flex-col sm:flex-row items-center py-[4px] px-[15px]'>
                                        <p className='w-full sm:w-[70%] sm:text-[13px] text-[14px] text-black sm:text-gray-500'>{director.employee}</p>
                                        <div className='flex  sm:flex-row flex-col items-start w-full sm:w-[30%]'>
                                            <p className='flex-1 text-[13px] flex gap-[4px] text-gray-500'><span className='sm:hidden flex'>Projets :</span>{director.projets_tutores}</p>
                                            <p className='flex-1 text-[13px] flex gap-[4px] text-gray-500'><span className='sm:hidden flex'>Mémoire :</span>{director.memoires}</p>
                                        </div>
                                    </Link>
                                })
                            }
                        </div>
                    </div>
                </AccordionItem>
            </Accordion>
        </div>
    </>


}