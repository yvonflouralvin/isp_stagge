'use client'
import { PageProps } from "@/lib/shared/types/config"; 
import QuoteField, { quoteFields } from "./QuoteField";
import Link from "next/link";

interface Props extends PageProps {
    stages: any[]
    stagemaster: any
}


export default function ListStageForStageMaster(props: Props) {
    const wrapper = (e: any, children: React.ReactNode)=>{
        const className = `duration-300 hover:bg-[rgba(0,0,0,0.03)] w-full flex items-center cursor-pointer`
        if(props.params.app[3] === "cotations") {
            return <div className={className} key={e.id}>
                {children}
            </div>
        }else{
            return <Link 
                key={e.id}
                href={`/apps/isp_stage/${props.params.app[2]}/${e.id}`} 
                className={className}>
                    {children}
            </Link>
        }
    }
    return <>
         <div className='shadow-0 w-full overflow-y-scroll'>
            <div className=" 
                items-end 
                w-full 
                flex  
                border-b
                border-black
                text-black 
                font-semibold  
                h-[150px]">
                <p className="flex-1 px-[15px] text-[13px] ">NOMS & POST-NOMS</p>  
                {
                    quoteFields.filter(field => field.stage === props.params.app[2]).map((field)=>{
                        return <div key={field.index} className=" 
                            border-l border-black flex items-center justify-center text-center h-[150px] w-[41px]
                        ">
                            <p 
                                className=" 
                                   text-[11px] px-[5px] text-right flex items-center justify-center h-full w-[200px] rotate-[-90deg] whitespace-nowrap
                                    m-0
                                ">
                            {field.label}/{field.max}</p>
                        </div>
                    })
                }
            </div>
            <div className="flex flex-col  w-full border-b border-black divide-y-[1px] divide-black">
                {
                    props.stages.map((stage, index) => {
                        return  wrapper(stage, <>
                            <p className="flex-1 px-[15px] text-[13px] text-gray-500">{ (props.params.app.length === 6 && props.params.app[5] === "printing") ? `${index+1}. ` : ""}{stage.student.user?.name} {stage.student.user?.last_name}</p>  
                            <QuoteField {...props} stage={stage} />
                        </>)
                    })
                }
            </div>
            </div>
    </>
}