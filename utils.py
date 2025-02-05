from reporter.models import ReportTask
from core.models import User
from .models import Stage, DeptRechercheOfficier, StageMaster


def user_get_stages(user: User, stage: str,  db_name: str = None):
    stages = []

    # L'utilisateur n'est ni maitre de stage, si chef de la recherche du département
    if not user.has_perm('isp_stage.isp_departement_officier') and not user.has_perm('isp_stage.isp_user_stage_master') and user.is_superuser ==  False:
        # print("Nous sommes dans le print -1") 
        return []

    # L'utilisateur est chef de departement à la recherche mais pas maitre de stage, mais n'a pas de département d'attache
    dept_off =  DeptRechercheOfficier.objects.using(db_name).filter(user__id=user.id) if db_name == None else DeptRechercheOfficier.objects.using(db_name).filter(user__id=user.id)
    if (user.has_perm('isp_stage.isp_departement_officier') and not user.has_perm('isp_stage.isp_user_stage_master')) and not dept_off.exists():
        # print("Nous sommes dans le print -2")
        pass
    elif (user.has_perm('isp_stage.isp_departement_officier') and not user.has_perm('isp_stage.isp_user_stage_master')) and dept_off.exists(): 
        # print("Nous sommes dans le print -3")
        stages = Stage.objects.using(db_name).filter(student__promotion__grade__id=dept_off[0].dept.id, stage=stage) if db_name == None else  Stage.objects.using(db_name).filter(student__promotion__grade__id=dept_off[0].dept.id, stage=stage)
    elif (not user.has_perm('isp_stage.isp_departement_officier') and user.has_perm('isp_stage.isp_user_stage_master')) :
        stages = Stage.objects.using(db_name).filter(stagemaster__user__id__in = [user.id], stage=stage) if db_name == None else Stage.objects.using(db_name).filter(stagemaster__user__id__in = [user.id], stage=stage)
        # print("Nous sommes dans le print -3")
    elif user.is_superuser ==  True:
        stages = Stage.objects.using(db_name).filter(stage=stage) if db_name == None else Stage.objects.using(db_name).filter(stage=stage)
    
    stages = stages.exclude(student = None).exclude(student__user = None)
    return stages


def function_bidon(task: ReportTask, db_name: str):
    print("Je vais print les argumens bidon :", task.id)
    return f'Je te retourne ton argument de merge !! >> {task.id}'


def student_stage(task: ReportTask, db_name: str):
    print("Task Data : ", task.data['username'])
    print("Db-name : ", db_name)
    stage =  task.data['stage']

    # Premier etape : Reccupérer les informations sur l'utilisateur qui a demandé cette tache
    user = User.objects.using(db_name).get(username = task.data['username']) 
    stages = user_get_stages(user, stage, db_name)
    datas =  []
    for st in stages:
        if st.student is not None and st.student.user is not None :
            student = {
                "name": st.student.user.name,
                "last_name": st.student.user.last_name,
                "first_name": st.student.user.first_name,
                "stage_master": "--",
                "promotion": st.student.promotion.grade.libelle,
                "quote": f'{st.quote}/20' if st.quote is not None else "-" 
            }
            # if st.stagemaster is not None :
            #     student['stage_master'] = f'{st.stagemaster.user.name} {st.stagemaster.user.last_name} {st.stagemaster.user.first_name} (Tel : {st.stagemaster.user.phone})'
            datas.append(student)
    return datas

def stagemaster_student_datas(task: ReportTask, db_name: str):
    stage =  task.data['stage']
    
    # Premier etape : Reccupérer les informations sur l'utilisateur qui a demandé cette tache
    user = User.objects.using(db_name).get(username = task.data['username']) 
    stages = user_get_stages(user, stage, db_name)
    count_m = 0
    count_f = 0
    for st in stages :
        if st.student is not None and st.student.user is not None and st.student.user.sexe == 'm' :
            count_m += 1
        else:
            count_f += 1

    promotion = None
    # Préparation et recuppération de la promotion au cas ou l'utisateur est maitre ou chef de departement
    stagemaster = StageMaster.objects.using(db_name).filter(user__id__in =[user.id])
    dept_research_off = DeptRechercheOfficier.objects.using(db_name).filter(user__id=user.id)
    print(f"Stage Master Len : {len(stagemaster)}")
    print(f"Dept Researcher Off Len : {len(dept_research_off)}")
    if stagemaster.exists() :
        stagemaster = stagemaster[0]
        # promotion = {
        #     "section": f'{stagemaster.dept.grade.libelle}',
        #     "faculte": f'{stagemaster.dept.libelle}'
        # }
    elif dept_research_off.exists():
        dept_research_off = dept_research_off[0]
        # promotion = {
        #     "section": f'{dept_research_off.dept.grade.libelle}',
        #     "faculte": f'{dept_research_off.dept.libelle}'
        # }
    else :
        print(f"Not Stage Master Not Dept Researcher Officer for : {user.id}")
    

    data_to_return = {
        "count": len(stages), 
        "count_m": count_m,
        "count_f": count_f, 
        "stage_master": f'{user.last_name} {user.first_name}'
    }

    if promotion is not None :
        print(promotion)
        data_to_return["section"] = promotion["section"]
        data_to_return["faculte"] = promotion["faculte"]
    else: 
        print("Promotion is None")

    print(data_to_return)

    return data_to_return