import React from 'react';
import { PageProps } from "@/lib/shared/types/config";
import Breadcrumb from '@/components/ui/Breadcrumb'
import api from '@/lib/network/api';
import { cookies } from 'next/headers';
import { ProjetTutore } from '../types';
import { Student } from '/addons/uscitech_academy/ui/src/types';
import ProjetTutoreForm from '../widgets/projet-tutore/ProjetTutoreForm';


export default async function ProjetTutoresFormPage(props: PageProps) {
    try {
        const projetTutore: ProjetTutore = (await api(await cookies()).get(`/isp_stage/projets-tutores/${props.params.app[3]}/`)).data;
        const members: Student[] = [];
        for (let index = 0; index < projetTutore.member.length; index++) {
            const _id = projetTutore.member[index];
            const _tmp: Student = (await api(await cookies()).get(`/uscitech_academy/students/${_id}/`)).data
            members.push(_tmp);
        }
        return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
            <Breadcrumb links={[
                {
                    label: "Projets Tutorés",
                    link: "/apps/isp_stage/projets-tutores"
                },
                {
                    label: "Détails",
                    link: "/apps/isp_stage/projets-tutores"
                }
            ]} />
            <ProjetTutoreForm for='detail' {...props} projet={projetTutore} members={members}  />
        </div>
    } catch (e) {
        console.log(e)
        return <div><p>404</p></div>
    }
}