"use client"

import api from '@/lib/network/api' 
import cookies from '@/lib/shared/cookies'
import React from 'react'

export default function AcademicYearLists(){

    const [academiyears, setAcademicyears] = React.useState<[]>([]) ; 
    const [selectedAcademicyear, setSelectedAcademicyear] = React.useState<any>(undefined) ; 
    React.useEffect(()=>{
        const exec = async ()=>{
            try{
                const results = (await api(cookies).get(`/uscitech_academy/academicyear/`)).data.results;
                setAcademicyears(results)
            }catch(e){

            }

            try{
                const result = (await api(cookies).get(`/isp_stage/isp_config/user-config/001/`)).data;
                setSelectedAcademicyear(result)
            }catch(e){

            }
        }

        exec()
    }, [])


    const handleSwitch = async (id: string)=>{
        try{
            await  api(cookies).post(`/isp_stage/isp_config/set-user-config/001/`, {config_value: id}) ; 
            location.reload()
        }catch(e){
            console.error(e) 
        }
    }

    return <div>
        <div>
            {
                academiyears.map((ay: {id: string, name: string}) => {
                    return <div key={ay.id} className='flex hover:bg-bray-200 duration-300 gap-[5px]'>
                        
                        {
                           selectedAcademicyear !== undefined && ay.id !== selectedAcademicyear.id && <div onClick={()=>handleSwitch(ay.id)} className='cursor-pointer text-white py-[5px] px-[15px] bg-gray-500'>
                                <p className='text-[10px] m-0'>Basculer</p>
                           </div>
                        }
                        {
                           selectedAcademicyear !== undefined && ay.id === selectedAcademicyear.id && <div className='text-white py-[5px] px-[15px] bg-green-500'>
                                <p className='text-[10px] m-0'>En cours</p>
                           </div>
                        }
                        <div className='flex flex-1'>
                            <p>{ay.name}</p>
                        </div>
                    </div>
                })
            }
        </div>
    </div>
}