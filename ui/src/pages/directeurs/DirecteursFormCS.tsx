'use client'
import React from 'react'
import { PageProps } from "@/lib/shared/types/config";
import { DepartmentOfficier, DirecteurTravaux } from "../../types";
import api from "@/lib/network/api";
import { Spinner } from "@nextui-org/react";
import { SaveIcon } from "lucide-react";
import cookies from '@/lib/shared/cookies';
import SearchSelected from "@/components/ui/SearchSelected";
import { Employee } from '/addons/hr/ui/src/types'; 
import toastify from '@/lib/shared/toastify'
import OnDeleteButton from '@/components/ui/OnDeleteButton'
import { AxiosError } from 'axios';

interface Props extends PageProps {
    directeur?: DirecteurTravaux,
    departmentOfficier?: DepartmentOfficier
}
export default function DirecteursFormCS(props: Props) {

    const [selectedEmployee, setSelectedEmployee] = React.useState<string | undefined>((props.directeur !== undefined && props.directeur !== null) ? props.directeur?.employee_id : undefined);
    const [isSaving, setIsSaving] = React.useState<boolean>(false);
    const [category, setCategory] = React.useState<string>("interne");

    // category = models.CharField(choices=[
    //     ('interne', 'Du Département'),
    //     ('externe', 'Pas du Département'),

    const save = async () => {
        if (isSaving === true) return;
        try {

            if (selectedEmployee === undefined) return;

            setIsSaving(true)
            const datas: any = {
                employee_id: selectedEmployee,
                direction_type: props.params.app[3],
                category: category
            }

            if (props.departmentOfficier !== undefined){
                datas['department_id'] = props.departmentOfficier.dept.id ;
            }


            if (props.directeur === undefined) {
                const result = await api(cookies).post(`/isp_stage/directeur-travaux/`, datas);
                window.location.href = `/apps/isp_stage/directeur-travaux/${props.params.app[3]}/${result.data.id}`;
                // setFullname(`${result.data.user?.name} ${result.data.user?.last_name} ${result.data.user?.first_name}`)
            } else if (props.directeur !== undefined) {
                const result = await api(cookies).put(`/isp_stage/directeur-travaux/${props.directeur?.id}/`, datas);
                // setFullname(`${result.data.user?.name} ${result.data.user?.last_name} ${result.data.user?.first_name}`);
            }

        } catch (e: AxiosError | any) {
            let concatenatedErrors = "";

            // Parcours de chaque propriété de l'objet
            for (let key in e.response.data) {
                if (e.response.data.hasOwnProperty(key)) {
                    // Concatène chaque erreur dans la chaîne
                    concatenatedErrors += e.response.data[key].join("-") + "\n";
                }
            }
            // toasti
            toastify(concatenatedErrors.trim(), { type: "error" })
        }
        setIsSaving(false)
    }

    return <div>
        <div className='border-t border-inherent mt-[15px] pt-[15px] h-full'>
            <div className="flex items-start">
                <div className='flex flex-col flex-1'>
                    <p className='text-[13px] text-gray-400'>{`${ props.params.app[3] === "projet-tutore" ? `Directeur Projets Tutorés` : ``}
                    ${ props.params.app[3] === "memoire" ? `Directeur Mémoires` : ``}
                    ${ props.params.app[3] === "stage" ? `Maitres de  Stage` : ``}`}</p>
                    <p className='font-semibold text-[20px] m-0'>{(props.directeur === undefined) ? `Nouveau` : `${props.directeur?.employee.fullname}`}</p>
                </div>
                <div>
                    <button onClick={save} className='duration-300 text-white flex items-center gap-[10px] text-[13px] cursor-pointer py-[5px] px-[15px] rounded bg-primary/60 hover:bg-primary'>
                        {isSaving === false ? <><SaveIcon size={"13px"} color="white" /> Enregistrer</> : <Spinner size='sm' />}
                    </button>
                </div>
            </div>
            <div className="mt-[10px]"></div>
            {
                props.directeur === undefined ? <div className="mt-[15px]">
                    <SearchSelected onChange={(e: Employee) => setSelectedEmployee(e.id)} label='Directeur' render={(e: Employee) => (`${e.fullname}`)} index='id' url='/hr/employees/' />
                </div> : <div className='mt-[15px] border-b border-inherent w-full'>
                    <p className='text-[13px] text-gray-500'>Directeur</p>
                    <p className='text-[13px]'>{props.directeur.employee.fullname}</p>
                </div>
            }
            <div className='mt-[10px]'>
                <p className='text-gray-400 text-[13px]'>Catégorie</p>
                <div className='flex items-center gap-[5px]' onClick={()=>setCategory("interne")}>
                    <input type='radio' name='category' defaultChecked={category === "interne"} />
                    <p>Du Département</p>
                </div>
                <div className='flex items-center gap-[5px]'>
                    <input type='radio' name='category'  onClick={()=>setCategory("externe")} defaultChecked={category === "externe"} />
                    <p>Pas Du Département</p>
                </div>
            </div>
        </div>
        {
            props.directeur !== undefined && <div className='flex w-full justify-end border-t border-inherent mt-[20px]'>
                <OnDeleteButton url={`/isp_stage/directeur-travaux/${props.directeur.id}/`} back_url={`/apps/isp_stage/directeur-travaux/${props.params.app[3]}`} message={`Vous êtes sur le point de supprimer les informations sur ${props.directeur.employee?.fullname} en tant que directeur de travaux`} />
            </div>
        }
    </div>
}
