'use client'
import React from 'react'
import { ProjetTutoreFormPageProps, StudentMemoireFormPageProps } from "../../types";
import SearchSelected from "@/components/ui/SearchSelected";
import { Student, StudentFormPageProps, Teacher } from "/addons/uscitech_academy/ui/src/types";
import { Modal, ModalBody, ModalContent, ModalHeader, Spinner } from '@nextui-org/react';
import cookies from '@/lib/shared/cookies';
import api from '@/lib/network/api';


export default function StudentMemoireForm(props: StudentMemoireFormPageProps) {
    // console.log(props.projet);
    // const [memberIds, setMemberIds] = React.useState<Student[]>(props.members)
    const [isSaving, setIsSaving] = React.useState(false)
    const [selectedTeacher, setSelectedTeacher] = React.useState<string | undefined>((props.memoire?.teacher_id && props.memoire?.teacher_id !== null && props.memoire?.teacher_id !== null) ? props.memoire?.teacher_id : undefined)


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
            if (selectedTeacher !== undefined) datas["teacher_id"] = selectedTeacher
            const result = await api(cookies).put(`/isp_stage/students-memoires/${props.memoire?.id}/`, datas);

        } catch (e) {

        }
        setIsSaving(false)
    }
    return <div className='border-t border-inherent mt-[15px] pt-[15px] h-full'>
        <div className="flex items-start">
            <div className='flex flex-col flex-1'>
                <p className='text-gray-500 font-light m-0 text-[13px]'>Sujet du groupe</p>
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
                    (props.memoire?.teacher !== undefined && props.memoire?.teacher !== null) ? <div>

                        <p className='font-semibold text-[13px] m-0'>{props.memoire?.teacher?.employee?.fullname}</p>
                    </div> : <>
                        {
                            (props.for === "create") ?
                                <SearchSelected onChange={(e: Teacher) => setSelectedTeacher(e.id)} label='Encadreur' render={(e: Teacher) => (`${e.employee.fullname}`)} index='id' url='/uscitech_academy/teachers/' /> : <>
                                    <p className='text-gray-500 font-light m-0 text-[13px]'>Encadreur</p>
                                    <p>--</p>
                                </>
                        }

                    </>
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