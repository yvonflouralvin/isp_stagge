import { PageProps } from '@/lib/shared/types/config' 
import api from '@/lib/network/api'
import { cookies } from 'next/headers' 
import StudentForm from './StudentForm'
import { StudentFormPageProps } from '/addons/uscitech_academy/ui/src/types'


export default async function StudentFormPage(props: StudentFormPageProps) {
    const id = props.params.app[3]
    if(props.for === "detail")
        try {
            const student = await api(await cookies()).get(`/isp_stage/students/${id}/`)
            return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
                <StudentForm {...props} student={student.data} />
            </div>
        } catch (e) {
            console.log(e)
            return <div><p>404</p></div>
        }
    else
        try { 
            return <div className='flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]'>
                <StudentForm {...props} />
            </div>
        } catch (e) {
            console.log(e)
            return <div><p>404</p></div>
        }
}