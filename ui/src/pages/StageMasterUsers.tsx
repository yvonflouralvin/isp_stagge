import { Input } from "@/components/ui/input";
import { PageProps } from "@/lib/shared/types/config";  
import AddStageMaster from "../widgets/stage/AddStageMaster";
import ListStageMasterUsers from "../widgets/stage/stage_master_users/ListStageMasterUsers";
import PermissionComponent from '@/components/ui/PermissionComponent';

export default async function StageMasterUsers(props: PageProps) {
    try {
       
        return <div>
            <div className='bg-white rounded shadow p-[20px]'>
                <div className='flex items-center'>
                    <div className='flex-1'>
                        <h1>Maitres de Stage</h1>
                    </div>
                </div>
                
            </div>
            <div className='mt-[5px]'>
                <ListStageMasterUsers {...props} />
            </div>
        </div>
    } catch (e) {
        return <></>
    }
}