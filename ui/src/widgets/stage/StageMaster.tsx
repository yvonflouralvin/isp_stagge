'use client'
import React from 'react'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem } from "@nextui-org/react"
import api from '@/lib/network/api'
import cookies from '@/lib/shared/cookies'
import { Button } from '@/components/ui/button'
import { PageProps } from '@/lib/shared/types/config';
import { Input } from '@/components/ui/input';

interface Props extends PageProps {
    stage: any
}
export default function StageMaster(props: Props) {

    const [stageMaster, setStageMaster] = React.useState<any>(props.stage.stagemaster)
    const [isOpen, setIsOpen] = React.useState<boolean>(false)
    const [selectedOption, setSelectedOption] = React.useState<any>(null);
    const [options, setOptions] = React.useState([]);

    const onClose = () => {
        setIsOpen(false)
    }

    const handleSet = () => {
        console.log(selectedOption)
        if (selectedOption == null) return;
        try {
            const url = `/isp_stage/stage/${props.stage.id}/set-master/`
            api(cookies).post(url, {
                "master-id": selectedOption
            })
                .then(result => {
                    setStageMaster(result.data.stagemaster)
                    setIsOpen(false);
                })
        } catch (e) {
            console.error(e)
        }
    }

    const handleRemove = (e: string) => {
        try {
            const url = `/isp_stage/stage/${props.stage.id}/remove-master/`
            api(cookies).post(url, {
                "master-id": e
            })
                .then(result => {
                    setStageMaster(result.data.stagemaster)
                    setIsOpen(false);
                })
        } catch (e) {
            console.error(e)
        }
    }

    const handleSearch = async (e: any) => {
        e.preventDefault();
        const search_value: any = document.getElementById("stagemastersearch");
        if (search_value.value === "") return;
        const datas: any = (await api(cookies).get(`/isp_stage/stage-master/?search=${search_value.value}`)).data;
        setOptions(datas.results.map((e: any) => ({ value: e.id, label: `${e.user?.name} ${e.user?.first_name} ${e.user?.last_name}` })))
    }


    return <>
        <div className="flex flex-col items-start gap-[5px]">
            <div className="flex items-center">
                <p className='font-bold mt-[10px]'>Maitre de Stage</p>
                {
                    props.user.permissions.find((pr: string) => pr === "isp_departement_officier") && <>
                        {
                            (props.stage.stage === "pedagogique" && stageMaster.length < 1) ? <button onClick={() => setIsOpen(true)} className="text-[12px] bg-gray-400 px-[10px] rounded">Ajouter</button> : <></>
                        }
                        {
                            (props.stage.stage !== "pedagogique") ? <button onClick={() => setIsOpen(true)} className="text-[12px] bg-gray-400 px-[10px] rounded">Ajouter</button> : <></>
                        }
                    </>
                }
            </div>
            {
                stageMaster.map((sm: any) => {
                    return <div className='flex items-center gap-[10px]'>
                        <p>{sm.user?.name} {sm.user?.last_name} {sm.user?.first_name} - Tel : {sm.user?.phone}</p>
                        {props.user.permissions.find((pr: string) => pr === "isp_departement_officier") && <button className='text-[12px] bg-gray-400 px-[10px] rounded' onClick={() => handleRemove(sm.id)}>Retirer</button>}
                    </div>
                })
            }

        </div>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">Choix du maitre de stage</ModalHeader>
                <ModalBody className="min-h-[100px]">
                    <form onSubmit={handleSearch}><Input placeholder='Rechercher un Maitre de Stage' id='stagemastersearch' /></form>
                    {
                        options.length > 0 && <Select label={"Choix du maitre"} placeholder='Choix du maitre' onChange={e => {
                            setSelectedOption(e.target.value)
                        }}>
                            {options.map((option: any) => (<SelectItem key={option.value}>{option.label}</SelectItem>))}
                        </Select>
                    }
                </ModalBody>
                <ModalFooter>
                    <div className="flex justify-end items-center gap-[10px]">
                        <p className="cursor-pointer text-gray-500" onClick={onClose}>Annuler</p>
                        {
                            selectedOption && <Button onClick={handleSet}>Ajouter</Button>
                        }
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
}