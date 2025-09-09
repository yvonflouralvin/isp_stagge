'use client'
import React from 'react'
import { PageProps } from "@/lib/shared/types/config";
import { DepartmentOfficier, StageMaster } from "../../types";
import api from "@/lib/network/api";
import { Spinner } from "@nextui-org/react";
import { SaveIcon } from "lucide-react";
import cookies from '@/lib/shared/cookies';
import SearchSelected from "@/components/ui/SearchSelected";
import { Employee } from '/addons/hr/ui/src/types';
import { Grade } from '/addons/uscitech_academy/ui/src/types';
import toastify from '@/lib/shared/toastify'
import OnDeleteButton from '@/components/ui/OnDeleteButton'
import { AxiosError } from 'axios';

interface Props extends PageProps {
    stageMaster?: StageMaster
}
export default function StageMasterFormCS(props: Props) {

    const [selectedEmployee, setSelectedEmployee] = React.useState<string | undefined>((props.stageMaster !== undefined && props.stageMaster !== null) ? props.stageMaster?.employee_id : undefined); 
    const [isSaving, setIsSaving] = React.useState<boolean>(false);

    const save = async () => {
        if (isSaving === true) return;
        try {

            if (selectedEmployee === undefined) return; 

            setIsSaving(true)
            const datas: any = {
                employee_id: selectedEmployee, 
            }


            if (props.stageMaster === undefined) {
                const result = await api(cookies).post(`/isp_stage/stage-master/`, datas);
                window.location.href = `/apps/isp_stage/stage-masters/${result.data.id}`;
                // setFullname(`${result.data.user?.name} ${result.data.user?.last_name} ${result.data.user?.first_name}`)
            } else if (props.stageMaster !== undefined) {
                const result = await api(cookies).put(`/isp_stage/stage-master/${props.stageMaster?.id}/`, datas);
                // setFullname(`${result.data.user?.name} ${result.data.user?.last_name} ${result.data.user?.first_name}`);
            }

        } catch (e: AxiosError|any) { 
            let concatenatedErrors = "";
            
            // Parcours de chaque propriété de l'objet
            for (let key in e.response.data) {
                if (e.response.data.hasOwnProperty(key)) {
                    // Concatène chaque erreur dans la chaîne
                    concatenatedErrors += e.response.data[key].join("-") + "\n";
                }
            }
            // toasti
            toastify(concatenatedErrors.trim(), {type:"error"})
        }
        setIsSaving(false)
    }

    return <div>
        <div className='border-t border-inherent mt-[15px] pt-[15px] h-full'>
            <div className="flex items-start">
                <div className='flex flex-col flex-1'>
                    <p className='font-semibold text-[20px] m-0'>{(props.stageMaster === undefined) ? `Nouveau` : `${props.stageMaster?.employee.fullname}`}</p>
                </div>
                <div>
                    <button onClick={save} className='duration-300 text-white flex items-center gap-[10px] text-[13px] cursor-pointer py-[5px] px-[15px] rounded bg-primary/60 hover:bg-primary'>
                        {isSaving === false ? <><SaveIcon size={"13px"} color="white" /> Enregistrer</> : <Spinner size='sm' />}
                    </button>
                </div>
            </div>
            <div className="mt-[10px]"></div> 
            {
                props.stageMaster === undefined ? <div className="mt-[15px]">
                    <SearchSelected onChange={(e: Employee) => setSelectedEmployee(e.id)} label='Maitre de Stage' render={(e: Employee) => (`${e.fullname}`)} index='id' url='/hr/employees/' />
                </div> : <div className='mt-[15px] border-b border-inherent w-full'>
                    <p className='text-[13px] text-gray-500'>Maitre de Stage</p>
                    <p className='text-[13px]'>{props.stageMaster.employee.fullname}</p>
                </div>
            }
        </div>
        {
            props.stageMaster !== undefined && <div className='flex w-full justify-end border-t border-inherent mt-[20px]'>
                <OnDeleteButton url={`/isp_stage/stage-master/${props.stageMaster.id}/`} back_url='/apps/isp_stage/stage-masters/' message={`Vous êtes sur le point de supprimer les informations sur ${props.stageMaster.employee?.fullname} en tant que maitre de stage`} />
            </div>
        }
    </div>
}
