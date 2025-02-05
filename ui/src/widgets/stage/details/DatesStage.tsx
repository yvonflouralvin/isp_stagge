'use client'
import api from "@/lib/network/api";
import StageInfoFieldChange from "../StageInfoFieldChange"
import cookies from "@/lib/shared/cookies";


interface Props {
    typeDate: "start_date" | "end_date"
    stage: any, 
}
export default function DatesStage(props: Props){
    function addBusinessDays(startDate: string, numDays: number, excludedDates = []) {
        let currentDate = new Date(startDate);  // Crée une copie de la date de départ
        let daysAdded = 0;
    
        // Convertir le tableau `excludedDates` en un ensemble de dates sous forme de chaînes yyyy-mm-dd
        const excludedSet = new Set(excludedDates.map((date: any)=> date.toISOString().split('T')[0]));
    
        // Continue d'ajouter un jour à la date jusqu'à ce qu'on ait ajouté `numDays` jours ouvrables
        while (daysAdded < numDays) {
            currentDate.setDate(currentDate.getDate() + 1);  // Ajoute un jour à la date
    
            // Si ce n'est pas un samedi (6), un dimanche (0), ou une date exclue
            if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6 &&
                !excludedSet.has(currentDate.toISOString().split('T')[0])) {
                daysAdded++;
            }
        }
    
        // Format de la date au format yyyy-mm-dd
        let year = currentDate.getFullYear();
        let month = (currentDate.getMonth() + 1).toString().padStart(2, '0');  // Mois entre 01 et 12
        let day = currentDate.getDate().toString().padStart(2, '0');  // Jour entre 01 et 31
    
        return `${year}-${month}-${day}`;  // Retourne la date au format yyyy-mm-dd
    }

    const onChange = (e: any)=>{
        if(props.typeDate === "start_date"){
            const url = `/isp_stage/stage/${props.stage.id}/update/`
            api(cookies).post(url, {
                "end_date": addBusinessDays(e, 60, [])
            })
            .then(result => {
            
            })
        }
    }
    return <StageInfoFieldChange onChange={onChange} onRender={(e: any)=> <p>{e ? e : "--/--/--"}</p>} index={props.typeDate} label='Date de début' stage={props.stage} value={props.stage[props.typeDate]} type='date' onPost={(e: any)=>{}}/>
}