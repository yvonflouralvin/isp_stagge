'use client'
import React from 'react'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Spinner } from "@nextui-org/react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input' 
import api from '@/lib/network/api'
import cookies from '@/lib/shared/cookies'

interface Props { 
}

export default function AddStageMaster(props: Props) {

    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string | undefined>(); 

    React.useEffect(() => {
        if (error !== undefined) {
            setTimeout(() => { setError(undefined) }, 5000)
        }
    }, [error])


    const handleSubmit = (e: any) => {
        setIsSaving(true)
        e.preventDefault();
        const name: any = document.getElementById("name");
        const firstname: any = document.getElementById("firstname");
        const lastname: any = document.getElementById("lastname");
        const email: any = document.getElementById("email");
        const phonenumber: any = document.getElementById("phonenumber");

        const data = {
            name: name.value,
            firstname: firstname.value,
            lastname: lastname.value,
            email: email.value,
            phonenumber: phonenumber.value,
        }

        api(cookies).post(`/isp_stage/stage-master/`, {
            name: data.name,
            first_name: data.firstname,
            last_name: data.name,
            phone: data.phonenumber,
            email: data.email,
            // dept: selectedDepartement
        })
            .then(result => {
                console.log(result);
                setIsSaving(false);
                setIsOpen(false);
            })
            .catch(error => {
                console.log(error);
                setIsSaving(false)
                setError(error.message)
            })


        console.log(data)
    }

    const handleClose = () => {
        setIsOpen(false);
    }

    return <>
        <Button onClick={() => setIsOpen(true)}>Nouveau</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size='2xl'>
            <ModalContent>
                <form onSubmit={handleSubmit}>
                    <ModalHeader>Ajouter un utisateur</ModalHeader>
                    <ModalBody>
                        <div className="flex flex-col gap-[5px]">
                            <Input type="text" placeholder="Nom" id="name" />
                            <Input type="text" placeholder="Postnom" id="lastname" />
                            <Input type="text" placeholder="Prénom" id="firstname" />
                            <Input type="text" placeholder="Email" id="email" />
                            <Input type="text" placeholder="Téléphone" id="phonenumber" required />
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