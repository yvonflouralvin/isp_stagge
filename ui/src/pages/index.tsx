import { PageProps } from "@/lib/shared/types/config";
import DeptRechercheUsers from "./DeptRechercheUsers";
import StageDetailsPage from "./StageDetailsPage";
import StageMasterUsers from "./StageMasterUsers";
import StageEntreprise from "./StageEntreprise";
import NoActiveFeatures from "./NoActiveFeatures";
import StageListPage, { StageListPageProps } from "./StageListPage";
import ProjetTutoresPage from "./ProjetTutoresPage"; 
import StudentProjetTurote from "./StudentProjetTurote";
import ProjetTutoresFormPage from "./ProjetTutoresFormPage";
import StudentMemoireListPage from "./StudentMemoireListPage";
import StudentMemoirePage from "./StudentMemoirePage";
import StudentMemoireDetailPage from "./StudentMemoireDetailPage";
import DepartmentOfficierPageSSR from "./dept_officiers/DepartmentOfficierPageSSR";
import DepartmentOfficierFormSSR from "./dept_officiers/DepartmentOfficierFormSSR";
import StageMasterPageSSR from "./stage_masters/StageMasterPageSSR";
import StageMasterFormSSR from "./stage_masters/StageMasterFormSSR";
import StudentFormPage from "./student/StudentFormPage";
import { StudentFormPageProps } from "/addons/uscitech_academy/ui/src/types";
import StudentPage from "./student/StudentPage";
import DirecteursPageSSR from "./directeurs/DirecteursPageSSR";
import DirecteursFormSSR from "./directeurs/DirecteursFormSSR";
import StageListPrintingPage from "../widgets/stage/StageListPrintingPage"; 
import StudentPrintMemoireRestStudent from "../../StudentPrintMemoireRestStudent";
import StudentPrintProjetTutoreRestStudent from "./StudentPrintProjetTutoreRestStudent";

export default {
    StageListPage: (props: StageListPageProps) => StageListPage(props),
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
    StudentMemoirePage: (props: PageProps) => StudentMemoirePage(props),

    DepartmentOfficierPageSSR : (props: PageProps) => DepartmentOfficierPageSSR(props),
    DepartmentOfficierFormSSR : (props: PageProps) => DepartmentOfficierFormSSR(props),

    DirecteurTravauxPageSSR : (props: PageProps) => DirecteursPageSSR(props),
    DirecteurTravauxFormSSR : (props: PageProps) => DirecteursFormSSR(props),

    StageMasterPageSSR : (props: PageProps) => StageMasterPageSSR(props),
    StageMasterFormSSR : (props: PageProps) => StageMasterFormSSR(props),

    StudentFormPage : (props: StudentFormPageProps) => StudentFormPage(props),
    StudentPage: (props: PageProps) => StudentPage(props),
    StageListPrintingPage: (props: PageProps) => StageListPrintingPage(props),

    StudentPrintMemoireRestStudent: (props: PageProps) => StudentPrintMemoireRestStudent(props),
    StudentPrintProjetTutoreRestStudent: (props: PageProps) => StudentPrintProjetTutoreRestStudent(props)
    
}