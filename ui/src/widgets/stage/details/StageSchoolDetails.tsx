'use client'

import { User } from "@/lib/shared/types"
import StageInfoFieldChange from "../StageInfoFieldChange"
import SectionTitle from "./SectionTitle"
import StudentDetails from "./StudentDetails"

interface Props {
    stage: any
    user: User
}
export default function StageSchoolDetails(props: Props) {
    const DetailItem = (props: {
        label: string
        stage: any
        index: string,
        user: User
    })=>{
        if (props.user.permissions.find((p:string)=> p === "isp_user_student"))
        return <StudentDetails label={props.label} value={
            <StageInfoFieldChange
                onRender={(e: any) => <p>{e ? e : "---"}</p>}
                index={props.index}
                label={props.label}
                stage={props.stage}
                type="text"
                value={props.stage[props.index]}
                onPost={(e: any) => { }}
            />
        } />
        else
            return <p>{props.label} : {props.stage[props.index] ? props.stage[props.index] : "---"}</p>
    }

    return <>
 
        <SectionTitle text={"Détails de l'école de Stage"} />

        <DetailItem index="institution" label="Ecole de Stage" stage={props.stage} user={props.user} />
        <DetailItem index="institution_address" label="Adresse de l'école" stage={props.stage} user={props.user} />
        <DetailItem index="institution_provisor" label="Nom du Proviseur/Prefet" stage={props.stage} user={props.user} />
        <DetailItem index="institution_provisor_provisor" label="Contact du Proviseur/Prefet" stage={props.stage} user={props.user} />
    
    </>
}