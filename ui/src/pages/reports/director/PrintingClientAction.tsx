'use client'
import { useRouter } from 'next/navigation'
import React from 'react'
interface Props {

}
export default function PrintingClientAction(props: Props){
    const router = useRouter()
    React.useEffect(()=>{
        print()
        router.back()
    }, [])
    return <></>
}