'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/network/api';
import cookies from '@/lib/shared/cookies';
import { User } from '@/lib/shared/types';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import React from 'react';

interface Props {
    prefix: string
    stage: any
    horraires: any
    setValue: (e: any) => any
    user: User
}

const CoursWidget = (props: {
    horraires: any,
    setHorraires: (e: any) => any,
    prefix: string,
    stage: any,
    user: User
}) => {
    const [isOpen, setIsOpen] = React.useState<boolean>(false)
    const onClose = () => {
        setIsOpen(false)
    }
    const handleSet = (e: any) => {
        e.preventDefault();
        const e0: any = document.getElementById(`${props.prefix}`) 
        const data = {
            [`${props.prefix}`]: e0.value
        }

        const horraires = props.horraires ? { ...props.horraires, ...data } : { ...data }
        const url = `/isp_stage/stage/${props.stage.id}/update/`
        api(cookies).post(url, {
            horraires: horraires
        })
        .then(result => {
            props.setHorraires(horraires)
            setIsOpen(false);
        })

    }

    return <>
        <div className="w-[100px] border-t border-inherent text-[12px] cursor-pointer" onClick={()=>{
            if(props.user.permissions.find(p => p === "isp_user_student"  && props.stage.horraire_status === false))setIsOpen(true)
        }}>
            {
                (props.horraires === undefined || props.horraires[`${props.prefix}`] === undefined) ? <p>---</p> : <p>{props.horraires[`${props.prefix}`]}</p>
            }
        </div>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <form onSubmit={handleSet}>
                    <ModalHeader className="flex flex-col gap-1">Modifier le cours</ModalHeader>
                    <ModalBody className="min-h-[200px]">
                        <p className='m-0'>Nom du cours</p>
                        <Input placeholder={"Nom du cours"} defaultValue={props.horraires[props.prefix]} id={`${props.prefix}`} type={"text"} required />
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
export default function HorraireCoursWidget(props: Props) {
    const content: React.ReactNode[] = []

    for (let i = 0; i < 7; i++) {
        content.push(
            <div className="w-[100px] border border-inherent text-[12px]">
                <CoursWidget user={props.user} prefix={`${props.prefix}_${i}`} horraires={props.horraires} setHorraires={props.setValue} stage={props.stage} />
            </div>
        )
    }

    return content;
}