'use client'
import React from 'react'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Spinner } from "@nextui-org/react"
import { Button } from '@/components/ui/button'
import api from '@/lib/network/api'
import cookies from '@/lib/shared/cookies'
import useEvent from '@/lib/hooks/useEvent'
import { Promotion, Student } from '/addons/uscitech_academy/ui/src/types'
import SearchSelected from "@/components/ui/SearchSelected";
import { PlusIcon } from 'lucide-react'

interface Props {
    promotions: Promotion[],
    stage: string
    promotion: any
}

const initialState: any = {
    message: undefined,
}

export default function AddStage(props: Props) {

    const { dispatch } = useEvent((eventId: string, payload: any) => {

    }, [`new-stage-added-${props.stage}`])

    const [selectedStudent, setSelectedStudent] = React.useState<string | undefined>(undefined)
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    // const [selectedPromotion, setSelectedPromotion] = React.useState();
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string | undefined>();

    const [sexe, setSexe] = React.useState<string>('m')
    React.useEffect(() => {
        console.log(sexe)
    }, [sexe])

    React.useEffect(() => {
        if (error !== undefined) {
            setTimeout(() => { setError(undefined) }, 5000)
        }
    }, [error])


    const handleSubmit = (e: any) => {
        setIsSaving(true)
        e.preventDefault();
        const facture: any = document.getElementById("facture")
        const stage: any = props.stage


        const data: any = {
            facture: facture.value,
            student_id: selectedStudent,
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
        <div>
            <button className='duration-300 flex items-center gap-[2px] text-[13px] text-white font-bold cursor-pointer rounded py-[5px] px-[15px] bg-primary/80 hover:bg-primary' onClick={() => setIsOpen(true)}><PlusIcon size={"12px"} color='white' /> Nouveau</button>

        </div>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size='2xl'>
            <ModalContent>
                {/* <form action={createStage}> */}
                {/* <form onSubmit={handleSubmit}> */}
                <ModalHeader>
                    <div>
                        <p>{props.promotion.grade.libelle}</p>
                        <p className="text-[12px] text-gray-300">Enregistrer l'étudiant</p>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className="flex flex-col gap-[5px]">
                        <div className='w-full mb-[7px]'>
                            <p className='text-gray-400 text-[13px]'>Numéro de Facture</p>
                            <input type="text" className='duration-300 border-o focus:border-primary border-b w-full border-inherent outline-none text-[13px]' placeholder="" id="facture" name="facture" required />
                        </div>
                        {/* <SearchSelected extraparams={`&stage_type=${props.stage}`} onChange={(e: Student) => setSelectedStudent(e.id)} label='Etudiant' render={(e: Student) => (`${e.user?.name} ${e.user?.last_name} ${e.user?.first_name} `)} index='id' url='/isp_stage/teacher-for-memoire-projet/without_stage/' /> */}
                        <SearchSelected processResult={((e:any)=>{
                            return e.results.results
                        })} onChange={(e: Student) => setSelectedStudent(e.id)} label='Etudiant' render={(e: any) => (`${e.student?.nom} ${e.student?.postnom} ${e.student?.prenom}`)} index='id' url='/isp_stage/isp-paiements/' />
                    </div>
                </ModalBody>
                <ModalFooter>
                    {
                        error !== undefined ? <p>{error}</p> : <>
                            {
                                isSaving === false ? <div className="flex items-center justify-end gap-[10px]">
                                    <p className="text-gray-400 cursor-pointer" onClick={() => handleClose()}>Annuler</p>
                                    <Button onClick={handleSubmit}>Ajouter</Button>
                                </div> : <div className='flex items-center gap-[10px]'>
                                    <Spinner />
                                    <p>Enregistrement en cours...</p>
                                </div>
                            }</>
                    }
                </ModalFooter>
                {/* </form> */}
            </ModalContent>
        </Modal>
    </>
}