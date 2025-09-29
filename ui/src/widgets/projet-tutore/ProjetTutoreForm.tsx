'use client'
import React from 'react'
import { ProjetTutore, ProjetTutoreFormPageProps } from "../../types";
import SearchSelected from "@/components/ui/SearchSelected";
import { Student, Teacher } from "/addons/uscitech_academy/ui/src/types";
import { Modal, ModalBody, ModalContent, ModalHeader, Spinner } from '@nextui-org/react';
import cookies from '@/lib/shared/cookies';
import api from '@/lib/network/api';
import ConfirmDialogPopup from '@/components/ui/ConfirmDialogPopup';
import OnDeleteButton from '@/components/ui/OnDeleteButton';
import { stringify } from 'querystring';


export default function ProjetTutoreForm(props: ProjetTutoreFormPageProps) {
    console.log(props.department_settings);
    const [memberIds, setMemberIds] = React.useState<Student[]>(props.members)
    const [isSaving, setIsSaving] = React.useState(false)
    const [selectedTeacher, setSelectedTeacher] = React.useState<string | undefined>((props.projet?.director_id && props.projet?.director_id !== null && props.projet?.director_id !== null) ? props.projet?.director_id : undefined)
    const [projet_submition, setProjetSubmition] = React.useState<any > ()
    React.useEffect(() => {
        console.log(props.projet)
        if(props.projet?.status === "submitted"){
            const exec = async ()=>{
                const details =  await api(cookies).get(`/isp_stage/projets-tutores/${props.projet?.id}/details_submission/`)
                setProjetSubmition(details.data)
                console.log(details.data)
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
                member: memberIds.map(mids => (mids.id)),
                head_id: props.projet?.head_id
            }
            if (selectedTeacher !== undefined) datas["director_id"] = selectedTeacher
            const result: ProjetTutore = await api(cookies).put(`/isp_stage/projets-tutores/${props.projet?.id}/`, datas);


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
                    <>
                        {
                            (props.projet?.director !== undefined && props.projet?.director !== null) ? <div className='flex items-start gap-[10px]'>
                                <div className='flex-1'>
                                    <p className='text-gray-500 font-light m-0 text-[13px]'>Directeur</p>
                                    <p className='font-semibold text-[13px] m-0 border-b border-inherent'>{selectedTeacher ? props.projet?.director?.employee.fullname : "--"}</p>
                                </div>
                                {
                                    (selectedTeacher !== undefined) && <>
                                        {
                                            props.user.permissions.find(perm => perm === "isp_departement_officier") && <>
                                                {
                                                    (isSaving === true) ? <Spinner /> : <>{props.projet?.status !== "submitted" && <ConfirmDialogPopup onConfirm={async () => {
                                                        setIsSaving(true)
                                                        try {
                                                            const datas: any = {
                                                                subject: props.projet?.subject,
                                                                member: memberIds.map(mids => (mids.id)),
                                                                head_id: props.projet?.head_id,
                                                                director_id: null
                                                            }
                                                            const result: ProjetTutore = await api(cookies).put(`/isp_stage/projets-tutores/${props.projet?.id}/`, datas);
                                                            setSelectedTeacher(undefined)
                                                        } catch (e) {
                                                            console.error(e)
                                                        }
                                                        setIsSaving(false)
                                                    }} label='Retirer' title='Retirer le directeur'>
                                                        <div>
                                                            Vous êtes sur le point de retirer le directeur de ce étudiant
                                                        </div>
                                                    </ConfirmDialogPopup>
                                                    }  </>
                                                }
                                            </>
                                        }
                                    </>
                                }
                            </div>
                                :
                                <>
                                    {
                                        (props.for === "create" && props.projet?.head_id === props.student?.id) ?
                                            <SearchSelected selectedFirstDefault={false} extraparams='&direction_type=projet-tutore' onChange={(e: Teacher) => setSelectedTeacher(e.id)} label='Directeur' render={(e: Teacher) => (`${e.employee.fullname}`)} index='id' url='/isp_stage/directeur-travaux/' /> : <>
                                                <p className='text-gray-500 font-light m-0 text-[13px]'>Directeur</p>
                                                <p>--</p>
                                            </>
                                    }
                                </>
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
                (props.for === "create" && props.department_settings !== undefined && props.department_settings.max_tutore_project_member_group > memberIds.length) && <div className='mt-[15px]'>
                    {
                        ((props.projet !== null && props.projet?.status !== "submitted")) && <ButtonAddMember onChange={(e: Student) => {
                            if (memberIds.find(mid => mid.id === e.id)) return;
                            setMemberIds([
                                ...memberIds,
                                e
                            ])
                        }} />
                    }

                </div>
            }

        </div>

        {
            props.for === "create" && <div className='mt-[15px] border-t border-inherent flex w-full justify-end'>
                {
                    isSaving === false ? <>{((props.projet !== null && props.projet?.status !== "submitted")) && <button onClick={handleSave} className='bg-primary text-white text-[13px] py-[4px] px-[15px] rounded'>Enregistrer toutes les modidications</button>} </> : <Spinner size='sm' />
                }
            </div>
        }

        {
            props.projet !== null && props.projet?.status !== "submitted" && <>
                {
                    props.user.permissions.find((perm: string) => perm === "isp_departement_officier") && <div className='mt-[10px]'>
                        <OnDeleteButton
                            back_url='/apps/isp_stage/projets-tutores'
                            message={`Vous ête sur le point de supprimer le projet tutoré de cet étudiant ainsi que tout le groupe ?`}
                            url={`/isp_stage/projets-tutores/${props.projet?.id}/`}
                        />
                    </div>
                }
            </>
        }


        {
            props.user.permissions.find((perm: string) => perm === "isp_user_student") && <div className='mt-[10px]'>
                {
                    props.projet && props.projet.status !== "submitted" && <ButtonSubmitProjetTutore
                        projetId={props.projet?.id}
                        members={memberIds}
                        initialSubject={props.projet?.subject ?? ""}
                        onSubmitted={() => {
                            window.location.reload();
                        }}
                    />
                }
            </div>
        }
        {
            props.user.permissions.find(perm => perm === "isp_departement_officier") && <>
                <>{projet_submition && <div className='border border-t p-[20px] mt-[20px]'>
                    <p className='font-semibold text-lg'>Travail Soumis</p>
                    <p className='text-gray-600 mt-1'>Ce travail a déjà été soumis par le groupe.</p>

                    <div className='border-t border-gray-200 mt-4 pt-4'>
                        <h3 className='text-md font-semibold text-gray-800'>Détails de la soumission</h3>
                        <div className='mt-2'>
                            <p className='text-gray-500 font-light text-sm'>Sujet final</p>
                            <p className='font-semibold text-md'>{projet_submition?.final_subject}</p>
                        </div>
                        <div className='mt-3'>
                            <p className='text-gray-500 font-light text-sm'>Membres ayant soumis</p>
                            <div className='pl-2'>
                                {
                                    projet_submition.members.map((meb: Student) => {
                                        return <div key={meb.id}>
                                            <p className='text-sm'>- {meb.user.name} {meb.user.last_name} {meb.user.first_name} {props.projet?.head_id === meb.id ? "(Chef de groupe)" : ""}</p>
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                    </div>

                    <div className='mt-4'>
                        <ConfirmDialogPopup onConfirm={async () => {
                            setIsSaving(true)
                            try {
                                await api(cookies).post(`/isp_stage/projets-tutores/${props.projet?.id}/cancel_submission/`, {});
                                window.location.reload();
                            } catch (e) {
                                console.error(e)
                            }
                            setIsSaving(false)
                        }} label='Annuler la soumission' title='Annuler la soumission'>
                            <div>
                                Vous êtes sur le point d'annuler la soumission de ce travail, l'étudiant devra commencer la soumission.
                            </div>
                        </ConfirmDialogPopup>
                    </div>
                </div>
                }  </>
            </>}

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
                    <SearchSelected onChange={(e: Student) => setSeletedStudent(e)} label='Etudiant' render={(e: Student) => (`${e.user?.name} ${e.user?.last_name} ${e.user?.first_name}`)} index='id' url='/isp_stage/students/' extraparams='&for=projet-tutore' />
                    <div className='mt-[15px]'>
                        <button onClick={handleAdd} className='bg-[rgba(0,0,0,0.05)] text-[13px] py-[4px] px-[15px] rounded'>Ajouter</button>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
}


interface ButtonSubmitProjetTutoreProps {
    members: Student[]
    initialSubject: string
    projetId: string
    onSubmitted: () => void
}

const ButtonSubmitProjetTutore = (
    props: ButtonSubmitProjetTutoreProps
) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [finalSubject, setFinalSubject] = React.useState(props.initialSubject)
    const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([])
    const [error, setError] = React.useState<string | null>(null)
    const [step, setStep] = React.useState<number>(1)
    const [rootPassword, setRootPassword] = React.useState<string|undefined>()

    const handleToggleMember = (memberId: string) => {
        setSelectedMemberIds(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const submit = async () => {
        if(step === 1) {
            setStep(2);
            return;
        }
        if(step === 2 && rootPassword !== "toyota"){
            alert("Worn password");
            return;
        }
        if (!finalSubject || selectedMemberIds.length === 0) {
            setError("Le sujet et au moins un membre sont requis.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const payload = {
                subject: finalSubject,
                members: selectedMemberIds,
            };
            // Note: L'URL de l'API '/submit/' est une convention. Adaptez-la si nécessaire.
            await api(cookies).post(`/isp_stage/projets-tutores/${props.projetId}/submit/`, payload);

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
        <button onClick={() => setIsOpen(true)} className='bg-primary text-white text-[13px] py-[4px] px-[15px] rounded'>Soumettre le projet tutoré</button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <ModalContent>
                <ModalHeader>
                    <p>Soumettre le projet tutoré</p>
                </ModalHeader>
                <ModalBody>
                    <div className='mt-[15px] flex flex-col gap-4'>
                        {
                            step === 1 && <>
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Sujet final du projet tutoré</p>
                            <input
                                type="text"
                                className='border border-inherent rounded outline-none w-full bg-transparent text-[13px] p-2'
                                value={finalSubject}
                                onChange={(e) => setFinalSubject(e.target.value)}
                            />
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Membres inclus dans la soumission</p>
                            <div className='flex flex-col gap-2 mt-2'>
                                {
                                    props.members.map((m: Student) => (
                                        <div key={`${m.id}`} className='flex items-center gap-[10px]'>
                                            <input
                                                type='checkbox'
                                                className='h-4 w-4 rounded'
                                                checked={selectedMemberIds.includes(m.id)}
                                                onChange={() => handleToggleMember(m.id)}
                                            />
                                            <p className='text-sm'>{m.user.name} {m.user.last_name} {m.user.first_name}</p>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                         </>
                        } 
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


