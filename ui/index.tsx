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
import AcademicYearPage from './src/pages/academicyear/AcademicYearPage';
import PaymentsPage from './src/pages/paiements/PaymentsPage'
import DeptMappingPage from './src/pages/ispdeptmapping/DeptMappingPage';


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
                        is_superuser: true
                    },
                    {
                        label: "Maitre de Stage",
                        link: "/apps/isp_stage/stage-masters",
                        permissions: ["isp_user_management"],
                        is_superuser: true
                    }
                ]
            },
            {
                label: "Étudiants",
                permissions: ["isp_departement_officier"],
                link: "/apps/isp_stage/students"
            },
            {
                label: "Paiements Stages",
                permissions: ["isp_departement_officier"],
                link: "/apps/isp_stage/stage-payments"
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
                label: "Rapports",
                link: "/apps/isp_stage/reports",
                is_superuser: true,
                permissions: ['isp_departement_officier']
            },
            {
                label: "Isp Paiements",
                // link: "/apps/isp_stage/directeur-travaux/projet-tutore/",
                is_superuser: true,
                permissions: [],
                subItems: [
                    {
                        label: "Paiements",
                        link: "/apps/isp_stage/payments",
                    },
                    {
                        label: "Dpt. Mapping",
                        link: "/apps/isp_stage/dept-mapping",
                    }
                ]
            }
        ]

        menus.push(
            {
                label: "Année Academique",
                link: "/apps/isp_stage/academic-years",
                permissions: [
                    'isp_departement_officier'
                ]
            }
        )

        return menus
    },
    page: async (props: PageProps) => {
        const _props = props;
        if (_props.params.app.length === 3 && _props.params.app[2] === "academic-years") return {
            dashboardLayouting: true,
            render: () => {
                return <AcademicYearPage {..._props} />
            }
        }
        if (_props.params.app.length === 3 && (_props.params.app[2] === "payments" || _props.params.app[2] === "stage-payments")) return {
            dashboardLayouting: true,
            render: () => {
                return <PaymentsPage {..._props} />
            }
        }
        if (_props.params.app.length === 3 && _props.params.app[2] === "dept-mapping") return {
            dashboardLayouting: true,
            render: () => {
                return <DeptMappingPage {..._props} />
            }
        }
        if (_props.params.app.length === 3 && _props.params.app[2] === "reports") return {
            dashboardLayouting: true,
            render: () => {
                return <Reports {..._props} />
            }
        }
        if (_props.params.app.length === 5 && _props.params.app[2] === "reports" && _props.params.app[3] === "director") return {
            dashboardLayouting: true,
            render: () => {
                return <DirectorReportView {..._props} />
            }
        }
        if (_props.params.app.length === 6 && _props.params.app[2] === "reports" && _props.params.app[3] === "director" && _props.params.app[5] === "print") return {
            dashboardLayouting: false,
            render: () => {
                return <DirectorReportView for='print' {..._props} />
            }
        }
        /**
         * Quand c'est un etudiant qui veut consulter le stage pedagogique
         */
        else if (_props.params.app.length >= 3 && (_props.params.app[2] === "pedagogique" || _props.params.app[2] === "entreprise") && _props.user.permissions.find(perm => perm === "isp_user_student"))
            return {
                dashboardLayouting: true,
                render: async () => {
                    try {
                        const stage = (await api(await cookies()).get(`/isp_stage/stage/get-by-user/?stage=${_props.params.app[2]}`)).data;
                        console.log(`Stage i have found : ${JSON.stringify(stage)}`);
                        return await StageDetailsPage({
                            ..._props,
                            params: {
                                ..._props.params,
                                app: [
                                    ..._props.params.app,
                                    stage.id
                                ]
                            }
                        })
                    } catch (e) {
                        console.log(e)
                        return redirect('/dashboard');
                    }
                }
            }
        else if (_props.params.app.length === 4 && (_props.params.app[3] === "list" || _props.params.app[3] === "cotations" || _props.params.app[3] === "fiche-centralisatrice") && (_props.params.app[2] === "pedagogique" || _props.params.app[2] === "impregnation" || _props.params.app[2] === "entreprise"))
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StageListPage(_props);
                }
            }
        else if (_props.params.app.length === 6 && _props.params.app[5] === "printing" && (_props.params.app[3] === "list" || _props.params.app[3] === "cotations" || _props.params.app[3] === "fiche-centralisatrice") && (_props.params.app[2] === "pedagogique" || _props.params.app[2] === "impregnation" || _props.params.app[2] === "entreprise"))
            return {
                dashboardLayouting: false,
                render: async () => {
                    return await pages.StageListPrintingPage({ ..._props });
                }
            }
        /**
         * Quand c'est un stagiaire qui veut consulter le stage pedagogique
         */
        else if (_props.params.app.length >= 3 && (_props.params.app[3] !== "list" && _props.params.app[3] !== "cotations") && (_props.params.app[2] === "pedagogique" || _props.params.app[2] === "impregnation" || _props.params.app[2] === "entreprise"))
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StageDetailsPage(_props);
                }
            }
        else if (_props.params.app.length === 3 && _props.params.app[2] === "dept_search_off")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.DepartmentOfficierPageSSR(_props);
                }
            }
        else if (_props.params.app.length === 4 && _props.params.app[2] === "dept_search_off")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.DepartmentOfficierFormSSR(_props);
                }
            }
        else if (_props.params.app.length === 3 && _props.params.app[2] === "stage-masters")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StageMasterPageSSR(_props);
                }
            }
        else if (_props.params.app.length === 4 && _props.params.app[2] === "stage-masters")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StageMasterFormSSR(_props);
                }
            }
        else if (_props.params.app.length === 3 && _props.params.app[2] === "projets-tutores")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.ProjetTutoresPage(_props);
                }
            }
        else if (_props.params.app.length === 4 && _props.params.app[2] === "projets-tutores")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.ProjetTutoresFormPage(_props);
                }
            }
        else if (_props.params.app.length === 3 && _props.params.app[2] === "projet-tutore")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StudentProjetTurote(_props);
                }
            }
        else if (_props.params.app.length === 5 && _props.params.app[3] === "printing" && _props.params.app[4] === "rest" && _props.params.app[2] === "projets-tutores")
            return {
                dashboardLayouting: false,
                render: async () => {
                    return await pages.StudentPrintProjetTutoreRestStudent(_props);
                }
            }
        else if (_props.params.app.length === 3 && _props.params.app[2] === "students-memoires")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StudentMemoireListPage(_props);
                }
            }
        else if (_props.params.app.length === 5 && _props.params.app[3] === "printing" && _props.params.app[4] === "rest" && _props.params.app[2] === "students-memoires")
            return {
                dashboardLayouting: false,
                render: async () => {
                    return await pages.StudentPrintMemoireRestStudent(_props);
                }
            }
        else if (_props.params.app.length === 4 && _props.params.app[2] === "students-memoires")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StudentMemoireDetailPage(_props);
                }
            }
        else if (_props.params.app.length === 3 && _props.params.app[2] === "student-memoire")
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.StudentMemoirePage(_props);
                }
            }
        else if (_props.params.app.length === 3 && _props.params.app[2] === "students")
            return {
                dashboardLayouting: true,
                render: () => {
                    return pages.StudentPage(_props)
                }
            }
        else if (_props.params.app.length === 4 && _props.params.app[2] === "students" && _props.params.app[3] !== "create")
            return {
                dashboardLayouting: true,
                render: () => {
                    return pages.StudentFormPage({ ..._props, for: "detail" })
                }
            }
        else if (_props.params.app.length === 4 && _props.params.app[2] === "students" && _props.params.app[3] === "create")
            return {
                dashboardLayouting: true,
                render: () => {
                    return pages.StudentFormPage({ ..._props, for: "create" })
                }
            }

        else if (_props.params.app.length === 4 && _props.params.app[2] === "directeur-travaux")
            return {
                dashboardLayouting: true,
                render: () => {
                    return pages.DirecteurTravauxPageSSR({ ..._props })
                }
            }
        else if (_props.params.app.length === 5 && _props.params.app[2] === "directeur-travaux")
            return {
                dashboardLayouting: true,
                render: () => {
                    return pages.DirecteurTravauxFormSSR({ ..._props })
                }
            }
        else
            return {
                dashboardLayouting: true,
                render: async () => {
                    return await pages.NoActiveFeatures(_props)
                }
            }


    },

}


export default config;