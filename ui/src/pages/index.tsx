import { PageProps } from "@/lib/shared/types/config";  
import DeptRechercheUsers from "./DeptRechercheUsers";
import StageDetailsPage from "./StageDetailsPage";
import StageMasterUsers from "./StageMasterUsers";
import StageEntreprise from "./StageEntreprise";
import NoActiveFeatures from "./NoActiveFeatures";
import StageListPage from "./StageListPage";


export default { 
    StageListPage: (props: PageProps) => StageListPage(props),
    DeptRechercheUsers: (props: PageProps) => DeptRechercheUsers(props),
    StageDetailsPage: (props: PageProps) => StageDetailsPage(props),
    StageMasterUsers: (props: PageProps) => StageMasterUsers(props),
    StageEntreprise: (props: PageProps) => StageEntreprise(props),
    NoActiveFeatures: (props: PageProps) => NoActiveFeatures(props)
}