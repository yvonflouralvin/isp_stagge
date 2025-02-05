'use client'
import React from 'react'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react"
import api from '@/lib/network/api'
import cookies from '@/lib/shared/cookies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { projectShutdown } from 'next/dist/build/swc/generated-native'

interface Props {
    stage: any
    index: string
    type: "text" | "date" | "hour" | "date-time" | "number"
    label: string
    onPost: (value: any) => any
    onRender: (e: any) => React.ReactNode
    value: any,
    onChange?: (e: any) => any
}
export default function StageInfoFieldChange(props: Props) {
    const [isOpen, setIsOpen] = React.useState<boolean>(false)
    const [value, setValue] = React.useState<any>(props.value)

    const onClose = () => {
        setIsOpen(false)
    }

    const handleSet = (e: any) => {
        e.preventDefault()
        try {
            const field: any = document.getElementById(props.index)
            console.log(field.value)
            const url = `/isp_stage/stage/${props.stage.id}/update/`
            api(cookies).post(url, {
                [props.index]: field.value
            })
                .then(result => {
                    setValue(field.value)
                    setIsOpen(false);
                    if (props.onChange !== undefined) props.onChange(field.value)
                })
        } catch (e) {

        }
    }

    return <>
        <div className={"flex gap-[20px]"}>
            {props.onRender(value)}
            {
                props.stage.horraire_status === false && <button onClick={() => setIsOpen(true)} className='text-[12px]'>Modifier</button>
            }
        </div>
        {
            props.stage.horraire_status === false && <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <form onSubmit={handleSet}>
                        <ModalHeader className="flex flex-col gap-1">{props.label}</ModalHeader>
                        <ModalBody className="min-h-[200px]">
                            {(props.type === "text" || props.type === "date") && <Input
                                placeholder={props.label}
                                defaultValue={props.value}
                                id={props.index}
                                type={props.type}
                                required
                            />}
                        </ModalBody>
                        <ModalFooter>
                            <div className="flex justify-end items-center gap-[10px]">
                                <p className="cursor-pointer text-gray-500" onClick={onClose}>Annuler</p>
                                <Button type="submit">Modifier</Button>
                            </div>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        }

    </>
}