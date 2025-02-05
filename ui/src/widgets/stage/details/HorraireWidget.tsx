'use client'
import React from 'react'

interface Props {
    empty: React.ReactNode,
    value: any
}

export default function HorraireWidget(props: Props){
    return <>
        {
            (props.value === undefined || props.value === "") ? props.empty : <p>{props.value}</p>
        }
    </>
}