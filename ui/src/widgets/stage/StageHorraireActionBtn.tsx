'use client'

import { Button } from "@/components/ui/button"
import api from "@/lib/network/api"
import cookies from "@/lib/shared/cookies"
import { User } from "@/lib/shared/types"
import { SendIcon } from "lucide-react"

interface Props {
    stage: any
    user: User
}
export default function StageHorraireActionBtn(props: Props) {
    const handleValidate = () => {
        const url = `/isp_stage/stage/${props.stage.id}/update/`
        api(cookies).post(url, {
            horraire_status: true
        })
            .then(result => {
                window.location.reload()
            })
    }
    return <>
        {
            props.user.permissions.find(p => p === "isp_user_student") && <div>
                {
                    props.stage.horraire_status === false ?
                        <div className="mt-[10px]">
                            <p>Cette horraire est encore en brouillon... <Button onClick={handleValidate}>Valider <SendIcon /> </Button></p>
                        </div>
                        : <></>
                }
            </div>
        }
    </>
}