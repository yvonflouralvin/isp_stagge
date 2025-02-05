'use client'
import React from 'react'
import { PageProps } from "@/lib/shared/types/config";
import api from '@/lib/network/api';
import cookies from '@/lib/shared/cookies';
import { Spinner } from '@nextui-org/react';

interface Props extends PageProps {
    stage: any
}
export default function QuoteField(props: Props) {
    const [quote, setQuote] = React.useState(props.stage.quote)
    const [isSavingQuote, setIsSavingQuote] = React.useState(false)
    const updateQuote = async (value: any) => {
        setIsSavingQuote(true)
        try {
            const url = `/isp_stage/stage/${props.stage.id}/update/`
            await api(cookies).post(url, {
                quote: value
            })
        } catch (e) {

        }
        setIsSavingQuote(false)
    }
    React.useEffect(() => {
        if (props.params.app[3] === "cotations") {
            if (quote === "") {
                setQuote(null)
                updateQuote(null)
            } else {
                updateQuote(quote)
            }
        }
    }, [quote])

    if (props.stage.quote_status === "draft")
        return <div className="flex items-center gap-1">
            {
                (props.params.app[3] === "cotations" && ((props.stage.quote_by?.user?.id === props.user.id && props.stage.quote_by) || (props.stage.quote_by === null || props.stage.quote_by === undefined))) ? <>
                    <input value={`${quote === "" ? "" : `${quote}`}`} onChange={(e: any) => setQuote(e.target.value)} placeholder="Cote de l'étudiant" type='number' max={20} min={0} className='outline-none border-1 border-inherent py-[2px] px-[10px]' />
                </> : <>
                    {
                        props.stage.quote === null ? <p>---</p> : <p>{props.stage.quote}/20</p>
                    }
                </>
            }
            {
                (isSavingQuote === true && props.params.app[3] === "cotations") && <Spinner size='sm' />
            }
        </div>
    else return <> {props.stage.quote === null ? <p>---</p> : <p>{props.stage.quote}/20</p>}</>
}