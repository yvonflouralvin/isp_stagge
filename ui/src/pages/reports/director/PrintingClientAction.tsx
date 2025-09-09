'use client'
import { useRouter } from 'next/navigation'
import React from 'react'
interface Props {

}
export default function PrintingClientAction(props: Props){
    const router = useRouter()
    React.useEffect(()=>{
        setTimeout(()=>{
            print()
            router.back()
        }, 5000)
    }, [])
    return <></>
}