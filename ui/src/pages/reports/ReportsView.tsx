'use client'

import React from 'react'
import { PageProps } from "@/lib/shared/types/config";
import {
    Accordion,
    AccordionItem
} from '@nextui-org/react' 
import Breadcrumb from '@/components/ui/Breadcrumb';

interface Props {
    reports: any
}
export default function ReportsView(props: Props) {

    const breadcrumb: any [] = [
        {
            label:"Rapports"
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
                <AccordionItem key="1" aria-label="stage-reports" title="Rapport des Stage" subtitle={`Total (${props.reports.stages.count}) | Impregnation(${props.reports.stages.impregnation}) | Pédagogique(${props.reports.stages.pedagogique})`}>
                    <div className='w-full'>
                        <div className='duration-300 hidden bg-primary/30 sm:flex flex-col sm:flex-row items-center py-[4px] px-[15px]'>
                            <p className='w-full sm:w-[70%] sm:text-[13px] text-[14px] text-black sm:text-gray-500'>Départements</p>
                            <div className='flex items-start w-full sm:w-[30%]'>
                                <p className='flex-1 text-[13px] text-gray-500 '>Impregnation</p>
                                <p className='flex-1 text-[13px] text-gray-500 '>Pédagogique</p>
                                <p className='flex-1 text-[13px] text-gray-500 '>Entreprise</p>
                            </div>
                        </div>
                        <div className='flex flex-col divide-y-1 divide-y-gray-400'>
                            {
                                props.reports.stages.departments.map((dept: any, index: number) => {
                                    return <div key={index + 1} className='duration-300 hover:bg-primary/10 flex flex-col sm:flex-row items-center py-[4px] px-[15px]'>
                                        <p className='w-full sm:w-[70%] sm:text-[13px] text-[14px] text-black sm:text-gray-500'>{dept.grade_classe}</p>
                                        <div className='flex sm:flex-row flex-col items-start w-full sm:w-[30%]'>
                                            <p className='flex-1 text-[13px] flex gap-[4px] text-gray-500'><span className='sm:hidden flex'>Imppregnation :</span>{dept.impregnation}</p>
                                            <p className='flex-1 text-[13px] flex gap-[4px] text-gray-500'><span className='sm:hidden flex'>Pédagogique :</span>{dept.pedagogique}</p>
                                            <p className='flex-1 text-[13px] flex gap-[4px] text-gray-500'><span className='sm:hidden flex'>Entreprise :</span>{dept.entreprise}</p>
                                        </div>
                                    </div>
                                })
                            }
                        </div>
                    </div>

                </AccordionItem>
                <AccordionItem key="2" aria-label="students-reports" title="Rapport des Étudiants" subtitle={`Total (${props.reports.students.count})`}>
                        <div className='w-full'>
                            <div className='duration-300 hidden bg-primary/30 sm:flex flex-col sm:flex-row items-center py-[4px] px-[15px]'>
                                <p className='w-full sm:w-[70%] sm:text-[13px] text-[14px] text-black sm:text-gray-500'>Départements</p>
                                <div className='flex items-center w-full sm:w-[30%]'>
                                    <p className='flex-1 text-[13px] text-gray-500'>L1</p>
                                    <p className='flex-1 text-[13px] text-gray-500'>L2</p>
                                    <p className='flex-1 text-[13px] text-gray-500'>L3</p>
                                </div>
                            </div>
                            <div className='flex flex-col divide-y-1 divide-y-gray-400'>
                                {
                                    props.reports.students.departements.map((dept: any, index: number) => {
                                        return <div key={index + 1} className='duration-300 hover:bg-primary/10 flex flex-col sm:flex-row items-center py-[4px] px-[15px]'>
                                            <p className='w-full  sm:w-[70%] sm:text-[13px] text-[14px] text-black sm:text-gray-500'>{dept.department}</p>
                                            <div className='flex sm:flex-row flex-col items-start w-full sm:w-[30%]'>
                                                <p className='flex-1 text-[13px] flex gap-[4px] text-gray-500'><span className='sm:hidden flex'>L1 (</span> {dept.promotions.find((pro: any) => pro.promotion === "L1") ? dept.promotions.find((pro: any) => pro.promotion === "L1").student_count : 0})</p>
                                                <p className='flex-1 text-[13px] flex gap-[4px] text-gray-500'><span className='sm:hidden flex'>L2 (</span> {dept.promotions.find((pro: any) => pro.promotion === "L2") ? dept.promotions.find((pro: any) => pro.promotion === "L2").student_count : 0})</p>
                                                <p className='flex-1 text-[13px] flex gap-[4px] text-gray-500'><span className='sm:hidden flex'>L3 (</span>{dept.promotions.find((pro: any) => pro.promotion === "L3") ? dept.promotions.find((pro: any) => pro.promotion === "L3") .student_count : 0})</p> 
                                            </div>
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                    </AccordionItem>
                     <AccordionItem key="3" aria-label="projects-reports" title="Rapport des Projets & Memoires" subtitle={`Projets (${props.reports.projets_memoires.projets}) | Memoires (${props.reports.projets_memoires.memoires})`}>
                        <div className='w-full'>
                            <div className='duration-300 hidden bg-primary/30 sm:flex flex-col sm:flex-row items-center py-[4px] px-[15px]'>
                                <p className='w-full sm:w-[70%] sm:text-[13px] text-[14px] text-black sm:text-gray-500'>Départements</p>
                                <div className='flex items-center w-full sm:w-[30%]'>
                                    <p className='flex-1 text-[13px] text-gray-500'>Projets</p>
                                    <p className='flex-1 text-[13px] text-gray-500'>Mémoires</p>
                                </div>
                            </div>
                            <div className='flex flex-col w-full items-start divide-y-1 divide-y-gray-400'>
                                {
                                    props.reports.projets_memoires.departments.map((dept: any, index: number) => {
                                        return <div key={index + 1} className='duration-300 w-full hover:bg-primary/10 flex flex-col sm:flex-row items-center py-[4px] px-[15px]'>
                                            <p className='w-full sm:w-[70%] sm:text-[13px] text-[14px] text-black sm:text-gray-500'>{dept.grade_classe}</p>
                                            <div className='flex  sm:flex-row flex-col items-start w-full sm:w-[30%]'>
                                                <p className='flex-1 text-[13px] flex gap-[4px] text-gray-500'><span className='sm:hidden flex'>Projets :</span>{dept.projets_tutores}</p>
                                                <p className='flex-1 text-[13px] flex gap-[4px] text-gray-500'><span className='sm:hidden flex'>Memoires :</span>{dept.memoires}</p>
                                            </div>
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                    </AccordionItem>
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
                                        return <div key={index + 1} className='duration-300 hover:bg-primary/10 w-full flex flex-col sm:flex-row items-center py-[4px] px-[15px]'>
                                            <p className='w-full sm:w-[70%] sm:text-[13px] text-[14px] text-black sm:text-gray-500'>{director.employee}</p>
                                            <div className='flex  sm:flex-row flex-col items-start w-full sm:w-[30%]'>
                                                <p className='flex-1 text-[13px] flex gap-[4px] text-gray-500'><span className='sm:hidden flex'>Projets :</span>{director.projets_tutores}</p>
                                                <p className='flex-1 text-[13px] flex gap-[4px] text-gray-500'><span className='sm:hidden flex'>Mémoire :</span>{director.memoires}</p>
                                            </div>
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                    </AccordionItem>
            </Accordion>
        </div>
    </>

}