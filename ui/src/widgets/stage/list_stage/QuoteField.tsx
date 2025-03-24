'use client'
import React from 'react'
import { PageProps } from "@/lib/shared/types/config";
import api from '@/lib/network/api';
import cookies from '@/lib/shared/cookies';
import { Spinner } from '@nextui-org/react';

interface Props extends PageProps {
    stage: any
    stagemaster: any
}
interface QuoteObject {
    stage: number,
    carnet: number,
    rapport: number,
    regularite: number,
    tenue: number,
    carnet_stage: number,
    lecon: number,
    rapport_stage: number,
    defense_rapport: number,
}

interface QuoteField {
    index:string
    label: string
    max: number
    stage:"pedagogique"|"impregnation"
    type: "value"|"function"
    callback?: (e: QuoteObject)=> any
}


export const quoteFields : QuoteField[] = [
    {
        index:"stage",
        label: "Stage",
        max: 120,
        stage:"pedagogique",
        type:"value"
    },
    {
        index:"carnet",
        label: "Carnet",
        max: 30,
        stage:"pedagogique",
        type:"value"
    },
    {
        index:"rapport",
        label: "Rapport",
        max: 10,
        stage:"pedagogique",
        type:"value"
    },
    {
        index:"total",
        label: "Total",
        max: 160,
        stage:"pedagogique",
        type:"function",
        callback: (quote: QuoteObject)=> quote.stage + quote.carnet + quote.rapport
    },
    {
        index:"moyenne",
        label: "Moyenne",
        max: 40,
        stage:"pedagogique",
        type:"function",
        callback: (quote: QuoteObject)=> (quote.stage + quote.carnet + quote.rapport)/40
    },
    {
        index:"regularite",
        label: "Régularité",
        max: 10,
        stage:"impregnation",
        type:"value"
    },
    {
        index:"tenue",
        label: "Tenue",
        max: 10,
        stage:"impregnation",
        type:"value"
    },
    {
        index:"carnet_stage",
        label: "Carnet de Stage",
        max: 10,
        stage:"impregnation",
        type:"value"
    },
    {
        index:"lecon",
        label: "Leçon",
        max: 20,
        stage:"impregnation",
        type:"value"
    },
    {
        index:"rapport_stage",
        label: "Rapport",
        max: 20,
        stage:"impregnation",
        type:"value"
    },
    {
        index:"defense_rapport",
        label: "Défense Rapport",
        max: 20,
        stage:"impregnation",
        type:"value"
    },
    {
        index:"total",
        label: "Total",
        max: 100,
        stage:"impregnation",
        type:"function",
        callback: (quote: QuoteObject)=> (quote.regularite + quote.tenue + quote.carnet_stage + quote.lecon + quote.rapport_stage + quote.defense_rapport)
    },
    {
        index:"moyenne-peda",
        label: "Moyenne",
        max: 20,
        stage:"impregnation",
        type:"function",
        callback: (quote: QuoteObject)=> (quote.regularite + quote.tenue + quote.carnet_stage + quote.lecon + quote.rapport_stage + quote.defense_rapport)/20
    }
]



export default function QuoteField(props: Props) {

    const [quoteObject, setQuoteObject] = React.useState<QuoteObject>({
        stage: props.stage.quote_object.stage ? props.stage.quote_object.stage : 0,
        carnet: props.stage.quote_object.carnet ? props.stage.quote_object.carnet : 0,
        rapport: props.stage.quote_object.rapport ? props.stage.quote_object.rapport: 0,
        regularite: props.stage.quote_object.regularite ? props.stage.quote_object.regularite: 0,
        tenue: props.stage.quote_object.tenue ? props.stage.quote_object.tenue: 0,
        carnet_stage: props.stage.quote_object.carnet_stage ? props.stage.quote_object.carnet_stage: 0,
        lecon: props.stage.quote_object.lecon ? props.stage.quote_object.lecon: 0,
        rapport_stage: props.stage.quote_object.rapport_stage ? props.stage.quote_object.rapport_stage: 0,
        defense_rapport: props.stage.quote_object.defense_rapport ? props.stage.quote_object.defense_rapport: 0,
    }) 

    const [isSavingQuote, setIsSavingQuote] = React.useState(false)
    const updateQuote = async (value: any) => {
        setIsSavingQuote(true)
        try {
            const url = `/isp_stage/stage/${props.stage.id}/update/`
            await api(cookies).post(url, {
                quote_object: quoteObject
            })
        } catch (e) {

        }
        setIsSavingQuote(false)
    }
    React.useEffect(() => {
        if (props.params.app[3] === "cotations") {
            updateQuote(quoteObject) 
        }
    }, [quoteObject])

    // if (props.stage.quote_status === "draft")
    const classname = `
        py-[5px]
        outline-none 
        duration-300 
        text-[13px]
        w-full 
        text-center  
        focus:border-bg-primary 
        bg-transparent 
        border-l border-black
        appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]
    `;
    const classname_div = `flex justify-end w-[41px]`
    return <>
        {
            (
                props.params.app[3] === "cotations" && 
                props.stage.quote_status === "draft" &&
                props.stagemaster !== undefined &&
                ((props.stage.quote_by?.employee.user?.id === props.user.id && props.stage.quote_by) || (props.stage.quote_by === null || props.stage.quote_by === undefined))) ? 
                <>
                {
                    quoteFields.filter(field => field.stage === props.params.app[2]).map((field: QuoteField) => {
                        return <div className={classname_div} key={field.index}>
                            {
                                field.type === "value" ? 
                                    <input 
                                        value={`${parseFloat(`${
                                            field.index === "carnet" ? quoteObject.carnet : 
                                            field.index === "rapport" ? quoteObject.rapport : 
                                            field.index === "stage" ? quoteObject.stage : 
                                            field.index === "regularite" ? quoteObject.regularite : 
                                            field.index === "tenue" ? quoteObject.tenue : 
                                            field.index === "carnet_stage" ? quoteObject.carnet_stage :
                                            field.index === "lecon" ? quoteObject.lecon : 
                                            field.index === "rapport_stage" ? quoteObject.rapport_stage :
                                            field.index === "defense_rapport" ? quoteObject.defense_rapport : 0 
                                        }`)}`} 
                                        onChange={(e: any) => {
                                            if(parseFloat(e.target.value) > field.max) setQuoteObject({...quoteObject, [field.index]: field.max})
                                            else setQuoteObject({...quoteObject, [field.index]: e.target.value})
                                        }} 
                                        placeholder={`-/${field.max}`} 
                                        inputMode='decimal' 
                                        type='number' 
                                        max={field.max} 
                                        min={0} 
                                        className={classname} />
                                : <>
                                    <p className={classname}>{field.callback !== undefined ? field.callback(quoteObject) : 0}</p>
                                </>
                            }
                        </div>
                    })
                }
            </> : 
            <>
               {
                 quoteFields.filter(field => field.stage === props.params.app[2]).map((field: {index: string, max: number}) => {
                    return <div className={classname_div} key={field.index}>
                            <p className={classname}>{props.stage.quote_status === "draft" ? `--` : `${parseFloat(`${
                                    field.index === "carnet" ? quoteObject.carnet : 
                                    field.index === "rapport" ? quoteObject.rapport : 
                                    field.index === "stage" ? quoteObject.stage : 
                                    field.index === "regularite" ? quoteObject.regularite : 
                                    field.index === "tenue" ? quoteObject.tenue : 
                                    field.index === "carnet_stage" ? quoteObject.carnet_stage :
                                    field.index === "lecon" ? quoteObject.lecon : 
                                    field.index === "rapport_stage" ? quoteObject.rapport_stage :
                                    field.index === "defense_rapport" ? quoteObject.defense_rapport : 0 
                                }
                                `)}`}</p>
                        </div> 
                 })
               }
            </>
        }
        {/* {
            (isSavingQuote === true && props.params.app[3] === "cotations") && <Spinner size='sm' />
        } */}
    </>
    // else return <> {props.stage.quote === null ? <p>---</p> : <p>{props.stage.quote}/20</p>}</>
}