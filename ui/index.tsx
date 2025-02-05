import { AppConfig, PageProps } from '@/lib/shared/types/config';
import pages from './src/pages';
import StageDetailsPage from './src/pages/StageDetailsPage';
import api from '@/lib/network/api';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import IspStageDashboardWidget from './src/pages/IspStageDashboardWidget';
const config: AppConfig = {
    label: "Etudiants",
    showInMainMenu: true,
    icon: "https://www.flaticon.com/svg/static/icons/svg/2933/2933715.svg",
    dashboardLayouting: true,
    dashboardWidget: (props: PageProps) => { return <IspStageDashboardWidget /> },
    menu: (props: PageProps) => {
        if (props.user.permissions.find(perm => perm === "isp_user_student")) {
            return [
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
                permissions: ["isp_departement_officier"],
                is_superuser: true,
                subItems: [
                    {
                        label: "Projets Tutorés",
                        link: "/apps/isp_stage/projets-tutores"
                    },
                    {
                        label: "Memoires AS (L2)",
                        link: "/apps/isp_stage/memoire-as",
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
            }
        ]

        return menus
    },
    page: (props: PageProps) => {
        if (props.params.app.length >=3 && (props.params.app[3] === "list" || props.params.app[3] === "cotations") && props.params.app[2] === "entreprise")
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
        else if (props.params.app.length >= 3 && (props.params.app[3] === "list" ||  props.params.app[3] === "cotations") && (props.params.app[2] === "pedagogique" || props.params.app[2] === "impregnation"))
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StageListPage(props);
                }
            }
        else if (props.params.app.length >= 3 && (props.params.app[3] !== "list" &&  props.params.app[3] !== "cotations") && (props.params.app[2] === "pedagogique" || props.params.app[2] === "impregnation"))
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
                    return await pages.DeptRechercheUsers(props);
                }
            }
        else if (props.params.app.length === 3 && props.params.app[2] === "stage-masters")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StageMasterUsers(props);
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