import React from 'react'
import { PageProps } from "@/lib/shared/types/config";
import {
    Accordion,
    AccordionItem
} from '@nextui-org/react'
import api from '@/lib/network/api';
import { cookies } from 'next/headers';
import ReportsView from './ReportsView';
import ReportsForDepartmentOfficier from './ReportsForDepartmentOfficier';


export default async function Reports(props: PageProps) {
    var reports: any = undefined
    try {
        reports = (await api(await cookies()).get(`/isp_stage/admin-resumes`)).data
        if(props.user.permissions.find(perm => perm === "isp_departement_officier")){
            return <ReportsForDepartmentOfficier reports={reports}/>
        }
        return <>
            <ReportsView reports={reports} />
        </>
    } catch (e) {
        console.log(e)
        return <>
            {
                reports !== undefined && <>{JSON.stringify(reports)}</>
            }
        </>
    }

}