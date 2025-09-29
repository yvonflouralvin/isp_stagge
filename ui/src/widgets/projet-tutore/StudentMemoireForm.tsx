'use client'
import React from 'react'
import { DirecteurTravaux, StudentMemoireFormPageProps } from "../../types";
import SearchSelected from "@/components/ui/SearchSelected";
import { Modal, ModalBody, ModalContent, ModalHeader, Spinner } from '@nextui-org/react';
import cookies from '@/lib/shared/cookies';
import api from '@/lib/network/api';
import ConfirmDialogPopup from '@/components/ui/ConfirmDialogPopup';


export default function StudentMemoireForm(props: StudentMemoireFormPageProps) {
    // console.log(props.projet);
    // const [memberIds, setMemberIds] = React.useState<Student[]>(props.members)
    const [isSaving, setIsSaving] = React.useState(false)
    const [selectedTeacher, setSelectedTeacher] = React.useState<string | undefined>((props.memoire?.director_id && props.memoire?.director_id !== null && props.memoire?.director_id !== null) ? props.memoire?.director_id : undefined)
    const [memoireSubmition, setMemoireSubmition] = React.useState<any>()

    React.useEffect(() => {
        if (props.memoire?.status === "submitted") {
            const exec = async () => {
                const details = await api(cookies).get(`/isp_stage/students-memoires/${props.memoire?.id}/details_submission/`)
                setMemoireSubmition(details.data)
            }
            exec()
        }
    }, [])

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
            if (selectedTeacher !== undefined) datas["director_id"] = selectedTeacher
            const result = await api(cookies).put(`/isp_stage/students-memoires/${props.memoire?.id}/`, datas);

        } catch (e) {

        }
        setIsSaving(false)
    }
    return <div className='border-t border-inherent mt-[15px] pt-[15px] h-full'>
        <div className="flex items-start">
            <div className='flex flex-col flex-1'>
                <p className='text-gray-500 font-light m-0 text-[13px]'>Sujet du memoire</p>
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
                    (props.memoire?.director !== undefined && props.memoire?.director !== null) ? <div className='flex items-start'>
                        <div className='flex-1'>
                            <p className='text-gray-400 text-[13px]'>Directeur</p>
                            <p className='text-[14px] m-0'>{selectedTeacher ? props.memoire?.director?.employee.fullname : "---"}</p>
                        </div>
                        {
                            (selectedTeacher !== undefined) && <>
                                {
                                    props.user.permissions.find(perm => perm === "isp_departement_officier") && <>
                                        {
                                            isSaving === true ? <Spinner /> : <>{props.memoire?.status !== "submitted" && <ConfirmDialogPopup onConfirm={async () => {
                                                setIsSaving(true)
                                                try {
                                                    const datas: any = {
                                                        subject: props.memoire?.subject,
                                                        student_id: props.memoire?.student_id,
                                                        director_id: null
                                                    }
                                                    const result = await api(cookies).put(`/isp_stage/students-memoires/${props.memoire?.id}/`, datas);
                                                    setSelectedTeacher(undefined)
                                                } catch (e) {
                                                    console.error(e)
                                                }
                                                setIsSaving(false)
                                            }} label='Retirer' title='Retirer le directeur'>
                                                <div>
                                                    Vous êtes sur le point de retirer le directeur de ce étudiant
                                                </div>
                                            </ConfirmDialogPopup>}</>
                                        }
                                    </>
                                }
                            </>
                        }

                    </div> : <>
                        {
                            (props.for === "create") ?
                                <SearchSelected selectedFirstDefault={false} extraparams='&direction_type=memoire' onChange={(e: DirecteurTravaux) => setSelectedTeacher(e.id)} label='Directeur' render={(e: DirecteurTravaux) => (`${e.employee.fullname}`)} index='id' url='/isp_stage/directeur-travaux/' /> : <>
                                    <p className='text-gray-500 font-light m-0 text-[13px]'>Directeur</p>
                                    <p>--</p>
                                </>
                        }

                    </>
                }
                {
                    (props.memoire !== undefined && props.memoire.student.user.id !== props.user.id) && <div className='mt-[15px]'>
                        <p className='text-gray-400 text-[13px]'>Informations sur l'étudiant</p>
                        <p className='text-[14px] m-0'>Nom complet : {props.memoire?.student?.user?.name} {props.memoire?.student?.user?.last_name} {props.memoire?.student?.user?.first_name}</p>
                        <p className='text-[14px] m-0'>Promotion : {props.memoire?.student?.promotion?.libelle} {props.memoire?.student?.promotion?.grade.libelle} </p>
                        <p className='text-[14px] m-0'>Téléphone : {props.memoire?.student?.user?.phone}</p>
                    </div>
                }
            </div>
        </div>
        {
            props.for === "create" && <div className='mt-[15px] border-t border-inherent flex w-full justify-end'>
                {
                    isSaving === false ? <>{props.memoire?.status !== "submitted" && <button onClick={handleSave} className='bg-primary text-white text-[13px] py-[4px] px-[15px] rounded'>Enregistrer toutes les modidications</button>}</> : <Spinner size='sm' />
                }
            </div>
        }

        {
            props.user.permissions.find((perm: string) => perm === "isp_user_student") && <div className='mt-[10px]'>
                {
                    props.memoire && props.memoire.status !== "submitted" && <ButtonSubmitMemoire
                        memoireId={props.memoire?.id}
                        initialSubject={props.memoire?.subject ?? ""}
                        onSubmitted={() => {
                            window.location.reload();
                        }}
                    />
                }
            </div>
        }
        {
            props.user.permissions.find(perm => perm === "isp_departement_officier") && <>
                <>{memoireSubmition && <div className='border border-t p-[20px] mt-[20px]'>
                    <p className='font-semibold text-lg'>Travail Soumis</p>
                    <p className='text-gray-600 mt-1'>Ce travail a déjà été soumis par l'étudiant.</p>

                    <div className='border-t border-gray-200 mt-4 pt-4'>
                        <h3 className='text-md font-semibold text-gray-800'>Détails de la soumission</h3>
                        <div className='mt-2'>
                            <p className='text-gray-500 font-light text-sm'>Sujet final</p>
                            <p className='font-semibold text-md'>{memoireSubmition?.final_subject}</p>
                        </div>
                    </div>

                    <div className='mt-4'>
                        <ConfirmDialogPopup onConfirm={async () => {
                            setIsSaving(true)
                            try {
                                await api(cookies).post(`/isp_stage/students-memoires/${props.memoire?.id}/cancel_submission/`, {});
                                window.location.reload();
                            } catch (e) {
                                console.error(e)
                            }
                            setIsSaving(false)
                        }} label='Annuler la soumission' title='Annuler la soumission'>
                            <div>
                                Vous êtes sur le point d'annuler la soumission de ce travail, l'étudiant devra recommencer la soumission.
                            </div>
                        </ConfirmDialogPopup>
                    </div>
                </div>
                }  </>
            </>}
    </div>
}


interface ButtonSubmitMemoireProps {
    initialSubject: string
    memoireId: string
    onSubmitted: () => void
}

const ButtonSubmitMemoire = (
    props: ButtonSubmitMemoireProps
) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [finalSubject, setFinalSubject] = React.useState(props.initialSubject)
    const [error, setError] = React.useState<string | null>(null)
    const [step, setStep] = React.useState<number>(1)
    const [rootPassword, setRootPassword] = React.useState<string|undefined>()

    const submit = async () => {
        if (!finalSubject) {
            setError("Le sujet est requis.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const payload = {
                subject: finalSubject,
            };
            await api(cookies).post(`/isp_stage/students-memoires/${props.memoireId}/submit/`, payload);

            setIsOpen(false);
            props.onSubmitted();

        } catch (e: any) {
            console.error(e);
            setError(e.message || "Une erreur est survenue lors de la soumission.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return <>
        <button onClick={() => setIsOpen(true)} className='bg-primary text-white text-[13px] py-[4px] px-[15px] rounded'>Soumettre le travail</button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <ModalContent>
                <ModalHeader>
                    <p>Soumettre le travail de fin de cycle</p>
                </ModalHeader>
                <ModalBody>
                    <div className='mt-[15px] flex flex-col gap-4'>
                          {
                            step === 1 && <>
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Sujet final du travail</p>
                            <input
                                type="text"
                                className='border border-inherent rounded outline-none w-full bg-transparent text-[13px] p-2'
                                value={finalSubject}
                                onChange={(e) => setFinalSubject(e.target.value)}
                            />
                        </div>
                        </> }
                        {
                            step === 2 && <>
                            <div>
                                <input placeholder='Password' onChange={(e)=> setRootPassword(e.target.value)}/>    
                            </div>      
                        </>
                        }
                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className='flex justify-end items-center gap-3 mt-4 mb-2'>
                            <button onClick={() => {
                                if(step === 2){
                                    setStep(1);
                                    return;
                                }
                                setIsOpen(false)
                            }} className='text-gray-600 text-[13px] py-[4px] px-[15px] rounded'>Annuler</button>
                            <button onClick={submit} disabled={isSubmitting} className='bg-primary text-white text-[13px] py-[4px] px-[15px] rounded flex items-center'>
                                {isSubmitting ? <Spinner size='sm' color='white' /> : "Confirmer la soumission"}
                            </button>
                        </div>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
}

