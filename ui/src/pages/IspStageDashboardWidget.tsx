import api from '@/lib/network/api';
import { PageProps } from '@/lib/shared/types/config';
import { cookies } from 'next/headers';

export default async function IspStageDashboardWidget(props: PageProps) {
    console.log(props.user)
    if (props.user?.permissions?.find(perm => (
        perm === "isp_departement_officier" ||
        perm === "isp_user_stage_master" ||
        perm === "academy_is_teacher"
    )) || props.user.is_superuser === true)
        try {
            const resumes = (await api(await cookies()).get(`/isp_stage/resumes`)).data
            console.log(resumes)
            return <div className="flex w-full gap-[10px] flex-wrap mt-[20px]">
                <div className="p-[20px] rounded shadow-md bg-white flex flex-col">
                    <h4 className="text-[14px] font-bold">Etudiants Inscripts</h4>
                    <div className="flex-1 flex gap-1 items-center">
                        <h1>{resumes.students}</h1><p className="text-[10px] text-gray-400">étudiants</p>
                    </div>
                </div>

                <div className="p-[20px] rounded shadow-md bg-white flex flex-col">
                    <h4 className="text-[14px] font-bold">Stage Impregnation</h4>
                    <div className="flex-1 flex gap-1 items-center">
                        <h1>{resumes.impregnations}</h1><p className="text-[10px] text-gray-400">étudiants</p>
                    </div>
                </div>

                <div className="p-[20px] rounded shadow-md bg-white flex flex-col">
                    <h4 className="text-[14px] font-bold">Stage Pedagogique</h4>
                    <div className="flex-1 flex gap-1 items-center">
                        <h1>{resumes.pedagogiques}</h1><p className="text-[10px] text-gray-400">étudiants</p>
                    </div>
                </div>
                <div className="p-[20px] rounded shadow-md bg-white flex flex-col">
                    <h4 className="text-[14px] font-bold">Affecté</h4>
                    <div className="flex-1 flex gap-1 items-center">
                        <h1>{resumes.affected}</h1><p className="text-[10px] text-gray-400">étudiants</p>
                    </div>
                </div>
            </div>
        } catch (e) {
            console.log(e)
        }

    return <></>

}