import { AppConfig, Menu, PageProps } from '@/lib/shared/types/config';
import pages from './src/pages';
import StageDetailsPage from './src/pages/StageDetailsPage';
import api from '@/lib/network/api';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import IspStageDashboardWidget from './src/pages/IspStageDashboardWidget';
import { Student } from '/addons/uscitech_academy/ui/src/types';
const config: AppConfig = {
    label: "Etudiants",
    showInMainMenu: true,
    icon: "https://www.flaticon.com/svg/static/icons/svg/2933/2933715.svg",
    dashboardLayouting: true,
    dashboardWidget: (props: PageProps) => { return <IspStageDashboardWidget {...props} /> },
    menu: async (props: PageProps) => {
        if (props.user.permissions.find(perm => perm === "isp_user_student")) {
            try {
                const student: Student = (await api(await cookies()).get(`/uscitech_academy/students/me/`)).data
                const tmp_menu: Menu[] = [
                    {
                        label: "Stages",
                        subItems: [
                            {
                                label: "Pédagogique",
                                link: "/apps/isp_stage/pedagogique"
                            },
                            {
                                label: "Entreprise",
                                link: "/apps/isp_stage/entreprise"
                            }
                        ],
                        is_superuser: true
                    }
                ]

                if (student.promotion.libelle === "L3") {
                    tmp_menu.push(
                        { label: "Projet Tutoré", link: "/apps/isp_stage/projet-tutore" }
                    )
                }
                if (student.promotion.libelle === "L2") {
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
                permissions: ["isp_departement_officier", "academy_is_teacher"],
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
            }
        ]

        return menus
    },
    page: (props: PageProps) => {
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