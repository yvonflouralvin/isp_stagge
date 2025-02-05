'use client'
import React from 'react'
import StageMaster from './StageMaster';
import StageInfoFieldChange from './StageInfoFieldChange';
import StudentDetails from './details/StudentDetails';
import SectionTitle from './details/SectionTitle';

interface Props {
    stage: any
}

export default function StageDetailsWidget(props: Props) {

    const stage = props.stage;
    return <div className='bg-white rounded p-[20px]'>
        <div>
            <p className='text-gray-500 text-[12px]'>Détails du Stage</p>
        </div>

        <SectionTitle text={"Détails de l'étudiant"} />
        <StudentDetails label={"Nom Complet"} value={<p>{stage.student?.user?.name} {stage.student?.user?.first_name} {stage.student?.user?.last_name}</p>} />
        <StudentDetails label={"Téléphone"} value={<p>{stage.student?.user?.phone}</p>} />
        <StudentDetails label={"Département"} value={<p>{stage.student?.promotion?.grade.libelle}</p>} />
        <StudentDetails label={"Promotion"} value={<p>{stage.student?.promotion?.libelle}</p>} />

        <SectionTitle text={"Période & Encadrement"} />
        <StudentDetails label={"Date de début"} value={<StageInfoFieldChange onRender={(e) => <p>{e ? e : "--/--/--"}</p>} index='start_date' label='Date de début' stage={stage} value={stage.start_date} type='text' onPost={(e) => { }} />} />
        <StudentDetails label={"Date de fin"} value={<StageInfoFieldChange onRender={(e) => <p>{e ? e : "--/--/--"}</p>} index='end_date' label='Date de fin' stage={stage} value={stage.start_date} type='text' onPost={(e) => { }} />} />
        {/* <StudentDetails label={"Maitre de Stage"} value={} /> */}
        <div>
            <p className='font-bold mt-[10px]'>Maitre de Stage</p>
            <StageMaster stage={stage} />
        </div>
        {
            stage.stage === "pedagogique" && <>
                <SectionTitle text={"Ecole de Stage"} />
                <StudentDetails label={"Ecole"} value={<p></p>} />
                <StudentDetails label={"Adresse de l'école"} value={<p></p>} />

                <SectionTitle text={"Horraires"} />
                <div className={"flex w-full"}>

                    <div className='w-[140px] border border-inherent'>
                        <div className='w-[140px] border border-inherent'><p>Heures</p></div>
                        <div className='w-[140px] border border-inherent text-[12px]'><p>de --:-- à --:--</p></div>
                        <div className='w-[140px] border border-inherent text-[12px]'><p>de --:-- à --:--</p></div>
                        <div className='w-[140px] border border-inherent text-[12px]'><p>de --:-- à --:--</p></div>
                        <div className='w-[140px] border border-inherent text-[12px]'><p>de --:-- à --:--</p></div>
                        <div className='w-[140px] border border-inherent text-[12px]'><p>de --:-- à --:--</p></div>
                        <div className='w-[140px] border border-inherent text-[12px]'><p>de --:-- à --:--</p></div>
                        <div className='w-[140px] border border-inherent text-[12px]'><p>de --:-- à --:--</p></div>
                    </div>
                    <div className='flex flex-1 overflow-x-scroll'>
                        <div className='w-[100px] border border-inherent'>
                            <div className="w-[100px] border border-inherent"><p>Lundi</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                        </div>
                        <div className="w-[100px] border border-inherent">
                            <div className="w-[100px] border border-inherent"><p>Mardi</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                        </div>
                        <div className="w-[100px] border border-inherent">
                            <div className="w-[100px] border border-inherent"><p>Mercredi</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                        </div>
                        <div className="w-[100px] border border-inherent">
                            <div className="w-[100px] border border-inherent"><p>Jeudi</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                        </div>
                        <div className="w-[100px] border border-inherent">
                            <div className="w-[100px] border border-inherent"><p>Vendredi</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                        </div>
                        <div className="w-[100px] border border-inherent">
                            <div className="w-[100px] border border-inherent"><p>Samedi</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                            <div className="w-[100px] border border-inherent text-[12px]"><p>--</p></div>
                        </div>
                    </div>

                </div>
            </>
        }
    </div>
}