from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404  

from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import  Permission

from django.db.models import Q

from rest_framework.exceptions import MethodNotAllowed
from django.core.exceptions import ObjectDoesNotExist

from core.utils import Paginator
import pandas as pd
 
from core.models import *
from .models import *
from uscitech_academy.models import *

from .serializers import *
from uscitech_academy.serializers import *

from uscitech_academy.serializers import GradeClasseSerializer

from rest_framework import status


class PromotionL2(APIView):
    def get(self, request):
        queryset = Promotion.objects.filter(libelle="L2")
        datas = PromotionSerializer(queryset, many=True)
        return Response(datas.data)

class PromotionL3(APIView):
    def get(self, request):
        queryset = Promotion.objects.filter(libelle="L3")
        datas = PromotionSerializer(queryset, many=True)
        return Response(datas.data)

class StageViewSet(viewsets.ModelViewSet):
    pagination = Paginator()
    queryset = Stage.objects.all()
    serializer_class = StageSerializer


    @action(detail=True, methods=['post'], url_path="set-master")
    def set_master(self, request, pk):
        master_id = request.data.get("master-id")
        master = get_object_or_404(StageMaster, id=master_id)
        stage = get_object_or_404(Stage, id=pk)
        stage.stagemaster.add(master)
        stage.save()    

        return Response(StageSerializer(stage).data)

    @action(detail=True, methods=['post'], url_path="remove-master")
    def remove_master(self, request, pk):
        master_id = request.data.get("master-id")
        master = get_object_or_404(StageMaster, id=master_id)
        stage = get_object_or_404(Stage, id=pk)
        stage.stagemaster.remove(master)
        stage.save()

        return Response(StageSerializer(stage).data)


    @action(detail=True, methods=['post'], url_path="update")
    def update_stage(self, request, pk):
        stage = get_object_or_404(Stage, id=pk) 

        if request.data.get("start_date", None) is not None :
            stage.start_date = request.data.get("start_date")

        if request.data.get("end_date", None) is not None :
            stage.end_date = request.data.get("end_date")

        if request.data.get("horraires", None) is not None :
            stage.horraires = request.data.get("horraires")

        if request.data.get("horraire_status", None) is not None :
            stage.horraire_status = request.data.get("horraire_status")
        
        if request.data.get("institution", None) is not None :
            stage.institution = request.data.get("institution")

        if request.data.get("institution_address", None) is not None :
            stage.institution_address = request.data.get("institution_address")

        if request.data.get("institution_provisor", None) is not None :
            stage.institution_provisor = request.data.get("institution_provisor")

        if request.data.get("institution_provisor_provisor", None) is not None :
            stage.institution_provisor_provisor = request.data.get("institution_provisor_provisor")
        
        if request.data.get("quote") is not None :
            if stage.quote_by == None :
                stage_master = StageMaster.objects.get(user__id=request.user.id)
                stage.quote_by = stage_master
            stage.quote = request.data.get("quote")

        stage.save()
        return Response(StageSerializer(stage).data)

    @action(detail=False, methods=['get'], url_path="get-by-user")
    def get_by_user(self, request):
        user = request.user
        queryset = Stage.objects.filter(student__user__id=user.id).first()
        if queryset:
            return Response(StageSerializer(queryset).data)
        return Response(None, 404)




class StageMasterViewSet(viewsets.ModelViewSet):
    queryset = StageMaster.objects.all()
    serializer_class = StageMasterSerializer
    pagination_class = Paginator
    filter_backends = (filters.SearchFilter, DjangoFilterBackend)  # Ajout du filtre de recherche
    search_fields = ['employee__user__username', 'employee__user__name', 'employee__user__last_name', 'employee__user__first_name', 'employee__user__email']  # Champs recherchables

    def destroy(self, request, *args, **kwargs):
        """Retirer la permission 'isp_user_stage_master' lors de la suppression d'un StageMaster"""
        instance = self.get_object()  # Récupère l'instance à supprimer
        user = instance.employee.user  # Assumant que Employee a une relation OneToOne avec User

        # Vérifier si la permission existe et retirer la permission de l'utilisateur
        try:
            permission = Permission.objects.get(codename="isp_user_stage_master")
            user.user_permissions.remove(permission)
        except Permission.DoesNotExist:
            pass  # Si la permission n'existe pas, on ne fait rien

        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, url_path='student-depts')
    def get_my_students_dept(self, request):

        user: User = request.user
        stage = request.GET.get("stage")
        stages = Stage.objects.filter(stagemaster__employee__user__id__in =  [user.id], stage=stage)

        grades = GradeClasse.objects.filter(id__in = [
            _stage.student.promotion.grade.id for _stage in stages
        ])

        return Response(GradeClasseSerializer(grades, many=True).data, status=200)

    @action(detail=False, url_path='submit-quotes')
    def submit_quotes(self, request):

        user: User = request.user
        stage = request.GET.get("stage")
        stages = Stage.objects.filter(stagemaster__employee__user__id__in =  [user.id], stage=stage)

        stagemaster = StageMaster.objects.first(emploeyee__user__id = user.id)
        stagemaster.is_quote_submitted = True
        stagemaster.save()

        for st in stages :
            if st.quote is not None :
                st.quote_status = "submitted"
                st.save()

        return Response(StageSerializer(stages, many=True).data, status=200)


    @action(detail=False, url_path='get-by-user')
    def get_by_user(self, request):
        """
            Fonction qui permet de recupérer un maitre de stage à partir de l'utilisateur courament connecté
        """

        user: User = request.user

        stagemaster = StageMaster.objects.filter(employee__user__id = user.id)
        if stagemaster.exists() :
            return Response(StageMasterSerializer(stagemaster[0]).data)

        return Response("No stage master found !!", status=404)




class StudentForStageAPIView(APIView):

    def post(self, request):

        stage = Stage.objects.filter(facture=request.data.get("facture"))
        if stage.exists():
            return Response({"message": "Le numéro de facture existe déjà."}, status=400)
        
        student = Student.objects.filter(id=request.data.get("student_id")).first()
        
        stg = Stage()
        stg.stage = request.data.get("stage")
        stg.student = student
        stg.facture = request.data.get("facture")
        stg.save()

        return Response({
            "student":StudentSerializer(student).data,
            "stage": StageSerializer(stg).data
        }, status=201)

    def get(self, request, stage):

        paginator = Paginator()
        stages = []

        user: User = request.user
        # L'utilisateur n'est ni maitre de stage, si chef de la recherche du département
        if not user.has_perm('isp_stage.isp_departement_officier') and not user.has_perm('isp_stage.isp_user_stage_master') and user.is_superuser ==  False:
            return Response({"message": "Vous n'avez pas les droits pour accéder à cette page."}, status=403)

        # L'utilisateur est chef de departement à la recherche mais pas maitre de stage, mais n'a pas de département d'attache
        dept_off = DeptRechercheOfficier.objects.filter(employee__user__id=user.id)
        if (user.has_perm('isp_stage.isp_departement_officier') and not user.has_perm('isp_stage.isp_user_stage_master')) and not dept_off.exists():
            stages = None
        elif (user.has_perm('isp_stage.isp_departement_officier') and not user.has_perm('isp_stage.isp_user_stage_master')) and dept_off.exists(): 
            stages = Stage.objects.filter(student__promotion__grade__id=dept_off[0].dept.id, stage=stage)
        elif (not user.has_perm('isp_stage.isp_departement_officier') and user.has_perm('isp_stage.isp_user_stage_master')) :
            stages = Stage.objects.filter(stagemaster__employee__user__id__in =  [user.id], stage=stage)
        elif user.is_superuser ==  True:
            stages = Stage.objects.filter(stage=stage)
        else :
            stages = None

        if stages == None :
            return Response({"message": "Vous n'avez pas les droits pour accéder à cette page."}, status=403)
        # stages = Stage.objects.filter(stage=stage)
        
        if request.GET.get('search', None) is not None:
            query = Q()
            query |= Q(student__user__name__icontains=request.GET.get('search'))
            query |= Q(student__user__first_name__icontains=request.GET.get('search'))
            query |= Q(student__user__last_name__icontains=request.GET.get('search'))
            query |= Q(student__user__email__icontains=request.GET.get('search'))
            query |= Q(student__user__phone__icontains=request.GET.get('search'))
            stages = stages.filter(query)
            pass

        stages = stages.exclude(student = None).exclude(student__user = None)

        filter_stage_assignation = request.GET.get('filter_assignation', "all")
        if filter_stage_assignation == "assigned" :
            stages = stages.exclude(stagemaster = None)
        elif filter_stage_assignation == "notassigned" :
            stages = stages.filter(stagemaster = None)
        
        filter_stage_cotation = request.GET.get('filter_cotation', "all")
        

        if user.has_perm('isp_stage.isp_departement_officier') and not user.has_perm('isp_stage.isp_user_stage_master') : 
            if filter_stage_cotation == "assigned" :
                stages = stages.exclude(quote = None, quote_status="draft")
            elif filter_stage_cotation == "notassigned" :
                stages = stages.filter(quote = None, quote_status="draft")
            else: 
                pass

        elif  not user.has_perm('isp_stage.isp_departement_officier') and user.has_perm('isp_stage.isp_user_stage_master') : 
            if filter_stage_cotation == "assigned" :
                stages = stages.exclude(quote = None)
            elif filter_stage_cotation == "notassigned" :
                stages = stages.filter(quote = None)
            else:
                pass

        filter_dept = request.GET.get('filter_dept', "all")
        if filter_dept != "all" :
            stages = stages.filter(student__promotion__grade__id=filter_dept)
        
        
        paginated_stages = paginator.paginate_queryset(stages, request)
        stage_serializer= StageSerializer(paginated_stages, many=True)
        # return Response(stage_serializer.data)
        # return Response({})
        return paginator.get_paginated_response(stage_serializer.data)

class IspGombePromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer
    pagination_class = Paginator
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["libelle", "grade__libelle"]

    def get_queryset(self):
        user = self.request.user
        if user.has_perm("isp_stage.isp_departement_officier") : 
            department_officier = DeptRechercheOfficier.objects.filter(employee__user__id = user.id)
            if not  department_officier.exists() :
                return Promotion.objects.none() 
            department_officier: DeptRechercheOfficier = department_officier[0]
            return Promotion.objects.filter(grade__id = department_officier.dept.id)
        return Promotion.objects.all()

class DeptRechercheOfficierStudentListsViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    pagination_class = Paginator
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["user__username", "user__first_name", "user__last_name"]

    def get_queryset(self):
        """
        Permet de filtrer les départements :
        - Si `parent_department_id` est fourni, retourne les sous-départements du département donné.
        - Sinon, retourne tous les départements.
        """
        user = self.request.user
        if user.has_perm("isp_stage.isp_departement_officier") : 
            department_officier = DeptRechercheOfficier.objects.filter(employee__user__id = user.id)
            if not  department_officier.exists() :
                return Student.objects.none()
            
            department_officier: DeptRechercheOfficier = department_officier[0]
            queryset = Student.objects.filter(promotion__grade__id = department_officier.dept.id)
        
            return queryset
        
        elif user.has_perm('isp_stage.isp_user_student') or user.has_perm("uscitech_academy.academy_is_student"):
            student = Student.objects.filter(user=user)
            if not student.exists() :
                return Student.objects.none()
            else :
                student = student.first()
                return Student.objects.filter(promotion__id = student.promotion.id)

        else :
            return Student.objects.all()
    
    
    @action(detail=False, methods=['post'], url_path='bulk-upload')
    def bulk_upload(self, request):
        user = request.user
        # promotion = Promotion.objects.filter(grade__id = )
        promotion_id = request.data.get('promotion_id', None)
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Aucun fichier fourni.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            df = pd.read_excel(file)
            created_students = []
            
            for _, row in df.iterrows():
                # full_name = f"{row['first_name']} {row['name']} {row['last_name']}".strip()
                user, created_user = User.objects.get_or_create(
                    username=row['email'],
                    defaults={
                        'name': row['name'],
                        'first_name': row['first_name'],
                        'last_name': row['last_name'],
                        'phone': row.get('phone', ''),
                        'sexe': 'm',  # Valeur par défaut, peut être ajustée si disponible,
                        "password" : make_password(os.environ.get("DEFAULT_PASS", "1234")),
                        "is_active" : True,
                        "email" : row['email']
                    }
                )

                if not created_user :
                    user.first_name = row['first_name']
                    user.last_name = row['last_name']
                    user.name = row['name']
                    user.email = row['email']
                    user.is_active=True

                    user.save()
                
                try:
                    permission = Permission.objects.get(codename="isp_user_student")
                    user.user_permissions.add(permission)
                except: 
                    pass
                try:
                    permission = Permission.objects.get(codename="academy_is_student")
                    user.user_permissions.add(permission)
                except:
                    pass
                
                promotion = None
                
                if promotion_id :
                    promotion = Promotion.objects.filter(id=promotion_id).first()
                    
                student, created = Student.objects.get_or_create(
                    user=user,
                    defaults={'promotion': promotion}
                )
                created_students.append(student.id)
            
            return Response({'message': 'Importation réussie.', 'students': created_students}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DeptRechercheOfficierViewSet(viewsets.ModelViewSet):
    queryset = DeptRechercheOfficier.objects.all()
    serializer_class = DeptRechercheOfficierSerializer
    pagination_class = Paginator
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["employee__user__username", "employee__user__first_name", "employee__user__last_name"]

    def destroy(self, request, *args, **kwargs):
        """Retirer la permission 'isp_departement_officier' lors de la suppression d'un DeptRechercheOfficier"""
        instance = self.get_object()  # Récupère l'instance à supprimer
        user = instance.employee.user  # Assumant que Employee a une relation OneToOne avec User

        # Vérifier si la permission existe et retirer la permission de l'utilisateur
        try:
            permission = Permission.objects.get(codename="isp_departement_officier")
            user.user_permissions.remove(permission)
        except Permission.DoesNotExist:
            pass  # Si la permission n'existe pas, on ne fait rien

        return super().destroy(request, *args, **kwargs)


    


    @action(detail=False, url_path='get_by_user_id/(?P<user_id>\d+)')
    def get_by_user_id(self, request, user_id):
        dept = DeptRechercheOfficier.objects.filter(employee__user__id=user_id)
        if dept.exists():
            return Response(DeptRechercheOfficierSerializer(dept[0]).data)
        return Response({}, status=404)

    @action(detail=False, url_path='get_by_user')
    def get_by_user(self, request):

        dept = DeptRechercheOfficier.objects.filter(employee__user__id=request.user.id)
        if dept.exists():
            return Response(DeptRechercheOfficierSerializer(dept[0]).data)
        return Response({}, status=404)

    @action(detail=False,methods=['get'])
    def me(self, request):

        dept = DeptRechercheOfficier.objects.filter(employee__user__id=request.user.id)
        if dept.exists():
            return Response(DeptRechercheOfficierSerializer(dept[0]).data)
        return Response({}, status=404)

    @action(detail=False, url_path='student-depts')
    def get_my_students_dept(self, request):

        user: User = request.user 
        dept = DeptRechercheOfficier.objects.filter(employee__user__id=user.id)
        if dept.exists():
            grades = GradeClasse.objects.filter(id = dept[0].dept.id)
            return Response(GradeClasseSerializer(grades, many=True).data, status=200)
        return Response({}, status=404)


class ProjetTutoreViewSet(viewsets.ModelViewSet):
    queryset = ProjetTutore.objects.all()
    serializer_class = ProjetTutoreSerializer
    pagination_class = Paginator
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["head__username", "head__first_name", "head__last_name", "head__first_name", "head__phone", "head__email"]

    def get_queryset(self):
        user = self.request.user

        # Superutilisateur voit tout
        if user.is_superuser:
            return ProjetTutore.objects.all()

        # Vérifier si l'utilisateur est un directeur 
        if user.has_perm('isp_stage.isp_directeur_travaux'):
            director = DirecteurTravaux.objects.filter(employee__user=user).first()
            if director:
                return ProjetTutore.objects.filter(director__id=director.id)

        # Vérifier si l'utilisateur est un directeur 
        if user.has_perm('isp_stage.isp_departement_officier'):
            departmentOfficier = DeptRechercheOfficier.objects.filter(employee__user=user).first() 
            if departmentOfficier :
                return ProjetTutore.objects.filter(head__promotion__grade__id=departmentOfficier.dept.id)

        # Par défaut, retour vide
        return ProjetTutore.objects.all()

    @action(detail=False, methods=['get'])
    def my_projects(self, request):
        """Récupère les projets tutorés où l'utilisateur est soit 'head' soit 'member'"""
        student = Student.objects.filter(user=request.user).first()
        if not student:
            return Response({"detail": "Aucun étudiant associé à cet utilisateur."}, status=404)

        projets = ProjetTutore.objects.filter(models.Q(head=student) | models.Q(member=student)).distinct()
        if len(projets) >= 1 :
            serializer = self.get_serializer(projets[0])
            return Response(serializer.data)
        return Response({"detail": "Aucun projet associé à cet utilisateur."}, status=404)


class StudentMemoireViewSet(viewsets.ModelViewSet):
    queryset = StudentMemoire.objects.all()
    serializer_class = StudentMemoireSerializer
    pagination_class = Paginator
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["student__username", "student__first_name", "student__last_name", "student__first_name", "student__phone", "student__email"]

    @action(detail=False, methods=['get'])
    def my_memoire(self, request):
        """Récupère les projets tutorés où l'utilisateur est soit 'head' soit 'member'"""
        student = Student.objects.filter(user=request.user).first()
        if not student:
            return Response({"detail": "Aucun étudiant associé à cet utilisateur."}, status=404)

        projets = StudentMemoire.objects.filter(models.Q(student=student)).distinct()
        if len(projets) >= 1 :
            serializer = self.get_serializer(projets[0])
            return Response(serializer.data)
        return Response({"detail": "Aucun memoire associé à cet utilisateur."}, status=404)

    def get_queryset(self):
        user = self.request.user

        # Superutilisateur voit tout
        if user.is_superuser:
            return StudentMemoire.objects.all()

        # Vérifier si l'utilisateur est un enseignant avec la permission spécifique
        if user.has_perm('uscitech_academy.academy_is_teacher'):
            teacher = Teacher.objects.filter(employee__user=user).first()
            if teacher:
                return StudentMemoire.objects.filter(teacher=teacher)

        # Vérifier si l'utilisateur est un enseignant avec la permission spécifique
        if user.has_perm('isp_stage.isp_user_student') or user.has_perm("uscitech_academy.academy_is_student"):
            student = Student.objects.filter(user=user).first()
            if student:
                return StudentMemoire.objects.filter(student=student)

        # Par défaut, retour vide
        return StudentMemoire.objects.all()


class DepartmentSettingsViewSet(viewsets.ModelViewSet):
    queryset = DepartmentSettings.objects.all()
    serializer_class = DepartmentSettingsSerializer
    pagination_class = Paginator

    @action(detail=False, methods=['get'])
    def me(self, request):
        user: User = request.user
        if user.has_perm('isp_stage.isp_departement_officier') : 
            department_officier = DeptRechercheOfficier.objects.filter(employee__user__id = user.id)
            if not department_officier.exists() :
                return Response("Aucune donnée trouvé  -> department_officier", 404 )
            else :
                department_officier: DeptRechercheOfficier  = department_officier[0]
                department_settings = DepartmentSettings.objects.filter(department = department_officier.dept )
                if department_settings.exists() :
                    department_settings = department_settings[0]
                else :
                    department_settings = DepartmentSettings.objects.create(
                        department = department_officier.dept
                    )
                serializer = self.get_serializer(department_settings)
                return Response(serializer.data)

        if user.has_perm('isp_stage.isp_user_student') or user.has_perm('uscitech_academy.academy_is_student') :
            student = Student.objects.filter(user = user)
            if not student.exists() :
                return Response("Aucune donnée trouvé -> student", 404 )
            else : 
                student: Student  = student[0]
                department_settings = DepartmentSettings.objects.filter(department = student.promotion.grade )
                if department_settings.exists() :
                    department_settings = department_settings[0]
                else :
                    department_settings = DepartmentSettings.objects.create(
                        department = student.promotion.grade
                    )
                serializer = self.get_serializer(department_settings)
                return Response(serializer.data)
        
        return Response({
            "message": "Aucune donnée trouvé -> all",
            "user": UserSerializer(user).data
        }, 404 )

class StageSearchingTeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    pagination_class = Paginator
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["employee__fullname", "employee__user__name",  "employee__user__last_name",  "employee__user__first_name",  "employee__user__phone",  "employee__user__email"]

    
    def get_queryset(self):
        user = self.request.user

        # Vérification des permissions
        if user.has_perm('isp_stage.isp_user_student') or user.has_perm('uscitech_academy.academy_is_student'):
            try:
                # Récupérer l'étudiant
                student = Student.objects.get(user=user)
            except ObjectDoesNotExist as e:
                print(e)
                return Teacher.objects.none()

            # Récupérer les paramètres de département pour l'étudiant
            department_settings, created = DepartmentSettings.objects.get_or_create(
                department=student.promotion.grade
            )

            # Récupérer les projets tutorés pour le grade de l'étudiant
            projets = ProjetTutore.objects.filter(head__promotion__grade=student.promotion.grade)
            print(projets)

            # Créer un dictionnaire pour regrouper les enseignants et compter leur nombre d'affectations
            teacher_count = {}
            for projet in projets:
                if projet.teacher == None : 
                    continue
                teacher = projet.teacher
                if teacher.id in teacher_count:
                    teacher_count[teacher.id] += 1
                else:
                    teacher_count[teacher.id] = 1

            limit = 1
            if student.promotion.libelle == "L3" :
                limit = department_settings.max_teacher_tutore_project_group
            elif student.promotion.libelle == "L2" :
                limit = department_settings.max_teacher_memoire

            final_teachers = [
                teacher for teacher, count in teacher_count.items()
                if count >= limit
            ]

            # Retourner les enseignants filtrés
            return Teacher.objects.exclude(id__in=final_teachers)

        # Si l'utilisateur n'est pas un étudiant, renvoyer tous les enseignants
        return Teacher.objects.none()

    @action(detail=False, methods=['get'])
    def without_stage(self, request):
        students_without_stage = Student.objects.all()
        search_query = request.GET.get("search", None)
        stage_type = request.GET.get("stage_type", None)

        if search_query:
            students_without_stage = students_without_stage.filter(
                Q(user__username__icontains=search_query) |
                Q(user__first_name__icontains=search_query) |
                Q(user__last_name__icontains=search_query)
            )
        
        if stage_type:
            students_without_stage = students_without_stage.filter(
                ~Q(stage__stage=stage_type)
            )
        
        students_without_stage = students_without_stage.filter(~Q(stage__student__isnull=False))

        user = request.user
        if user.has_perm('isp_stage.isp_departement_officier') :
            dept_officier = DeptRechercheOfficier.objects.filter(employee__user__id=user.id)
            if not dept_officier.exists() :
                return Response({}, 404)
            dept_officier = dept_officier.first()
            students_without_stage = students_without_stage.filter(promotion__grade__id = dept_officier.dept.id)

        if stage_type == "pedagogique" : 
            students_without_stage = students_without_stage.filter(promotion__libelle = "L3")

        if stage_type == "impregnation" : 
            students_without_stage = students_without_stage.filter(promotion__libelle = "L2")
        
        page = self.paginate_queryset(students_without_stage)
        if page is not None:
            serializer = StudentSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = StudentSerializer(students_without_stage, many=True)
        return Response(serializer.data)
    
    # Interdire toutes les autres méthodes HTTP en surchargeant les méthodes
    def create(self, request, *args, **kwargs):
        raise MethodNotAllowed('POST')

    def update(self, request, *args, **kwargs):
        raise MethodNotAllowed('PUT')

    def partial_update(self, request, *args, **kwargs):
        raise MethodNotAllowed('PATCH')

    def destroy(self, request, *args, **kwargs):
        raise MethodNotAllowed('DELETE')




class DirecteurTravauxViewSet(viewsets.ModelViewSet):
    queryset = DirecteurTravaux.objects.all()
    serializer_class = DirecteurTravauxSerializer
    pagination_class = Paginator
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["employee__fullname", "employee__user__name",  "employee__user__last_name",  "employee__user__first_name",  "employee__user__phone",  "employee__user__email"]

    def perform_create(self, serializer):
        """Ajouter la permission isp_directeur_travaux à l'utilisateur lors de la création."""
        directeur_travaux = serializer.save()
        user = directeur_travaux.employee.user  # Récupérer l'utilisateur

        permission = Permission.objects.get(codename="isp_directeur_travaux")
        user.user_permissions.add(permission)  # Ajouter la permission
        user.save()

    def perform_destroy(self, instance):
        """Retirer la permission isp_directeur_travaux de l'utilisateur lors de la suppression."""
        user = instance.employee.user  # Récupérer l'utilisateur

        permission = Permission.objects.get(codename="isp_directeur_travaux")
        user.user_permissions.remove(permission)  # Retirer la permission
        user.save()

        instance.delete()

    def get_queryset(self):

        user = self.request.user
        queryset = DirecteurTravaux.objects.all()

        # Filtrage supplémentaire basé sur un paramètre GET
        direction_type = self.request.query_params.get('direction_type', None)
        if direction_type :
            queryset = queryset.filter(direction_type=direction_type)

        if user.has_perm('isp_stage.isp_departement_officier') :
            departmentOfficier = DeptRechercheOfficier.objects.filter(employee__user__id = user.id)
            if not departmentOfficier.exists() : 
                return DirecteurTravaux.objects.none()
            departmentOfficier = departmentOfficier.first()
            queryset = queryset.filter(department__id = departmentOfficier.dept.id)
        
        if user.has_perm('isp_stage.isp_user_student') or user.has_perm('uscitech_academy.academy_is_student'):
            student = Student.objects.filter(user__id = user.id)
            if not student.exists():
                return DirecteurTravaux.objects.none()
            student = student.first()
            queryset = queryset.filter(department__id = student.promotion.grade.id)

            # Récupérer les paramètres de département pour l'étudiant
            department_settings, created = DepartmentSettings.objects.get_or_create(
                department=student.promotion.grade
            )

            projets = ProjetTutore.objects.filter(director__id__in = [director.id for director in queryset ])
            director_count = {}
            for projet in projets:
                if projet.director == None :
                    continue
                director = projet.director
                if director.id in director_count:
                    director_count[director.id]['counts'] = director_count[director.id]['counts'] + 1
                else:
                    director_count[director.id] = {
                        "director": director,
                        "counts": 1
                    }

            final_directors = []
            for director in director_count :
                if director['director'].category == "externe" and director['counts'] >= department_settings.max_teacher_externe_tutore_project_group :
                    final_directors.append(director['director'])
                elif director['director'].category == "interne" and director['counts'] >= department_settings.max_teacher_tutore_project_group :
                    final_directors.append(director['director'])

            queryset = queryset.exclude(id__in = [final_director.id for final_director in final_directors])

        return queryset

    @action(detail=False, methods=['get'])
    def me(self, request):

        user = self.request.user
        # if user.has_perm('isp_stage.isp_directeur_travaux'):
        directeursTraveaux = DirecteurTravaux.objects.filter(employee__user__id = user.id)
        if directeursTraveaux.exists() : 
            return Response( DirecteurTravauxSerializer(directeursTraveaux, many=True).data )
        return Response("Aucun enregistrement de directeur de travaux trouvé pour vous ", 404)

    @action(detail=False, methods=['get'])
    def resumes(self, request):
        user = self.request.user
        # if user.has_perm('isp_stage.isp_directeur_travaux'):
        directeursTraveaux = DirecteurTravaux.objects.filter(employee__user__id = user.id)
        if not directeursTraveaux.exists() : 
            return Response("Aucun enregistrement de directeur de travaux trouvé pour vous ", 404)
        # departementsSettings  = DepartmentSettings.objects.filter(department__id = [director.department.id for director in directeursTraveaux ])
        details = []
        for directeursTravail in directeursTraveaux :
            departementsSettings, created  = DepartmentSettings.objects.get_or_create(department__id = directeursTravail.department.id, defaults={
                "department" : directeursTravail.department
            })
            details[directeursTravail.id] = {}
            details[directeursTravail.id]["settings"] = departementsSettings
            