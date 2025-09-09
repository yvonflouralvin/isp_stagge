'use client'
import React from 'react'
import { PageProps } from "@/lib/shared/types/config";
import { DepartmentOfficier } from "../../types";
import api from "@/lib/network/api";
import { Spinner } from "@nextui-org/react";
import { SaveIcon } from "lucide-react";
import cookies from '@/lib/shared/cookies';
import SearchSelected from "@/components/ui/SearchSelected";
import { Employee } from '/addons/hr/ui/src/types';
import { Grade } from '/addons/uscitech_academy/ui/src/types';
import toastify from '@/lib/shared/toastify'
import OnDeleteButton from '@/components/ui/OnDeleteButton';

interface Props extends PageProps {
    departmentOffier?: DepartmentOfficier
}
export default function DepartmentOfficierFormCS(props: Props) {

    const [selectedEmployee, setSelectedEmployee] = React.useState<string | undefined>((props.departmentOffier !== undefined && props.departmentOffier !== null) ? props.departmentOffier?.employee_id : undefined);
    const [selectedGrade, setSelectedGrade] = React.useState<string | undefined>(props.departmentOffier ? props.departmentOffier.dept_id : undefined);
    const [isSaving, setIsSaving] = React.useState<boolean>(false);

    const save = async () => {
        if (isSaving === true) return;
        try {

            if (selectedEmployee === undefined) return;
            if (selectedGrade === undefined) return;

            setIsSaving(true)
            const datas: any = {
                employee_id: selectedEmployee,
                dept_id: selectedGrade
            }


            if (props.departmentOffier === undefined) {
                const result = await api(cookies).post(`/isp_stage/dept-recherche-officier/`, datas);
                window.location.href = `/apps/isp_stage/dept_search_off/${result.data.id}`;
                // setFullname(`${result.data.user?.name} ${result.data.user?.last_name} ${result.data.user?.first_name}`)
            } else if (props.departmentOffier !== undefined) {
                const result = await api(cookies).put(`/isp_stage/dept-recherche-officier/${props.departmentOffier?.id}/`, datas);
                // setFullname(`${result.data.user?.name} ${result.data.user?.last_name} ${result.data.user?.first_name}`);
            }

        } catch (e) {
            console.error(e)
            // toasti
            toastify("Une erreur s'est produite !", { type: "error" })
        }
        setIsSaving(false)
    }

    return <div>
        <div className='border-t border-inherent mt-[15px] pt-[15px] h-full'>
            <div className="flex items-start">
                <div className='flex flex-col flex-1'>
                    <p className='font-semibold text-[20px] m-0'>{(props.departmentOffier === undefined) ? `Nouveau` : `${props.departmentOffier?.employee.fullname}`}</p>
                </div>
                <div>
                    <button onClick={save} className='duration-300 text-white flex items-center gap-[10px] text-[13px] cursor-pointer py-[5px] px-[15px] rounded bg-primary/60 hover:bg-primary'>
                        {isSaving === false ? <><SaveIcon size={"13px"} color="white" /> Enregistrer</> : <Spinner size='sm' />}
                    </button>
                </div>
            </div>
            <div className="mt-[10px]"></div>
            <SearchSelected defaultValue={`${(props.departmentOffier !== undefined && props.departmentOffier !== null) ? `${props.departmentOffier.dept.libelle} ${props.departmentOffier.dept.grade?.libelle}` : ""}`} onChange={(e: Grade) => setSelectedGrade(e.id)} label='Département' render={(e: Grade) => (`${e.libelle} ${e.grade?.libelle}`)} index='id' url='/uscitech_academy/gradeclasses/' />
            {
                props.departmentOffier === undefined ? <div className="mt-[15px]">
                    <SearchSelected onChange={(e: Employee) => setSelectedEmployee(e.id)} label='Responsable' render={(e: Employee) => (`${e.fullname}`)} index='id' url='/hr/employees/' />
                </div> : <div className='mt-[15px] border-b border-inherent w-full'>
                    <p className='text-[13px] text-gray-500'>Responsable</p>
                    <p className='text-[13px]'>{props.departmentOffier.employee.fullname}</p>
                </div>
            }
        </div>
        {
            props.departmentOffier !== undefined && <div className='flex w-full justify-end border-t border-inherent mt-[20px]'>
                <OnDeleteButton url={`/isp_stage/dept-recherche-officier/${props.departmentOffier.id}/`} back_url='/apps/isp_stage/dept_search_off/' message={`Vous êtes sur le point de supprimer les informations sur ${props.departmentOffier.employee?.fullname} en tant que responsable à la recherche du département ${props.departmentOffier.dept?.libelle}`} />
            </div>
        }
    </div>
}
