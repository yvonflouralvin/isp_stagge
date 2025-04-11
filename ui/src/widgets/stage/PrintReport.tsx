'use client'

import { Button } from "@/components/ui/button"
import { PrinterIcon } from "lucide-react"
import useJob from '@/lib/hooks/useJob'
import api from "@/lib/network/api"
import cookies from "@/lib/shared/cookies"
import { Spinner } from "@nextui-org/react"

interface Props {
    children?: React.ReactNode,
    report: string, 
    datas: any,
    url?: string
}
export default function PrintReport(props: Props) {



    function downloadFile(filePath: string, fileName: string) {
        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = filePath; // Set the file path
        link.download = fileName; // Specify the file name (optional, overrides the default)

        // Append the link to the body (not displayed)
        document.body.appendChild(link);

        // Programmatically trigger a click event on the link
        link.click();

        // Remove the link from the DOM
        document.body.removeChild(link);
    }

    function printFile(filePath: string) {
        // Créer une nouvelle fenêtre (ou un onglet)
        const printWindow = window.open(filePath, '_blank');
    
        // Vérifier si la fenêtre s'est ouverte correctement
        if (printWindow) {
            printWindow.onload = () => {
                // Lancer l'impression une fois la page chargée
                printWindow.print();
    
                // Fermer la fenêtre après l'impression
                printWindow.onafterprint = () => {
                    // printWindow.close();
                };
            };
        } else {
            console.error('Impossible d\'ouvrir une nouvelle fenêtre pour l\'impression.');
        }
    }


    const { trigger, running } = useJob({
        callback: (data: any) => {
            if (data.jobId === undefined) return;
            console.log("L'impression a marché : ", data)
            // printFile(`/api/apps/reporter/reports/${payload.jobId}/`)
            downloadFile(`/api/apps/reporter/reports/${data.jobId}/`, "rapports_stagiaires.pdf")
        },
        onTrigger: async () => {
            const result = await api(cookies).post(`${props.url ? props.url : "/reporter/reporter-task/"}`, {
                report: props.report,
                datas: props.datas
            });
            return Promise.resolve(result.data?.jobId)
        }
    })
    return <div className="flex" onClick={trigger}>
        {
            props.children !== undefined ? <>{props.children}</> : <Button>{ running === true ? <Spinner size="sm" color="white"/> : <PrinterIcon size={"15px"} />}</Button>
        }
    </div>
}