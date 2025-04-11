import React from 'react';
import { PageProps } from "@/lib/shared/types/config"; 
import ListProjetTutores from '../widgets/projet-tutore/ListProjetTutores'; 
import { DepartmentSettings } from '../types';
import api from '@/lib/network/api';
import { cookies } from 'next/headers';


export default async function ProjetTutoresPage(props: PageProps) {
    var department_settings: DepartmentSettings | undefined = undefined;
    try {
        department_settings = ((await api(await cookies()).get(`/isp_stage/department-settings/me/`)).data)
    } catch (e) { 
        
    }
    return <>
                <ListProjetTutores {...props} />
        </>
}