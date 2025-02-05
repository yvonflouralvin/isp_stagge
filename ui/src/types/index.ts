
export type Promotion  = {
    id: string
    libelle: string
    grade: {
        id: string
        libelle: string
        grade: {
            id: string
            libelle: string
        }
    }
}


export type AddStageForm =  {
    name: any;
    last_name: any;
    first_name: any;
    // email: any;
    phonenumber: any;
    facture: any;
    sexe: any;
    promotion: any;
    stage: any;
}