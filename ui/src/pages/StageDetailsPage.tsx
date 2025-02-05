import React from 'react'
import { PageProps } from "@/lib/shared/types/config";
import api from '@/lib/network/api';
import { cookies } from 'next/headers';
import StageMaster from '../widgets/stage/StageMaster';
import DatesStage from '../widgets/stage/details/DatesStage';
import SectionTitle from '../widgets/stage/details/SectionTitle';
import StudentDetails from '../widgets/stage/details/StudentDetails';
import PermissionComponent from '@/components/ui/PermissionComponent';
import DeleteStage from '../widgets/stage/details/DeleteStage';
import StageHorraires from '../widgets/stage/details/StageHorraires';
import StageHorraireActionBtn from '../widgets/stage/StageHorraireActionBtn';
import StageSchoolDetails from '../widgets/stage/details/StageSchoolDetails';

export default async function StageDetailsPage(props: PageProps) {

    var stage: any = undefined;
    try {
        stage = (await api(await cookies()).get(`/isp_stage/stage/${props.params.app[3]}/`)).data;
        console.log(stage)
    } catch (e) {
        return <div>

        </div>
    }

    if (stage === undefined) return <div></div>

    //    return <StageDetailsWidget stage={stage}/>
    return <div className='bg-white rounded p-[20px]'>
        <div>
            <p className='text-gray-500 text-[12px]'>Détails du Stage</p>
        </div>

        <SectionTitle text={"Détails de l'étudiant"} />
        <StudentDetails label={"Nom Complet"} value={<p>{stage.student?.user?.name} {stage.student?.user?.first_name} {stage.student?.user?.last_name}</p>} />
        <StudentDetails label={"Téléphone"} value={<p>{stage.student?.user?.phone}</p>} />
        <StudentDetails label={"Département"} value={<p>{stage.student?.promotion?.grade.libelle}</p>} />
        <StudentDetails label={"Promotion"} value={<p>{stage.student?.promotion?.libelle}</p>} />

        <SectionTitle text={"Période & Encadrement"} />
        <StudentDetails label={"Date de début"} value={
            <PermissionComponent
                user={props.user}
                permissions={["isp_user_student"]}
                children={<DatesStage stage={stage} typeDate={"start_date"}/>}
                notGranted={<p>{stage.start_date ? stage.start_date : "--/--/--"}</p>}
            />
        } />
        <StudentDetails label={"Date de fin"} value={
            <PermissionComponent
                user={props.user}
                permissions={["isp_user_student"]}
                children={<p>{stage.end_date ? stage.end_date : "--/--/--"}</p>}
                // notGranted={<p>{stage.start_date ? stage.start_date : "--/--/--"}</p>}
            />
        } />
        
        <div>
            <StageMaster stage={stage} {...props}/>
        </div>
            
        {
            stage.stage === "pedagogique" && <>
                <StageSchoolDetails user={props.user} stage={stage} />

                <SectionTitle text={"Horraires"} />
                <p>Avant-midi : </p>
                <StageHorraires user={props.user} stage={stage} prefix='am' />
                <p className='mt-[15px]'>Après-midi : </p>
                <StageHorraires user={props.user} stage={stage} prefix='pm' />
                <StageHorraireActionBtn user={props.user} stage={stage}/>
            </>
        }
        <div className='mt-[30px]'>
        <PermissionComponent
                user={props.user}
                permissions={["isp_departement_officier"]}
                children={<DeleteStage />} 
                notGranted={<>
                {props.user.is_superuser === true && <DeleteStage /> }
                </>}
            />
        </div>
        
    </div>

}