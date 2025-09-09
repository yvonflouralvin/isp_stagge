'use client'
import React from 'react'
import { DirecteurTravaux, StudentMemoireFormPageProps } from "../../types";
import SearchSelected from "@/components/ui/SearchSelected";
import { Spinner } from '@nextui-org/react';
import cookies from '@/lib/shared/cookies';
import api from '@/lib/network/api';
import ConfirmDialogPopup from '@/components/ui/ConfirmDialogPopup';


export default function StudentMemoireForm(props: StudentMemoireFormPageProps) {
    // console.log(props.projet);
    // const [memberIds, setMemberIds] = React.useState<Student[]>(props.members)
    const [isSaving, setIsSaving] = React.useState(false)
    const [selectedTeacher, setSelectedTeacher] = React.useState<string | undefined>((props.memoire?.director_id && props.memoire?.director_id !== null && props.memoire?.director_id !== null) ? props.memoire?.director_id : undefined)


    const subject_input = React.useRef<any>()

    const handleRemoveMember = () => {

    }
    const handleSave = async () => {
        if (subject_input === undefined) return;
        setIsSaving(true)
        try {
            const datas: any = {
                subject: subject_input.current.value,
                // member: memberIds.map(mids => (mids.id)),
                student_id: props.memoire?.student_id
            }
            if (selectedTeacher !== undefined) datas["director_id"] = selectedTeacher
            const result = await api(cookies).put(`/isp_stage/students-memoires/${props.memoire?.id}/`, datas);

        } catch (e) {

        }
        setIsSaving(false)
    }
    return <div className='border-t border-inherent mt-[15px] pt-[15px] h-full'>
        <div className="flex items-start">
            <div className='flex flex-col flex-1'>
                <p className='text-gray-500 font-light m-0 text-[13px]'>Sujet du memoire</p>
                {
                    (props.for === "create") ?
                        <div className='border-b border-inherent'>
                            <input id="subject" ref={subject_input} name="subject" className='border-0 outline-none w-full bg-transparent text-[13px]' defaultValue={props.memoire !== undefined ? `${props.memoire?.subject}` : ``} />
                        </div>
                        : <p className='font-semibold text-[20px] m-0'>{props.memoire?.subject}</p>
                }

            </div>
        </div>
        <div className="flex items-start mt-[15px]">
            <div className='flex flex-col flex-1'>
                {
                    (props.memoire?.director !== undefined && props.memoire?.director !== null) ? <div className='flex items-start'>
                        <div className='flex-1'>
                            <p className='text-gray-400 text-[13px]'>Directeur</p>
                            <p className='text-[14px] m-0'>{selectedTeacher ? props.memoire?.director?.employee.fullname : "---"}</p>
                        </div>
                        {
                            (selectedTeacher !== undefined) && <>
                                {
                                    props.user.permissions.find(perm => perm === "isp_departement_officier") && <>
                                        {
                                            isSaving === true ? <Spinner /> : <ConfirmDialogPopup onConfirm={async () => {
                                                setIsSaving(true)
                                                try {
                                                    const datas: any = {
                                                        subject: props.memoire?.subject,
                                                        student_id: props.memoire?.student_id,
                                                        director_id: null
                                                    }
                                                    const result = await api(cookies).put(`/isp_stage/students-memoires/${props.memoire?.id}/`, datas);
                                                    setSelectedTeacher(undefined)
                                                } catch (e) {
                                                    console.error(e)
                                                }
                                                setIsSaving(false)
                                            }} label='Retirer' title='Retirer le directeur'>
                                                <div>
                                                    Vous êtes sur le point de retirer le directeur de ce étudiant
                                                </div>
                                            </ConfirmDialogPopup>
                                        }
                                    </>
                                }
                            </>
                        }

                    </div> : <>
                        {
                            (props.for === "create") ?
                                <SearchSelected selectedFirstDefault={false} extraparams='&direction_type=memoire' onChange={(e: DirecteurTravaux) => setSelectedTeacher(e.id)} label='Directeur' render={(e: DirecteurTravaux) => (`${e.employee.fullname}`)} index='id' url='/isp_stage/directeur-travaux/' /> : <>
                                    <p className='text-gray-500 font-light m-0 text-[13px]'>Directeur</p>
                                    <p>--</p>
                                </>
                        }

                    </>
                }
                {
                    (props.memoire !== undefined && props.memoire.student.user.id !== props.user.id) && <div className='mt-[15px]'>
                        <p className='text-gray-400 text-[13px]'>Informations sur l'étudiant</p>
                        <p className='text-[14px] m-0'>Nom complet : {props.memoire?.student?.user?.name} {props.memoire?.student?.user?.last_name} {props.memoire?.student?.user?.first_name}</p>
                        <p className='text-[14px] m-0'>Promotion : {props.memoire?.student?.promotion?.libelle} {props.memoire?.student?.promotion?.grade.libelle} </p>
                        <p className='text-[14px] m-0'>Téléphone : {props.memoire?.student?.user?.phone}</p>
                    </div>
                }
            </div>
        </div>
        {
            props.for === "create" && <div className='mt-[15px] border-t border-inherent flex w-full justify-end'>
                {
                    isSaving === false ? <button onClick={handleSave} className='bg-primary text-white text-[13px] py-[4px] px-[15px] rounded'>Enregistrer toutes les modidications</button> : <Spinner size='sm' />
                }
            </div>
        }
    </div>
}

