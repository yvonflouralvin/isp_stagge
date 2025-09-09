'use client'

import { Input } from "@/components/ui/input";
import { PageProps } from "@/lib/shared/types/config";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@nextui-org/react";
import React from 'react';
import api from "@/lib/network/api";
import cookies from "@/lib/shared/cookies";
import toastify from "@/lib/shared/toastify";
import { UploadIcon } from "lucide-react";
import useEvent from "@/lib/hooks/useEvent";
import useJob from "@/lib/hooks/useJob";

interface Props extends PageProps {

}

interface FormValues {
    index?: string
    fichier_excel?: File
}

export default function AddStageQuoteListPopup(props: Props) {
    const [values, setValues] = React.useState<FormValues>({});
    const [isSaving, setIsSaving] = React.useState(false);

    const [isOpen, setIsOpen] = React.useState<boolean>(false)

    const {
        dispatch
    } = useEvent()

    const { trigger, running } = useJob({
        callback: (data: any) => {
            if (data.jobId === undefined) return;
            dispatch("list-stage-pedagogique-updated", {})
        },
        onTrigger: async (e: any) => {
            e.preventDefault()
            setIsSaving(true)
            try {
                const formData = new FormData();

                // Add all values to formData
                for (const [key, value] of Object.entries(values)) {
                    formData.append(key, value as string);
                }

                const result = await api(cookies).post(`/isp_stage/dept-recherche-officier/post_excel_student_pedagogique/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                setIsOpen(false)
                return Promise.resolve(result.data?.jobId)
            } catch (e) {
                toastify("Une erreur est survenue lors de l'enregistrement de la dépense", { type: "error" })
            }
            setIsSaving(false)
            return Promise.reject(undefined)
        }
    })

    
    return <>
        <div className="flex items-center cursor-pointer gap-[10px]" onClick={() => setIsOpen(true)}><p>Importe des points</p><UploadIcon size={14} /></div>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <ModalContent>
                <div>
                    <ModalHeader>Ajouter une dépense</ModalHeader>
                    <ModalBody>
                        <p>Choisissez la cote à affecter</p>
                        <div className="ml-[10px] mb-[10px]">
                            <div className="flex items-center gap-[10px]">
                                <input name="index" onClick={() => setValues({ ...values, index: "seminaire" })} type="radio" /><p>Seminaire de Stage (A)</p>
                            </div>
                            <div className="flex items-center gap-[10px]">
                                <input name="index" onClick={() => setValues({ ...values, index: "stage_master" })} type="radio" /><p>Maitre de Stage (B)</p>
                            </div>
                            <div className="flex items-center gap-[10px]">
                                <input name="index" onClick={() => setValues({ ...values, index: "soutenance" })} type="radio" /><p>Soutenance (D)</p>
                            </div>
                            <div className="flex items-center gap-[10px]">
                                <input name="index" onClick={() => setValues({ ...values, index: "lecture" })} type="radio" /><p>Lecture des documents (E)</p>
                            </div>
                        </div>
                        <Input
                            type="file"
                            label="Facture"
                            accept=".xlsx"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setValues({ ...values, fichier_excel: e.target.files[0] })
                                }
                            }}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <div className="flex justify-end w-full items-center gap-[10px]">
                            {
                                isSaving === false ? <>
                                    <p onClick={() => setIsOpen(false)} className="cursor-pointer text-[13px] text-gray-400">Annuler</p>
                                    <button onClick={trigger} className="flex items-center px-[15px] py-[2px]  text-[13px] gap-[5px] bg-primary duration-300 hover:bg-primary/50 text-white">Ajouter</button>
                                </> : <Spinner size="sm" />
                            }
                        </div>
                    </ModalFooter>
                </div>
            </ModalContent>
        </Modal>
    </>
}