import { AppConfig, Menu, PageProps } from '@/lib/shared/types/config';
import pages from './src/pages';
import StageDetailsPage from './src/pages/StageDetailsPage';
import api from '@/lib/network/api';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import IspStageDashboardWidget from './src/pages/IspStageDashboardWidget';
import { Student } from '/addons/uscitech_academy/ui/src/types';
import Reports from './src/pages/reports/Reports'; 
import DirectorReportView from './src/pages/reports/director/DirectorReportView';
const config: AppConfig = {
    label: "Etudiants",
    showInMainMenu: true,
    icon: "https://www.flaticon.com/svg/static/icons/svg/2933/2933715.svg",
    dashboardLayouting: true,
    dashboardWidget: async (props: PageProps) => { return <IspStageDashboardWidget {...props} /> },
    menu: async (props: PageProps) => {
        if (props.user.permissions.find(perm => perm === "isp_user_student")) {
            try {
                const student: Student = (await api(await cookies()).get(`/uscitech_academy/students/me/`)).data
                const tmp_menu: Menu[] = []
                if (student.promotion.libelle === "L3 (LMD)") {
                    tmp_menu.push({
                        label: "Stage Pédagogique",
                        link: "/apps/isp_stage/pedagogique"
                    })
                }

                tmp_menu.push({
                    label: "Stage Entreprise",
                    link: "/apps/isp_stage/entreprise"
                })

                if (student.promotion.libelle === "L3 (LMD)") {
                    tmp_menu.push(
                        { label: "Projet Tutoré", link: "/apps/isp_stage/projet-tutore" }
                    )
                }
                if (student.promotion.libelle === "L2 (AS)") {
                    tmp_menu.push(
                        { label: "Memoire", link: "/apps/isp_stage/student-memoire" }
                    )
                }
                return tmp_menu;
            } catch (e) {
                console.log(e)
                return []
            }
        }
        const menus = [
            {
                label: "Stages",
                permissions: ["isp_departement_officier", "isp_user_stage_master"],
                is_superuser: true,
                subItems: [
                    {
                        label: "Imprégnation",
                        link: "/apps/isp_stage/impregnation/list"
                    },
                    {
                        label: "Pédagogique",
                        link: "/apps/isp_stage/pedagogique/list"
                    },
                    {
                        label: "Entreprise",
                        link: "/apps/isp_stage/entreprise/list"
                    }
                ]
            },
            {
                label: "Memoire&Projets",
                permissions: ["isp_departement_officier", "academy_is_teacher", "isp_directeur_travaux"],
                is_superuser: true,
                subItems: [
                    {
                        label: "Projets Tutorés",
                        link: "/apps/isp_stage/projets-tutores"
                    },
                    {
                        label: "Memoires AS (L2)",
                        link: "/apps/isp_stage/students-memoires",
                    }
                ]
            },
            {
                label: "Utilisateurs",
                permissions: ["isp_user_management"],
                is_superuser: true,
                subItems: [
                    {
                        label: "Dept. Rechercher Off.",
                        link: "/apps/isp_stage/dept_search_off",
                        permissions: ["isp_user_management"],
                    },
                    {
                        label: "Maitre de Stage",
                        link: "/apps/isp_stage/stage-masters",
                        permissions: ["isp_user_management"],
                    }
                ]
            },
            {
                label: "Étudiants",
                permissions: ["isp_departement_officier"],
                link: "/apps/isp_stage/students"
            },
            {
                label: "Directeurs",
                // link: "/apps/isp_stage/directeur-travaux/projet-tutore/",
                permissions: ["isp_departement_officier"],
                subItems: [
                    {
                        label: "Projets Tutorés",
                        link: "/apps/isp_stage/directeur-travaux/projet-tutore/",
                    },
                    {
                        label: "Memoires",
                        link: "/apps/isp_stage/directeur-travaux/memoire/",
                    }
                ]
            },
            {
                label:"Rapports",
                link:"/apps/isp_stage/reports",
                is_superuser: true,
                permissions: ['isp_departement_officier']
            }
        ]

        return menus
    },
    page: (props: PageProps) => {
        if(props.params.app.length === 3 && props.params.app[2] === "reports") return {
            dashboardLayouting: true,
            render: ()=>{
                return <Reports {...props}/>
            }
        }
        if(props.params.app.length === 5 && props.params.app[2] === "reports" && props.params.app[3] === "director") return {
            dashboardLayouting: true,
            render: ()=>{
                return <DirectorReportView {...props}/>
            }
        }
        if(props.params.app.length === 6 && props.params.app[2] === "reports" && props.params.app[3] === "director" && props.params.app[5] === "print") return {
            dashboardLayouting: false,
            render: ()=>{
                return <DirectorReportView for='print' {...props}/>
            }
        }
        if (props.params.app.length >= 3 && (props.params.app[3] === "list" || props.params.app[3] === "cotations") && props.params.app[2] === "entreprise")
            return {
                dashboardLayouting: true,
                render: () => {
                    return pages.StageEntreprise(props);
                }
            }
        else if (props.params.app.length >= 3 && props.params.app[2] === "pedagogique" && props.user.permissions.find(perm => perm === "isp_user_student"))
            return {
                dashboardLayouting: true,
                render: async () => {
                    try {
                        const stage = (await api(await cookies()).get(`/isp_stage/stage/get-by-user/`)).data;
                        return await StageDetailsPage({
                            ...props,
                            params: {
                                ...props.params,
                                app: [
                                    ...props.params.app,
                                    stage.id
                                ]
                            }
                        })
                    } catch (e) {
                        return redirect('/dashboard');
                    }
                }
            }
        else if (props.params.app.length >= 3 && (props.params.app[3] === "list" || props.params.app[3] === "cotations") && (props.params.app[2] === "pedagogique" || props.params.app[2] === "impregnation"))
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StageListPage(props);
                }
            }
        else if (props.params.app.length >= 3 && (props.params.app[3] !== "list" && props.params.app[3] !== "cotations") && (props.params.app[2] === "pedagogique" || props.params.app[2] === "impregnation"))
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StageDetailsPage(props);
                }
            }
        else if (props.params.app.length === 3 && props.params.app[2] === "dept_search_off")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.DepartmentOfficierPageSSR(props);
                }
            }
        else if (props.params.app.length === 4 && props.params.app[2] === "dept_search_off")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.DepartmentOfficierFormSSR(props);
                }
            }
        else if (props.params.app.length === 3 && props.params.app[2] === "stage-masters")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StageMasterPageSSR(props);
                }
            }
        else if (props.params.app.length === 4 && props.params.app[2] === "stage-masters")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StageMasterFormSSR(props);
                }
            }
        else if (props.params.app.length === 3 && props.params.app[2] === "projets-tutores")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.ProjetTutoresPage(props);
                }
            }
        else if (props.params.app.length === 4 && props.params.app[2] === "projets-tutores")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.ProjetTutoresFormPage(props);
                }
            }
        else if (props.params.app.length === 3 && props.params.app[2] === "projet-tutore")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StudentProjetTurote(props);
                }
            }
        else if (props.params.app.length === 3 && props.params.app[2] === "students-memoires")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StudentMemoireListPage(props);
                }
            }
        else if (props.params.app.length === 4 && props.params.app[2] === "students-memoires")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StudentMemoireDetailPage(props);
                }
            }
        else if (props.params.app.length === 3 && props.params.app[2] === "student-memoire")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StudentMemoirePage(props);
                }
            }
        else if (props.params.app.length === 3 && props.params.app[2] === "students")
            return {
                dashboardLayouting: true,
                render: () => {
                    return pages.StudentPage(props)
                }
            }
        else if (props.params.app.length === 4 && props.params.app[2] === "students" && props.params.app[3] !== "create")
            return {
                dashboardLayouting: true,
                render: () => {
                    return pages.StudentFormPage({...props, for:"detail"})
                }
            }
        else if (props.params.app.length === 4 && props.params.app[2] === "students" && props.params.app[3] === "create")
            return {
                dashboardLayouting: true,
                render: () => {
                    return pages.StudentFormPage({...props, for:"create"})
                }
            }

        else if (props.params.app.length === 4 && props.params.app[2] === "directeur-travaux")
            return {
                dashboardLayouting: true,
                render: () => {
                    return pages.DirecteurTravauxPageSSR({...props})
                }
            }
        else if (props.params.app.length === 5 && props.params.app[2] === "directeur-travaux")
            return {
                dashboardLayouting: true,
                render: () => {
                    return pages.DirecteurTravauxFormSSR({...props})
                }
            }
        else
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.NoActiveFeatures(props)
                }
            }
        

    },

}


export default config;