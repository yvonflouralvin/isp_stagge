import { PageProps } from "@/lib/shared/types/config";
import DeptRechercheUsers from "./DeptRechercheUsers";
import StageDetailsPage from "./StageDetailsPage";
import StageMasterUsers from "./StageMasterUsers";
import StageEntreprise from "./StageEntreprise";
import NoActiveFeatures from "./NoActiveFeatures";
import StageListPage from "./StageListPage";
import ProjetTutoresPage from "./ProjetTutoresPage"; 
import StudentProjetTurote from "./StudentProjetTurote";
import ProjetTutoresFormPage from "./ProjetTutoresFormPage";
import StudentMemoireListPage from "./StudentMemoireListPage";
import StudentMemoirePage from "./StudentMemoirePage";
import StudentMemoireDetailPage from "./StudentMemoireDetailPage";


export default {
    StageListPage: (props: PageProps) => StageListPage(props),
    DeptRechercheUsers: (props: PageProps) => DeptRechercheUsers(props),
    StageDetailsPage: (props: PageProps) => StageDetailsPage(props),
    StageMasterUsers: (props: PageProps) => StageMasterUsers(props),
    StageEntreprise: (props: PageProps) => StageEntreprise(props),
    NoActiveFeatures: (props: PageProps) => NoActiveFeatures(props),
    ProjetTutoresPage: (props: PageProps) => ProjetTutoresPage(props),
    ProjetTutoresFormPage: (props: PageProps) => ProjetTutoresFormPage(props),
    StudentProjetTurote: (props: PageProps) => StudentProjetTurote(props),

    StudentMemoireListPage: (props: PageProps) => StudentMemoireListPage(props),
    StudentMemoireDetailPage : (props: PageProps) => StudentMemoireDetailPage(props),
    StudentMemoirePage: (props: PageProps) => StudentMemoirePage(props)
}