'use client'
import React from 'react';

import { PageProps } from "@/lib/shared/types/config";
import { UploadCloudIcon } from "lucide-react";
import { Modal, ModalBody, ModalContent, ModalHeader, Spinner } from '@nextui-org/react'; 
import SearchSelected from "@/components/ui/SearchSelected";
import api from '@/lib/network/api';
import cookies from '@/lib/shared/cookies';
import { Promotion } from '/addons/uscitech_academy/ui/src/types';

export default function StudentUploadLists(props: PageProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [selectedPromotion, setSelectedPromotion] = React.useState<string | undefined>(undefined);
    const inputFile = React.useRef<any>()
    const [isSaving, setIsSaving] = React.useState(false)

    const uploadStudents = async () => {
        if (selectedPromotion === undefined) return;
        const file = inputFile.current.files[0]
        if (!file) {
            console.error("Veuillez sélectionner un fichier.");
            return;
        }

        setIsSaving(true)
    
        const formData = new FormData();
        formData.append("file", file);
        formData.append("promotion_id", selectedPromotion)
    
        try {
            const response = await api(cookies).post(
                "/isp_stage/students/bulk-upload/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data", 
                    },
                }
            );
    
            console.log("Importation réussie :", response.data);
            setIsOpen(false)
            alert("Importation réussie !");
            window.location.reload()
        } catch (error: any) {
            console.error("Erreur lors de l'importation :", error.response?.data || error.message);
            alert("Erreur lors de l'importation !");
        }

        setIsSaving(false)
    };


    return <>
        <div onClick={() => setIsOpen(true)} className="duration-300 border border-gray-500 hover:border-primary flex items-center gap-[2px] text-[13px] text-gray-500 hover:text-primary font-bold cursor-pointer rounded py-[5px] px-[15px]">
            <UploadCloudIcon className="cursor-pointer" size={13} />
            <p>Importer</p>
        </div>
        <Modal isOpen={isOpen} onClose={() => {
            setIsOpen(false)
        }}>
            <ModalContent>
                <ModalHeader>
                    Uploader un fichier
                </ModalHeader>
                <ModalBody>
                    <div className='border-b border-inherent'>
                        <p className='text-gray-400 text-[13px]'>Choisissez le fichier Excel</p>
                        <input type='file' ref={inputFile} />
                    </div>
                    <SearchSelected onChange={(e: Promotion) => setSelectedPromotion(e.id)} label='Promotion' render={(e: any) => (`${e.libelle} ${e.grade.libelle}`)} index='id' url='/isp_stage/promotions/' />

                    <div className='my-[10px] border border-inherent p-[10px] rounded'>
                        <p className='font-semibold text-[13px]'>Inscrutions : </p>
                        <p className='text-gray-400 text-[13px]'>Le fichier Excel a importer doit contenir 5 colonnes : <span className='font-semibold'>name</span>, <span  className='font-semibold'>last_name</span>, <span  className='font-semibold'>first_name</span>, <span  className='font-semibold'>phone</span>, <span  className='font-semibold'>email</span> </p>
                    </div>
                    <div className='mt-[15px] flex justify-end'>
                        {
                            isSaving === false ? <button onClick={uploadStudents} className='rounded text-white py-[4px] px-[15px] bg-primary text-[13px]'>Importer</button> : 
                            <Spinner size='sm' />
                        }
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
}