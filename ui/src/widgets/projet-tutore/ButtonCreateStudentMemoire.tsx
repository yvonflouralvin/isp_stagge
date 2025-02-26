'use client'
import api from '@/lib/network/api';
import cookies from '@/lib/shared/cookies';
import { Spinner } from '@nextui-org/react';
import React from 'react';
import { ProjetTutoreFormPageProps } from '../../types';
import { PageProps } from '@/lib/shared/types/config';
import { Student } from '/addons/uscitech_academy/ui/src/types';

interface StudentProjetTutoreProps extends PageProps {
    student?: Student
    redirect?: string
}
export default function ButtonCreateStudentMemoire(props: StudentProjetTutoreProps) {
    const [isCreating, setIsCreating] = React.useState(false)
    const handleClick = async () => {
        if(props.student === undefined)return;
        setIsCreating(true);
        try {
            await api(cookies).post(`/isp_stage/students-memoires/`, {
                subject: "Sujet à définir...",
                student_id: props.student.id
            })
            if (props.redirect) window.location.href = props.redirect 
            else window.location.reload()
        } catch (e) {

        }
    }
    return <>
        {
            isCreating === false ? <button className="bg-primary text-white text-[13px] py-[4px] px-[15px] rounded" onClick={handleClick}>Créer maintenant</button> : <Spinner size='sm' />
        }
    </>
}