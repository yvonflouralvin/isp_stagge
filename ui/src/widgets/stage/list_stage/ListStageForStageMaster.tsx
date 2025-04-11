'use client'
import { PageProps } from "@/lib/shared/types/config";
import Link from "next/link"; 
import QuoteFieldComponent from "./QuoteFieldComponent";
import { DownloadIcon } from "lucide-react";
import api from "@/lib/network/api";
import cookies from "@/lib/shared/cookies";
import AddStageQuoteListPopup from "../../AddStageQuoteListPopup";
import { QuoteField } from "../ListStages";

interface Props extends PageProps {
    stages: any[]
    stagemaster: any
    quoteFields: QuoteField[]
}


export default function ListStageForStageMaster(props: Props) {
    const wrapper = (e: any, children: React.ReactNode) => {
        const className = `duration-300 hover:bg-[rgba(0,0,0,0.03)] w-full flex items-center cursor-pointer`
        if (props.params.app[3] === "cotations") {
            return <div className={className} key={e.id}>
                {children}
            </div>
        } else {
            return <Link
                key={e.id}
                href={`/apps/isp_stage/${props.params.app[2]}/${e.id}`}
                className={className}>
                {children}
            </Link>
        }
    }
    return <>
        <div className='shadow-0 w-full overflow-y-scroll'>
            <div className=" 
                items-end 
                w-full 
                flex  
                border-b
                border-black
                text-black 
                font-semibold  
                h-[150px]">
                <p className="flex-1 px-[15px] text-[13px] ">NOMS & POST-NOMS</p>
                {
                    props.quoteFields.filter(field => field.stage === props.params.app[2]).map((field) => {
                        return <div key={field.index} className="border-l border-black flex items-center justify-center text-center h-[150px] w-[41px]">
                            <p
                                className="text-[11px] px-[5px] text-right flex items-center justify-center h-full w-[200px] rotate-[-90deg] whitespace-nowrap
                                    m-0
                                ">
                                {field.label}/{field.max}</p>
                        </div>
                    })
                }
            </div>
            <div className="flex flex-col  w-full border-b border-black divide-y-[1px] divide-black">
                {
                    props.stages.map((stage, index) => {
                        return wrapper(stage, <>
                            <p className="flex-1 px-[15px] text-[13px] text-gray-500">{(props.params.app.length === 6 && props.params.app[5] === "printing") ? `${index + 1}. ` : ""}{stage.student.user?.name} {stage.student.user?.last_name}</p>
                            <QuoteFieldComponent {...props} stage={stage} />
                        </>)
                    })
                }
            </div>
        </div>
        <>
                {
                    props.params.app.length == 4 && <>
                    {
                props.params.app[3] === "fiche-centralisatrice" && <div>
                    <ButtonDownloadQuoteFile />
                    <AddStageQuoteListPopup {...props} />
                </div>
            }</>
                }
        </>
            
    </>
}


const ButtonDownloadQuoteFile = ()=>{
    ///isp_stage/dept-recherche-officier/generer_excel_student_pedagogique/

    const handleDownload = async ()=>{
        try{
            const response = (await api(cookies).get(`isp_stage/dept-recherche-officier/generer_excel_student_pedagogique/`)).data
            /**
             * Déclenche le téléchargement d'un fichier à partir d'une URL.
             *
             * @param {string} url - L'URL du fichier à télécharger.
             * @param {string} [nomFichier=''] - Le nom de fichier suggéré pour le téléchargement.
             * Si non spécifié, le navigateur utilisera
             * généralement le nom de fichier de l'URL.
             */
            const lien = document.createElement('a');
            lien.href = response;
            lien.download = 'excel_student_pedagogique'; // L'attribut 'download' suggère un nom de fichier

            // Ajouter le lien au corps du document (il n'a pas besoin d'être visible)
            document.body.appendChild(lien);

            // Simuler un clic sur le lien pour démarrer le téléchargement
            lien.click();

            // Supprimer le lien du corps du document après le clic
            document.body.removeChild(lien);
        }catch(e){

        }
    }
    return <div className="flex gap-[10px] items-center cursor-pointer" onClick={handleDownload}>
    <p>Télécharger le fichier des cotes</p>
    <DownloadIcon size={13}/>
</div>
}