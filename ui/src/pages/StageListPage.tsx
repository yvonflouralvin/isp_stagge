import { PageProps } from '@/lib/shared/types/config';
import React from 'react';
import api from '@/lib/network/api';
import { cookies } from 'next/headers';
import { ArchiveX, ListIcon, SheetIcon } from 'lucide-react';
import ListStageServerComponents from '../widgets/stage/ListStageServerComponents';
import Link from 'next/link';



export default async function StageListPage(props: PageProps) {

    const stage = props.params.app[2]

    var stagemaster = undefined
      try{
        stagemaster = (await api(await cookies()).get(`/isp_stage/stage-master/get-by-user/`)).data
      }catch(e){
    
      }


    const stageInfos = () => {
        const stageTypes = [
            { id: 'impregnation', label: "Imprégnation", promotion: "/isp_stage/promotions-l2" },
            { id: 'pedagogique', label: 'Pédagogique', promotion: "/isp_stage/promotions-l3" },
            { id: 'entreprise', label: 'Entreprise', promotion: "/isp_stage/promotions-l3" }
        ]

        return stageTypes.find(st => st.id === props.params.app[2])
    }

    var filtering_promotions = []
    if (props.user.permissions.find((p:string)=> p === "isp_departement_officier")){
        filtering_promotions = (await api(await cookies()).get(`/isp_stage/dept-recherche-officier/student-depts/?stage=${stage}`)).data
    }else if (props.user.permissions.find((p:string)=> p === "isp_user_stage_master")){
        filtering_promotions = (await api(await cookies()).get(`/isp_stage/stage-master/student-depts/?stage=${stage}`)).data
    }

    var promotionsL3: any[] = []
    var dept: any = undefined;
    var promotion: any = undefined;

    try {
        promotionsL3 = (await api(await cookies()).get(`${stageInfos() !== undefined ? stageInfos()?.promotion : ""}`)).data;
        // Si je suis chef de département à la recherche
        if (props.user.permissions.find(e => e === 'isp_departement_officier')) {
            dept = (await api(await cookies()).get(`/isp_stage/dept-recherche-officier/get_by_user/`)).data;
            promotion = promotionsL3.filter(pr => pr.grade.id == dept.dept.id)[0];
        }
    } catch (e) {

    }

    if (promotion === undefined && props.user.permissions.find(e => e === 'isp_departement_officier') && props.user.is_superuser === false) {
        return <div className='bg-white rounded shadow p-[20px] items-center justify-center flex flex-col h-full'>
            <div className='flex flex-col items-center justify-center max-w-[400px] gap-[20px]'>
                <ArchiveX />
                <p>Aucune L3 trouvé {promotion ? `pour le département ${dept?.dept?.libelle}` : ""}</p>
            </div>
        </div>
    }

    return <div>
        <div className='bg-white rounded shadow p-[20px]'>
            <div className='flex flex-row gap-[10px]'>
                <div className='flex-1 text-[14px]'>
                    <h1 className='m-0'>Stage {stageInfos()?.label} {promotion ? `(${promotion.grade.libelle})` : ""} </h1>
                    <p className='font-bold text-[18px]'>
                        {props.params.app[3] === "list" ? "Liste d'étudiants" : "Cotations d'étudiants"}
                    </p>
                </div>

                
                { props.user.permissions.find((pr:string) => pr === "isp_user_stage_master") && 
                    <>
                        {
                            props.params.app[3] === "list" ? <Link href={`/apps/isp_stage/${stage}/cotations`} className="flex cursor-pointer items-center gap-1">
                                <p className='text-[14px] text-gray-500 font-bold'>Cotations</p>
                                <SheetIcon size={14} />
                            </Link> : <Link href={`/apps/isp_stage/${stage}/list`} className="flex cursor-pointer items-center gap-1">
                                <p className='text-[14px] text-gray-500 font-bold'>Listes</p>
                                <ListIcon size={14} />
                            </Link>
                        }
                    </>
                }


            </div>
        </div>
        <div className='mt-[5px]'>
            <ListStageServerComponents stagemaster={stagemaster} filtering_promotions={filtering_promotions} {...props} type_stage={stage} promotion={promotion} promotions={promotionsL3} user={props.user} />
        </div>
    </div>
}