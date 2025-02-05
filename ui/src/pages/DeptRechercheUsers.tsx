import { Input } from "@/components/ui/input";
import { PageProps } from "@/lib/shared/types/config";
import AddUsers from "../widgets/stage/AddUsers";
import api from "@/lib/network/api";
import { cookies } from "next/headers";
import ListUsers from "../widgets/stage/ListUsers";

export default async function DeptRechercheUsers(props: PageProps) {
    try {
        const sections: any[] = (await api(await cookies()).get(`/uscitech_academy/gradesections/`)).data;
        const gradeclasses: any[] = (await api(await cookies()).get(`/uscitech_academy/gradeclasses/`)).data;
        
       
        return <div>
            <div className='bg-white rounded shadow p-[20px]'>
                <div className='flex items-center'>
                    <div className='flex-1'>
                        <h1>Chef de la recherche des départements</h1>
                    </div>
                    <AddUsers gradeclasses={gradeclasses} sections={sections} /> 
                </div>
                <div className='mt-[5px]'>
                    <Input placeholder='Recherche' />
                </div>
            </div>
            <div className='mt-[5px]'>
                <ListUsers />
            </div>
        </div>
    } catch (e) {
        return <></>
    }
}