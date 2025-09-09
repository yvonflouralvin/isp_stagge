'use client'
import React from 'react'
import HorraireHeuresWidgets from './HorraireHeuresWidgets'
import HorraireCoursWidget from './HorraireCoursWidget'
import { User } from '@/lib/shared/types'
interface Props { 
    stage: any
    prefix: string
    user: User
}
export default function StageHorraires(props: Props) {
    React.useEffect(()=>{
        console.log(props.stage.horraires)
    },[])
    const [horraires, setHorraires] = React.useState<any>(props.stage.horraires)
    return <div className={"flex w-full"}>

        <div className='w-[140px] border border-inherent'>
            <div className='w-[140px] border border-inherent'><p>Heures</p></div>
            <HorraireHeuresWidgets user={props.user} prefix={props.prefix} stage={props.stage} horraires={horraires} setValue={setHorraires}/>
        </div>
        <div className='flex flex-1 overflow-x-scroll'>
            <div className='w-[100px] border border-inherent'>
                <div className="w-[100px] border border-inherent"><p>Lundi</p></div>
                <HorraireCoursWidget user={props.user} stage={props.stage} prefix={`lundi_${props.prefix}`} horraires={horraires} setValue={setHorraires} />
            </div>
            <div className="w-[100px] border border-inherent">
                <div className="w-[100px] border border-inherent"><p>Mardi</p></div>
                <HorraireCoursWidget user={props.user} stage={props.stage} prefix={`mardi_${props.prefix}`} horraires={horraires} setValue={setHorraires}/>
            </div>
            <div className="w-[100px] border border-inherent">
                <div className="w-[100px] border border-inherent"><p>Mercredi</p></div>
                <HorraireCoursWidget user={props.user} stage={props.stage} prefix={`mercredi_${props.prefix}`} horraires={horraires} setValue={setHorraires}/>
            </div>
            <div className="w-[100px] border border-inherent">
                <div className="w-[100px] border border-inherent"><p>Jeudi</p></div>
                <HorraireCoursWidget user={props.user} stage={props.stage} prefix={`jeudi_${props.prefix}`} horraires={horraires} setValue={setHorraires}/>
            </div>
            <div className="w-[100px] border border-inherent">
                <div className="w-[100px] border border-inherent"><p>Vendredi</p></div>
                <HorraireCoursWidget user={props.user} stage={props.stage} prefix={`vendredi_${props.prefix}`} horraires={horraires} setValue={setHorraires}/>
            </div>
            <div className="w-[100px] border border-inherent">
                <div className="w-[100px] border border-inherent"><p>Samedi</p></div>
                <HorraireCoursWidget user={props.user} stage={props.stage} prefix={`samedi_${props.prefix}`} horraires={horraires} setValue={setHorraires}/>
            </div>
        </div>

    </div>
}