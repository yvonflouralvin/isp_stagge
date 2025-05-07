'use client'
import React from 'react'
import { SaveIcon } from "lucide-react"; 
import Breadcrumb from "@/components/ui/Breadcrumb";
import SearchSelected from "@/components/ui/SearchSelected"; 
import api from "@/lib/network/api";
import cookies from "@/lib/shared/cookies";
import { Spinner } from '@nextui-org/react';
import { Promotion, Student, StudentFormPageProps } from '/addons/uscitech_academy/ui/src/types';
import OnDeleteButton from '@/components/ui/OnDeleteButton';
import OnActionButton from '@/components/ui/OnActionButton';
import PermissionComponent from '@/components/ui/PermissionComponent';

interface StudentFormProps extends StudentFormPageProps {
    student?: Student
}
export default function StudentForm(props: StudentFormProps) {

    const [fullname, setFullname] = React.useState(`${props.student?.user?.name} ${props.student?.user?.last_name} ${props.student?.user?.first_name}`);
    const [selectedDepartment, setSelectedPromotion] = React.useState<string|undefined>(props.student?.promotion_id);
    const [isSaving, setIsSaving] = React.useState<boolean>(false);

    React.useEffect(()=>{
        console.log(selectedDepartment)
    }, [selectedDepartment]);

    const breadcrumb: any[] = [{
        label: "Étudiants",
        link: "/apps/isp_stage/students"
    }]

    if (props.for === "create") breadcrumb.push({
        label: "Nouveau"
    })
    if (props.student?.user !== undefined) breadcrumb.push({
        label: fullname ? fullname : ""
    })

    const save = async () => {
        if (isSaving === true) return;
        try {
            const fullname: any = document.getElementById("fullname")
            const email: any = document.getElementById("email")
            const phone: any = document.getElementById("phone")

            if (fullname.value === "" || fullname.value === undefined) return;
            if (email.value === "" || email.value === undefined) return;

            setIsSaving(true)
            const datas: any = {
                fullname: fullname.value,
                email: email.value
            }
            
            if(phone.value !== "") datas['phone'] = phone.value;
            if(selectedDepartment !== undefined && selectedDepartment !== null)datas['promotion_id'] = selectedDepartment;
             

            if (props.for === "create") {
                const result = await api(cookies).post(`/isp_stage/students/`, datas);
                window.location.href = `/apps/isp_stage/students/${result.data.id}`;
                setFullname(`${result.data.user?.name} ${result.data.user?.last_name} ${result.data.user?.first_name}`)
            } else if (props.for === "detail") {
                const result = await api(cookies).put(`/isp_stage/students/${props.student?.id}/`, datas);
                setFullname(`${result.data.user?.name} ${result.data.user?.last_name} ${result.data.user?.first_name}`);
            }

        } catch (e) {
            console.error(e)
        }
        setIsSaving(false)
    }

    return <>
        <Breadcrumb links={breadcrumb} />
        <div>
            <div className='border-t border-inherent mt-[15px] pt-[15px] h-full'>
                <div className="flex items-start">
                    <div className='flex flex-col flex-1'>
                        <p className='font-semibold text-[20px] m-0'>{ (props.for === "detail") ? `${fullname !== undefined ? fullname : ""}` : `Nouveau`}</p>
                    </div>
                    <div>
                        <button onClick={save} className='duration-300 text-white flex items-center gap-[10px] text-[13px] cursor-pointer py-[5px] px-[15px] rounded bg-primary/60 hover:bg-primary'>
                            {isSaving === false ? <><SaveIcon size={"13px"} color="white" /> Enregistrer</> : <Spinner size='sm' />}
                        </button>
                    </div>
                </div>
                <div className="mt-[10px]"></div>
                <div className=''>
                    <div className='border-b border-inherent w-full'>
                        <p className='font-light text-[12px] text-gray-500'>Nom Complet</p>
                        <input id="fullname" name="fullname" className='border-0 outline-none w-full bg-transparent text-[13px]' defaultValue={props.student !== undefined ? `${fullname}` : ``} />
                    </div>
                </div>
                <div className='flex gap-[15px] mt-[15px]'>
                    <div className='border-b border-inherent w-full'>
                        <p className='font-light text-[12px] text-gray-500'>Email</p>
                        <input id="email" name="email" className='border-0 outline-none w-full bg-transparent text-[13px]' defaultValue={props.student?.user?.email !== undefined ? `${props.student?.user?.email}` : ``} />
                    </div>
                    <div className='border-b border-inherent w-full'>
                        <p className='font-light text-[12px] text-gray-500'>Téléphone</p>
                        <input id="phone" name="phone" className='border-0 outline-none w-full bg-transparent text-[13px]' defaultValue={(props.student?.user?.phone !== null && props.student?.user?.phone !== undefined) ? `${props.student?.user?.phone}` : ``} />
                    </div>
                </div>
                <div className="mt-[15px]">
                    <SearchSelected  defaultValue={ (props.student !== undefined && props.student !== null) ? `${props.student?.promotion?.libelle} ${props.student?.promotion?.grade?.libelle}` : ""} onChange={(e: Promotion)=>setSelectedPromotion(e.id)} label='Promotion' render={(e: any) => (`${e.libelle} ${e.grade.libelle}`)} index='id' url='/isp_stage/promotions/' />
                </div>
            </div>
            {
                props.student !== undefined && <div className='mt-[30px]'>
                <PermissionComponent
                        user={props.user}
                        permissions={["isp_departement_officier"]}
                        children={<>
                            <OnDeleteStudent student={props.student} />
                            <OnActionButton 
                                btnTitle='Réinitialiser le mot de passe'
                                popupTitle='Réinitialiser le mot de passe'
                                onAction={async ()=>{
                                    await api(cookies).post(`/isp_stage/students/${props.student?.id}/reset_password/`)
                                }}
                                message={`Vous êtes sur le point de réinitialiser le mot de passe de l\'étudiant : ${props.student?.user?.name}`}
                                color='bg-primary'
                            />
                        </>} 
                        notGranted={<>
                        {props.user.is_superuser === true &&  <OnDeleteStudent student={props.student} />}
                        </>}
                    />
                 
                </div>
            }
        </div>
    </>
}



interface OnDeleteStudentProps {
    student: Student 
}
const OnDeleteStudent = (props: OnDeleteStudentProps)=> {
    return <>
        <OnDeleteButton 
            back_url={`/apps/isp_stage/students/`}
            message={`Vous êtes sur le point de supprimer l'étudiant : ${props.student.user.name}`}
            url={`/uscitech_academy/students/${props.student.id}/`}
        />
    </>
}