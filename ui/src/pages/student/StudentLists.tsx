'use client'

import { PageProps } from "@/lib/shared/types/config";
import { Accordion, AccordionItem } from "@nextui-org/react";
import StudentList from "./StudentList";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import StudentUploadLists from "./StudentUploadLists";
import React from "react";
import { Promotion } from "/addons/uscitech_academy/ui/src/types";

interface Props extends PageProps {
    stats: {
        count: number;
        l2as: number;
        l2lmd: number;
        l3lmd: number;
    }
    promotions: Promotion[]
}
export default function StudentLists(props: Props) {
    const [count, setCount] = React.useState(0)
    const page_size = 50
    return <div className="border-t border-inherent mt-[15px] pt-[15px] h-full">
        <div className="flex items-start">
            <div className='flex flex-col flex-1'>
                <p className='font-semibold text-[20px] m-0'>Étudiants</p>
                <p className='text-gray-500 font-light m-0 text-[13px]'>{props.stats.count} enregistrement{props.stats.count > 1 ? "s" : ""}</p>
            </div>
            <div className="flex gap-[5px] items-center">
                {
                    props.user.is_superuser === true && <>
                    <Link href="/apps/isp_stage/students/create" className='duration-300 flex items-center gap-[2px] text-[13px] text-white font-bold cursor-pointer rounded py-[5px] px-[15px] bg-primary/80 hover:bg-primary'>
                    <PlusIcon size={"12px"} color='white' />
                    <p>Nouveau</p>
                </Link>
                <StudentUploadLists {...props} />
                    </>
                }
            </div>
        </div>
        <Accordion>
            {
                props.promotions.map((promotion)=>{
                    return <AccordionItem key={promotion.id} aria-label={`${promotion.libelle} ${(promotion.option !== undefined && promotion.option !== null) ? `/ Option: ${promotion.option}` : ""}`} title={`${promotion.libelle} ${(promotion.option !== undefined && promotion.option !== null) ? `/ Option: ${promotion.option}` : ""}`} subtitle={`${promotion.student_count} étudiants`} >
                    <StudentList filter_promotion={promotion.libelle} {...props} page_size={page_size} />
                </AccordionItem>
                })
            }
        </Accordion>
    </div>
}