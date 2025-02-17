'use client'
import React from 'react'
import { ProjetTutoreFormPageProps } from "../../types";
import SearchSelected from "@/components/ui/SearchSelected";
import { Student, Teacher } from "/addons/uscitech_academy/ui/src/types";
import { Modal, ModalBody, ModalContent, ModalHeader, Spinner } from '@nextui-org/react';
import cookies from '@/lib/shared/cookies';
import api from '@/lib/network/api';


export default function ProjetTutoreForm(props: ProjetTutoreFormPageProps) {
    console.log(props.projet);
    const [memberIds, setMemberIds] = React.useState<Student[]>(props.members)
    const [isSaving, setIsSaving] = React.useState(false)
    const [selectedTeacher, setSelectedTeacher] = React.useState<string | undefined>((props.projet?.teacher_id && props.projet?.teacher_id !== null && props.projet?.teacher_id !== null) ? props.projet?.teacher_id : undefined)


    const subject_input = React.useRef<any>()

    const handleRemoveMember = () => {

    }
    const handleSave = async () => {
        if (subject_input === undefined) return;
        setIsSaving(true)
        try {
            const datas: any = {
                subject: subject_input.current.value,
                member: memberIds.map(mids => (mids.id)),
                head_id: props.projet?.head_id
            }
            if (selectedTeacher !== undefined) datas["teacher_id"] = selectedTeacher
            const result = await api(cookies).put(`/isp_stage/projets-tutores/${props.projet?.id}/`, datas);

        } catch (e) {

        }
        setIsSaving(false)
    }
    return <div className='border-t border-inherent mt-[15px] pt-[15px] h-full'>
        <div className="flex items-start">
            <div className='flex flex-col flex-1'>
                <p className='text-gray-500 font-light m-0 text-[13px]'>Sujet du groupe</p>
                {
                    (props.for === "create" && props.projet?.head_id === props.student?.id) ?
                        <div className='border-b border-inherent'>
                            <input id="subject" ref={subject_input} name="subject" className='border-0 outline-none w-full bg-transparent text-[13px]' defaultValue={props.projet !== undefined ? `${props.projet?.subject}` : ``} />
                        </div>
                        : <p className='font-semibold text-[20px] m-0'>{props.projet?.subject}</p>
                }

            </div>
        </div>
        <div className="flex items-start mt-[15px]">
            <div className='flex flex-col flex-1'>

                {
                    (props.for === "create" && props.projet?.head_id === props.student?.id) ?
                        <SearchSelected defaultValue={(props.projet?.teacher !== undefined && props.projet?.teacher !== null) ? `${props.projet?.teacher?.employee?.fullname}` : ""} onChange={(e: Teacher) => setSelectedTeacher(e.id)} label='Encadreur' render={(e: Teacher) => (`${e.employee.fullname}`)} index='id' url='/isp_stage/teacher-for-memoire-projet/' /> : <>
                            <p className='text-gray-500 font-light m-0 text-[13px]'>Encadreur</p>
                            {(props.projet?.teacher !== undefined && props.projet?.teacher !== null) ? <p className='font-semibold text-[20px] m-0'>{props.projet?.teacher?.employee?.fullname}</p> :
                                <p>--</p>
                            }
                        </>
                }
            </div>
        </div>
        <div className="mt-[15px]">
            <div className=''>
                <p className='text-gray-500 font-light m-0 text-[13px]'>Membre du Groupe</p>
                {
                    memberIds.map((meb) => {
                        return <div key={meb.id}>
                            <p className='text-[13px] pl-[10px]'>- {meb.user.name} {meb.user.last_name} {meb.user.first_name} {props.projet?.head_id === meb.id ? "(Chef de groupe)" : ""}</p>
                        </div>
                    })
                }
            </div>
            {
                (props.for === "create" && props.department_settings !== undefined && props.department_settings.max_tutore_project_member_group < memberIds.length) && <div className='mt-[15px]'>
                    <ButtonAddMember onChange={(e: Student) => {
                        if (memberIds.find(mid => mid.id === e.id)) return;
                        setMemberIds([
                            ...memberIds,
                            e
                        ])
                    }} />
                </div>
            }

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

interface ButtonAddMemberProps {
    onChange: (e: Student) => any
}
const ButtonAddMember = (
    props: ButtonAddMemberProps
) => {
    const [selectedStudent, setSeletedStudent] = React.useState<any>()

    const [isOpen, setIsOpen] = React.useState(false)
    const handleAdd = () => {
        if (selectedStudent !== undefined) {
            props.onChange(selectedStudent)
            setIsOpen(false);
        }
    }
    return <>
        <button onClick={() => setIsOpen(true)} className='bg-[rgba(0,0,0,0.05)] text-[13px] py-[4px] px-[15px] rounded'>Ajouter un membre</button>
        <Modal isOpen={isOpen} onClose={() => {
            setSeletedStudent(undefined)
            setIsOpen(false)
        }}>
            <ModalContent>
                <ModalHeader>
                    <p>Ajouter un membre</p>
                </ModalHeader>
                <ModalBody>
                    <SearchSelected onChange={(e: Student) => setSeletedStudent(e)} label='Etudiant' render={(e: Student) => (`${e.user?.name} ${e.user?.last_name} ${e.user?.first_name}`)} index='id' url='/uscitech_academy/students/' />
                    <div className='mt-[15px]'>
                        <button onClick={handleAdd} className='bg-[rgba(0,0,0,0.05)] text-[13px] py-[4px] px-[15px] rounded'>Ajouter</button>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
}