'use client'
import React from 'react'
import HorraireWidget from "./HorraireWidget"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import api from '@/lib/network/api'
import cookies from '@/lib/shared/cookies'
import { User } from '@/lib/shared/types'

interface Props {
    stage: any,
    horraires: any,
    setValue: (e: any) => any
    prefix: string
    user: User
}


const HourLine = (props: {
    prefix: string,
    stage: any,
    horraires: any,
    setValue: (e: any) => any
    user: User
}) => {

    const [isOpen, setIsOpen] = React.useState<boolean>(false)
    const onClose = () => {
        setIsOpen(false)
    }

    const handleSet = (e: any) => {
        e.preventDefault();
        const e0: any = document.getElementById(`${props.prefix}_0`)
        const e1: any = document.getElementById(`${props.prefix}_1`)
        const data = {
            [`${props.prefix}_0`]: e0.value,
            [`${props.prefix}_1`]: e1.value
        }

        const horraires = props.horraires ? { ...props.horraires, ...data } : { ...data }
        const url = `/isp_stage/stage/${props.stage.id}/update/`
        api(cookies).post(url, {
            horraires: horraires
        })
            .then(result => {
                props.setValue(horraires)
                setIsOpen(false);
            })

    }

    return <>
        <div className='w-[140px] py-[0.5px] border border-inherent text-[12px] flex gap-[5px] cursor-pointer' onClick={() => {
            if(props.user.permissions.find(p => p === "isp_user_student") && props.stage.horraire_status === false)setIsOpen(true)
        }}>
            <p>de</p>
            <HorraireWidget empty={<p>--:--</p>} value={(props.horraires !== undefined && props.horraires[`${props.prefix}_0`] !== undefined) ? props.horraires[`${props.prefix}_0`] : undefined} />
            <p>à</p>
            <HorraireWidget empty={<p>--:--</p>} value={(props.horraires !== undefined && props.horraires[`${props.prefix}_1`] !== undefined) ? props.horraires[`${props.prefix}_1`] : undefined} />
        </div>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <form onSubmit={handleSet}>
                    <ModalHeader className="flex flex-col gap-1">Modifier les heures</ModalHeader>
                    <ModalBody className="min-h-[200px]">
                        <p className='m-0'>Heure de début</p>
                        <Input placeholder={"Heure de debut"} defaultValue={""} id={`${props.prefix}_0`} type={"time"} required />
                        <p className='m-0 mt-[10px]'>Heure de fin</p>
                        <Input placeholder={"Heure de fin"} defaultValue={""} id={`${props.prefix}_1`} type={"time"} required />
                    </ModalBody>
                    <ModalFooter>
                        <div className="flex justify-end items-center gap-[10px]">
                            <p className="cursor-pointer text-gray-500" onClick={onClose}>Annuler</p>
                            <Button type='submit'>Modifier</Button>
                        </div>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    </>
}


export default function HorraireHeuresWidgets(props: Props) {
    const content: React.ReactNode[] = []
    for (let i = 0; i < 7; i++) {
        content.push(
            <HourLine user={props.user} prefix={`hour_${i}_${props.prefix}`} stage={props.stage} horraires={props.horraires} setValue={props.setValue} />
        )
    }

    return content;
}