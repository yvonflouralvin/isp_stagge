'use client'

import { useRouter } from "next/navigation"
import ListStages from "./ListStages"
import { PageProps } from "@/lib/shared/types/config"
import { Accordion, AccordionItem } from "@nextui-org/react"
import { Grade } from "/addons/uscitech_academy/ui/src/types"
import { ExtendGrade } from "../../pages/StageListPage"



interface Props extends PageProps {
    type_stage: string
    promotions: any
    promotion: any
    user: any
    filtering_promotions: any[]
    stagemaster: any
    depts: ExtendGrade[]
}


export default function ListStageServerComponents(props: Props) {
    
    return <>
        {
            (props.user.is_superuser === true || props.user.permissions.find((perm: string) => perm === "isp_user_stage_master")) ? <>
                <Accordion>
                    {
                        props.depts.map((grade: ExtendGrade)=>{
                            return  <AccordionItem key={grade.id} aria-label={grade.libelle} title={`${grade.libelle} (${grade.grade?.libelle})`} subtitle={`${grade.stage_count} stages`}>
                                <ListStages {...props} stage={props.type_stage} grade={grade} />
                            </AccordionItem>
                        })
                    }
                </Accordion>
            </> : <>
            {
            (props.user.is_superuser !== true && props.user.permissions.find((perm: string) => perm === "isp_departement_officier")) ? <>
                <ListStages {...props} stage={props.type_stage} grade={props.depts[0]}  />              
            </> : <>
                
            </> 
        }
            </> 
        } 
    </>
    // return <ListStages {...props} stage={props.type_stage}  />
}