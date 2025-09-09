import { PageProps } from "@/lib/shared/types/config";  
import { StageMaster } from "../../../types";
import Link from "next/link";

interface Props extends PageProps {
    stages: any[]
    stagemaster: any
}

export default function ListStageForDeptResearcher(props: Props) {
    return <>
        <div className='shadow-0'>
            <div className="
                divide-x-[1px] divide-black
                sm:flex 
                hidden 
                items-end 
                text-black 
                font-semibold 
                text-[13px]">
                <p className="flex-1">Nom Complet</p> 
                <p className="flex-1">Facture</p>
                <p className="flex-1">Maitre de Stage</p>
                {/* <p className="flex-1">Cote</p> */}
            </div>
            <div className="flex flex-col  w-full border-b border-black divide-y-[1px] divide-black">
                {
                    props.stages.map(stage => {
                        var stage_master = ``
                        stage.stagemaster.map((sm:StageMaster)=>{
                            if(stage_master !== ``) stage_master = `, `
                            stage_master = `${sm.employee?.fullname}`
                        })
                        return (
                            <Link  
                                key={stage.id}
                                href={`/apps/isp_stage/${props.params.app[2]}/${stage.id}`} 
                                className='duration-300 hover:bg-[rgba(0,0,0,0.03)] flex cursor-pointer w-full  px-[15px] py-[7px]'>
                                <p  className="flex-1">{stage.student.user?.name} {stage.student.user?.last_name}</p> 
                                <p  className="flex-1">{stage.facture}</p>
                                <p  className="flex-1">{stage_master}</p>
                                {/* <p  className="flex-1">{stage.quote_status !== "submitted" ? "---" : `${stage.quote}`}</p> */}
                            </Link> 
                        )
                    })
                }
            </div>
        </div>
    </>
}