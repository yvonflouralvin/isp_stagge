'use client'

import { useRouter } from "next/navigation"
import ListStages from "./ListStages"
import { PageProps } from "@/lib/shared/types/config"

interface Props extends PageProps {
    type_stage: string
    promotions: any
    promotion: any
    user: any
    filtering_promotions: any[]
    stagemaster: any
}
export default function ListStageServerComponents(props: Props) {
    const router = useRouter()

    return <ListStages {...props} stage={props.type_stage} onClickItem={(e: any) => {
        router.push(`/apps/isp_stage/${props.type_stage}/${e.id}`)
    }} />
}