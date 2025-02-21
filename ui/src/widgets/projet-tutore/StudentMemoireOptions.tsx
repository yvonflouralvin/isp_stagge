'use client'
import React from 'react'
import { Settings2Icon } from "lucide-react"
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react"
import { DepartmentSettings } from '../../types'
import api from '@/lib/network/api'
import cookies from '@/lib/shared/cookies'

interface Props {
    department_settings?: DepartmentSettings
}
export default function StudentMemoireOptions(props: Props) {

    const nbetudiants = React.useRef<any>()
    const nbetudiants_externe = React.useRef<any>()

    const [department_settings, setDepartment_settings] = React.useState<DepartmentSettings | undefined>(props.department_settings)
    const [isOpen, setIsOpen] = React.useState(false)
    const [isUpdating, setIsUpdating] = React.useState(false)

    React.useEffect(() => {
        console.log(department_settings)
    }, [department_settings])

    const handleSave = async () => {
        try {
            const result = (await api(cookies).put(`/isp_stage/department-settings/${department_settings?.id}/`, {
                department_id: department_settings?.department_id,
                max_teacher_memoire: nbetudiants.current.value,
                max_teacher_externe_memoire: nbetudiants_externe.current.value

            })).data;
            setDepartment_settings(result);
            setIsUpdating(false);
            setIsOpen(false);
        } catch (e) {

        }
    }
    return <>
        <div className='flex items-center gap-[2px] text-[13px] font-bold cursor-pointer' onClick={() => setIsOpen(true)}>
            <Settings2Icon size={"12px"} />
            <p>Options</p>
        </div>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <ModalContent>
                <ModalHeader>Options</ModalHeader>
                <ModalBody>
                    <div>
                        <p className='text-gray-500'>Vous pouvez consulter et configurer les options des mémoires</p>
                        <div className='mt-[10px]'>
                            <p className='font-light text-gray-500 text-[13px]'>Nombre d'étudiants par directeur du département</p>
                            {isUpdating === false && <p className='font-bold'>{department_settings ? `${department_settings.max_teacher_memoire}` : ""}</p>}
                            {isUpdating === true && <input className='border-0 outline-none w-full bg-transparent text-[13px]' ref={nbetudiants} id="nbgroups" defaultValue={department_settings ? `${department_settings.max_teacher_memoire}` : ""} placeholder="Nombre d'étudiants par directeur du département" type='number' />}
                        </div>
                        <div className='mt-[10px]'>
                            <p className='font-light text-gray-500 text-[13px]'>Nombre d'étudiants par directeur externe</p>
                            {isUpdating === false && <p className='font-bold'>{department_settings ? `${department_settings.max_teacher_externe_memoire}` : ""}</p>}
                            {isUpdating === true && <input className='border-0 outline-none w-full bg-transparent text-[13px]' ref={nbetudiants_externe} id="nbgroups" defaultValue={department_settings ? `${department_settings.max_teacher_externe_memoire}` : ""} placeholder="Nombre d'étudiants par directeur externe" type='number' />}
                        </div>
                        <div className='flex mt-[10px] justify-end'>
                            {isUpdating === false && <button onClick={() => setIsUpdating(true)} className='duration-300 hover:bg-[rgba(0,0,0,0.1)] text-gray-500 hover:text-gray-700 bg-[rgba(0,0,0,0.02)] px-[20px] py-[4px] rounded cursor-pointer'>Editer</button>}
                            {isUpdating === true && <div className='flex items-center gap-[10px]'>
                                <p className='text-semibold text-gray-400 cursor-pointer' onClick={() => setIsUpdating(false)}>Annuler</p>
                                <button onClick={handleSave} className='duration-300 hover:bg-[rgba(0,0,0,0.1)] text-gray-500 hover:text-gray-700 bg-[rgba(0,0,0,0.02)] px-[20px] py-[4px] rounded cursor-pointer'>Enregistrer</button>
                            </div>}
                        </div>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
}