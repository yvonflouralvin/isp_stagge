'use client'
import React, { useActionState } from 'react'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Spinner } from "@nextui-org/react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AddStageForm, Promotion } from '../../types'
import { Select, SelectItem } from "@nextui-org/react";
import api from '@/lib/network/api'
import cookies from '@/lib/shared/cookies' 
import { createStage } from '../../lib/actions/server'
import useEvent from '@/lib/hooks/useEvent'

interface Props {
    promotions: Promotion[],
    stage: string
    promotion: any
}

const initialState: any = {
    message: undefined,
  }

export default function AddStage(props: Props) {

    const {dispatch} = useEvent((eventId: string, payload: any)=>{

    },[`new-stage-added-${props.stage}`])
    

    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    // const [selectedPromotion, setSelectedPromotion] = React.useState();
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string|undefined>();

    const [sexe, setSexe] = React.useState<string>('m')
    React.useEffect(()=>{
        console.log(sexe)
    }, [sexe])

    React.useEffect(()=>{
        if(error !== undefined){
            setTimeout(()=>{setError(undefined)}, 5000)
        }
    }, [error])


    const handleSubmit = (e: any) => {
        setIsSaving(true)
        e.preventDefault();
        const name: any =  document.getElementById("name")
        const first_name: any =  document.getElementById("first_name")
        const last_name: any =  document.getElementById("last_name")
        const phone: any =  document.getElementById("phone")
        // const email: any =  document.getElementById("email")
        const facture: any =  document.getElementById("facture")
        const promotion: any =  props.promotion.id
        const stage: any =  props.stage
        

        const data: AddStageForm = {
            name: name.value,
            last_name: last_name.value,
            first_name: first_name.value,
            // email: email.value,
            phonenumber: phone.value,
            facture: facture.value,
            sexe: sexe,
            promotion,
            stage
        }

        api(cookies).post(`/isp_stage/student`, data)
        .then(result => { 
            setIsSaving(false);
            setIsOpen(false);
            dispatch(`new-stage-added-${props.stage}`, {})
        })
        .catch(error => { 
            setIsSaving(false) 
            alert(error.response.data.message)
        })
    }

    const handleClose = () => {
        setIsOpen(false);
    }

    return <>
        <Button onClick={() => setIsOpen(true)}>Nouveau</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size='2xl'>
            <ModalContent>
                {/* <form action={createStage}> */}
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        <div>
                            <p>{props.promotion.grade.libelle}</p>
                            <p className="text-[12px] text-gray-300">Enregistrer l'étudiant</p>
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        <div className="flex flex-col gap-[5px]">
                            <Input type="text" placeholder="Numéro de Facture" id="facture" name="facture" required />
                            <Input type="text" placeholder="Nom" id="name" name="name" required />
                            <Input type="text" placeholder="Postnom" id="last_name"  name="last_name" required/>
                            <Input type="text" placeholder="Prénom" id="first_name" name="first_name" required />
                            {/* <Input type="text" placeholder="Email" id="email" name="email"/> */}
                            <Input type="text" placeholder="Téléphone" id="phone" name="phone" required /> 
                            <Select name='sexe' id='sexe' placeholder='Genre/Sexe' required defaultSelectedKeys={"m"} onChange={(e:any)=>setSexe(e.target.value)}>
                                <SelectItem value={"m"} key={"m"}>Masculin</SelectItem>
                                <SelectItem value={"f"} key={"f"}>Feminin</SelectItem>
                            </Select>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        {
                            error !== undefined ? <p>{error}</p> : <>
                                {
                                    isSaving === false ? <div className="flex items-center justify-end gap-[10px]">
                                        <p className="text-gray-400 cursor-pointer" onClick={() => handleClose()}>Annuler</p>
                                        <Button>Ajouter</Button>
                                    </div> : <div className='flex items-center gap-[10px]'>
                                        <Spinner />
                                        <p>Enregistrement en cours...</p>
                                    </div>
                                }</>
                        }
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    </>
}