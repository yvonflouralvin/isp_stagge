from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404  
from openpyxl import Workbook, load_workbook
from django.utils.text import slugify
from django.conf import settings
from django.core.files.storage import default_storage
from collections import defaultdict


from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import  Permission

from django.db.models import Q, Count

from rest_framework.exceptions import MethodNotAllowed
from django.core.exceptions import ObjectDoesNotExist

from core.utils import Paginator, get_db_name
import pandas as pd
 
from core.models import *
from job.utils import job
from .models import *
from uscitech_academy.models import *

from .serializers import *
from uscitech_academy.serializers import *

from uscitech_academy.serializers import GradeClasseSerializer

from rest_framework import status
import pandas as pd
from slugify import slugify
import json

from django.db.models import Sum


def get_current_academic_year(user):
    user_current_academic_year = UserSelectedAcademicYear.objects.filter(user = user).first()
    if user_current_academic_year :
        return user_current_academic_year.academic_year.id
    else :
        default_academic_year = UserSelectedAcademicYear.objects.filter(id="default_academic_year").first() 
        if default_academic_year :
            UserSelectedAcademicYear.objects.create(
                id = f'{user.id}',
                user = user,
                academic_year = default_academic_year.academic_year
            )
            return default_academic_year.academic_year.id
    return None

def get_academic_year(user):
    return AcademicYear.objects.filter(id=get_current_academic_year(user)).first()

class PromotionL2(APIView):
    def get(self, request):
        user = request.user
        #current_academic_year = get_current_academic_year(user)
        #queryset = Promotion.objects.filter(libelle="L2 (LMD)", academicyear=current_academic_year)
        queryset = Promotion.objects.filter(libelle="L2 (LMD)")
        datas = PromotionSerializer(queryset, many=True)
        return Response(datas.data)

class PromotionL3(APIView):
    def get(self, request):
        #current_academic_year = get_current_academic_year(request.user)
        #queryset = Promotion.objects.filter(libelle="L3 (LMD)", academicyear=current_academic_year)
        queryset = Promotion.objects.filter(libelle="L3 (LMD)")
        datas = PromotionSerializer(queryset, many=True)
        return Response(datas.data)

class StageViewSet(viewsets.ModelViewSet):
    pagination = Paginator()
    
    # current_academic_year = current_academic_year = get_current_academic_year(user)
    # queryset = Stage.objects.filter(academicyear=current_academic_year)
    serializer_class = StageSerializer

    def get_queryset(self):
        try:
            current_academic_year = get_current_academic_year(self.request.user)
            return Stage.objects.filter(academicyear=current_academic_year)
        except:
            return Stage.objects.none()
  
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

        if request.data.get("quote_object", None) is not None :
            stage.quote_object = request.data.get("quote_object")
        
        if request.data.get("quote") is not None :
            if stage.quote_by == None :
                stage_master = StageMaster.objects.get(employee__user__id=request.user.id)
                stage.quote_by = stage_master
            stage.quote = request.data.get("quote")

        stage.save()
        return Response(StageSerializer(stage).data)
  
    @action(detail=False, methods=['get'], url_path="get-by-user")
    def get_by_user(self, request):
        user = request.user
        stage_type = request.GET.get('stage', None)
        current_academic_year = get_current_academic_year(user)
        queryset = Stage.objects.filter(student__user__id=user.id, academicyear__id=current_academic_year)
        if stage_type is not None:
            try:
                if len(queryset) == 1 :
                    tmp = queryset.first()
                    if tmp.stage == 'pedagogique' :
                        _stage = Stage.objects.create(
                            stage="entreprise",
                            student=tmp.student
                        )
                        _stage.save()
                        queryset = Stage.objects.filter(student__user__id=user.id)
            except:
                pass
            
            queryset = queryset.filter(stage=stage_type)
        stage_instance = queryset.first()
        if stage_instance:
            return Response(StageSerializer(stage_instance).data)
        return Response(None, 404)
  
    @action(detail=False, methods=['get'])
    def get_department_for_stages(self, request):
        user = request.user
        queryset = GradeClasse.objects.all()
        
        if user.is_superuser == True :
            pass
        elif (user.has_perm('isp_stage.isp_departement_officier') and not user.has_perm('isp_stage.isp_user_stage_master')):
            dept_off = DeptRechercheOfficier.objects.filter(employee__user__id=user.id)
            if dept_off.exists() :
                dept_off = dept_off.first()
                queryset = queryset.filter(id__in=[dept_off.dept.id])
            else :
                queryset = GradeClasse.objects.none() 
        elif (not user.has_perm('isp_stage.isp_departement_officier') and user.has_perm('isp_stage.isp_user_stage_master')) :
            # Filtrer les stages où l'utilisateur est un StageMaster
            stage_master = StageMaster.objects.filter(employee__user=user).first()
            if stage_master:
                stages = Stage.objects.filter(stagemaster=stage_master)
                stage_type = request.GET.get('stage', None)
                if stage_type != None :
                    stages =  stages.filter(stage=stage_type)
                queryset = GradeClasse.objects.filter(promotion__student_promotion__in=stages.values('student')).distinct()
            else:
                queryset = GradeClasse.objects.none()

        serialized_data = GradeClasseSerializer(queryset, many=True).data
                
        # Ajouter le nombre de stages à la réponse
        for grade in serialized_data:
            stages = Stage.objects.filter(student__promotion__grade__id = grade['id'])
            if (not user.has_perm('isp_stage.isp_departement_officier') and user.has_perm('isp_stage.isp_user_stage_master')) :
                if stage_master:
                    stages = stages.filter(stagemaster=stage_master)
            stage_type = request.GET.get('stage', None)
            if stage_type != None :
                stages =  stages.filter(stage=stage_type)
            grade['stage_count'] = len(stages)

        return Response(serialized_data)
    

class StageMasterViewSet(viewsets.ModelViewSet):
    
    # current_academic_year = current_academic_year = get_current_academic_year(user)
    # queryset = StageMaster.objects.filter(academicyear=current_academic_year)
    
    def get_queryset(self):
        try:
            current_academic_year = get_current_academic_year(self.request.user)
            return StageMaster.objects.filter()
        except:
            return StageMaster.objects.none()
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
        stagemasters = StageMaster.objects.filter(employee__user__id = user.id)
        stages = Stage.objects.filter(stagemaster__in =  stagemasters, stage=stage)

        # stagemaster = StageMaster.objects.filter(employee__user__id = user.id)
        # stagemaster.is_quote_submitted = True
        # stagemaster.save()
        dept = request.GET.get('dept', None)
        if dept != None :
            stages = stages.filter(student__promotion__grade__id = dept )

        for st in stages :
            # if st.quote is not None :
            st.quote_status = "submitted"
            st.save()

        return Response({
            "stagemaster": StageMasterSerializer(stagemasters, many=True).data,
            "stages": StageSerializer(stages, many=True).data
        }, status=200)

    @action(detail=False, url_path='reset-quotes')
    def reset_quotes(self, request):
        """
        Réinitialise les cotes pour un maître de stage spécifique
        """
        user: User = request.user
        
        # Vérifier les permissions
        if not user.has_perm('isp_stage.isp_departement_officier') and not user.is_superuser:
            return Response({"message": "Vous n'avez pas les droits pour réinitialiser les cotes."}, status=403)
        
        stage = request.GET.get("stage")
        stage_master_id = request.GET.get("stage_master")
        dept = request.GET.get('dept', None)
        
        if not stage:
            return Response({"message": "Le paramètre 'stage' est requis."}, status=400)
        
        if not stage_master_id:
            return Response({"message": "Le paramètre 'stage_master' est requis."}, status=400)
        
        try:
            stage_master = StageMaster.objects.get(id=stage_master_id)
        except StageMaster.DoesNotExist:
            return Response({"message": "Maître de stage non trouvé."}, status=404)
        
        # Filtrer les stages selon les paramètres
        stages = Stage.objects.filter(stagemaster=stage_master, stage=stage)
        
        if dept:
            stages = stages.filter(student__promotion__grade__id=dept)
        
        # Réinitialiser les cotes
        updated_count = 0
        for stage_obj in stages:
            # stage_obj.quote = None
            # stage_obj.quote_object = {}
            # stage_obj.quote_by = None
            stage_obj.quote_status = "draft"
            stage_obj.save()
            updated_count += 1
        
        return Response({
            "message": f"{updated_count} stages ont été réinitialisés avec succès.",
            "updated_count": updated_count,
            "stage_master": StageMasterSerializer(stage_master).data
        }, status=200)

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
            created_stagemasters = []
            
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
                    permission = Permission.objects.get(codename="isp_user_stage_master")
                    user.user_permissions.add(permission)
                except: 
                    pass

                employee, created_employee = Employee.objects.get_or_create(user__id = user.id, defaults={
                    "fullname" : f'{user.name} {user.last_name} {user.first_name}',
                    "user": user
                })

                stage_master, created_stagemaster = StageMaster.objects.get_or_create(employee__id = employee.id, defaults={
                    "employee": employee
                })
                
               
                created_stagemasters.append(stage_master.id)
            
            return Response({'message': 'Importation réussie.', 'stage_masters': created_stagemasters}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



class StudentForStageAPIView(APIView):

    def post(self, request):

        stage = Stage.objects.filter(facture=request.data.get("facture"))
        if stage.exists():
            return Response({"message": "Le numéro de facture existe déjà."}, status=400)
        
        student = Student.objects.filter(id=request.data.get("student_id")).first()
        
        academic_year = get_academic_year(request.user)

        stg = Stage()
        stg.stage = request.data.get("stage")
        stg.student = student
        stg.facture = request.data.get("facture")
        stg.academicyear = academic_year   # 🔴 on fixe l'année académique
        stg.save()

        return Response({
            "student":StudentSerializer(student).data,
            "stage": StageSerializer(stg).data
        }, status=201)

    def get(self, request, stage):

        paginator = Paginator() 
        academicyear = get_academic_year(request.user)

        stages = Stage.objects.filter(academicyear=academicyear) 
        disable_pagination = request.GET.get('disable_pagination', "0")

        if stage == "entreprise":
            # Get students with pedagogique stage but no entreprise stage
            pedagogique_students = Stage.objects.filter(academicyear = academicyear,  stage="pedagogique").values_list('student_id', flat=True)
            entreprise_students = Stage.objects.filter(academicyear = academicyear, stage="entreprise").values_list('student_id', flat=True)
            missing_entreprise = set(pedagogique_students) - set(entreprise_students)

            # Create missing entreprise stages
            for student_id in missing_entreprise:
                student = Student.objects.get(id=student_id)
                _stage = Stage.objects.create(
                    stage="entreprise",
                    student=student,
                    academicyear = get_academic_year(request.user), 
                )
                _stage.save()

        if stage == "pedagogique":
            # Get students with entreptise stage but no pedagogique stage
            pedagogique_students = Stage.objects.filter(academicyear = academicyear, stage="pedagogique").values_list('student_id', flat=True)
            entreprise_students = Stage.objects.filter(academicyear = academicyear, stage="entreprise").values_list('student_id', flat=True)
            missing_pedagogique = set(entreprise_students) - set(pedagogique_students)

            # Create missing pedagogique stages
            for student_id in missing_pedagogique:
                student = Student.objects.get(id=student_id)
                _stage = Stage.objects.create(
                    stage="pedagogique",
                    student=student,
                    academicyear = academicyear
                )   
                _stage.save()

        user: User = request.user
        # L'utilisateur n'est ni maitre de stage, si chef de la recherche du département
        if not user.has_perm('isp_stage.isp_departement_officier') and not user.has_perm('isp_stage.isp_user_stage_master') and user.is_superuser ==  False:
            return Response({"message": "Vous n'avez pas les droits pour accéder à cette page 1."}, status=403)

        # L'utilisateur est chef de departement à la recherche mais pas maitre de stage, mais n'a pas de département d'attache
        dept_off = DeptRechercheOfficier.objects.filter(employee__user__id=user.id)
        if (user.has_perm('isp_stage.isp_departement_officier') and not user.has_perm('isp_stage.isp_user_stage_master')) and not dept_off.exists():
            stages = None
        elif  (user.has_perm('isp_stage.isp_departement_officier') and not user.has_perm('isp_stage.isp_user_stage_master')) and dept_off.exists(): 
            stages = stages.filter(student__promotion__grade__id=dept_off[0].dept.id, stage=stage)
        elif (not user.has_perm('isp_stage.isp_departement_officier') and user.has_perm('isp_stage.isp_user_stage_master')) :
            stages = stages.filter(stagemaster__employee__user__id__in =  [user.id], stage=stage)
        elif user.is_superuser ==  True:
            stages = stages.filter(stage=stage)
        elif stage == "all" :
            current_academic_year = current_academic_year = get_current_academic_year(user)
            stages = Stage.objects.filter(academicyear__id=current_academic_year) 

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
        
        if disable_pagination == "1" :
            return Response(StageSerializer(stages.order_by('student__user__name'), many=True).data)
        paginated_stages = paginator.paginate_queryset(stages.order_by('student__user__name'), request)
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
    search_fields = ["user__username", "user__first_name", "user__last_name", "user__name"]

    def perform_create(self, serializer):
        academic_year = get_academic_year(self.request.user)
        serializer.save(academicyear=academic_year)

    def get_queryset(self):
        """
        Permet de filtrer les départements :
        - Si `parent_department_id` est fourni, retourne les sous-départements du département donné.
        - Sinon, retourne tous les départements.
        """
        user = self.request.user
        current_academic_year = get_current_academic_year(user)
        print("CURRENT ACADEMIC YEAR :",  current_academic_year)
        students_for = self.request.query_params.get('for', None)
        filter_promotion = self.request.query_params.get('filter_promotion', None)
        
        if user.has_perm("isp_stage.isp_departement_officier") :
            department_officier = DeptRechercheOfficier.objects.filter(employee__user__id = user.id)
            if not  department_officier.exists() :
                return Student.objects.none()
            
            department_officier: DeptRechercheOfficier = department_officier[0]
            queryset = Student.objects.filter(promotion__grade__id = department_officier.dept.id, academicyear__id = current_academic_year)
            if filter_promotion != None :
                queryset = queryset.filter(promotion__libelle = filter_promotion)
            return queryset
        
        elif user.has_perm('isp_stage.isp_user_student') or user.has_perm("uscitech_academy.academy_is_student"):
            student = Student.objects.filter(user=user)
            if not student.exists() :
                return Student.objects.none()

            student = student.first()
            
            queryset = Student.objects.filter(promotion__id=student.promotion.id, academicyear__id = current_academic_year)

            # Filtrage en fonction de "memoire"
            if students_for == "memoire":
                student_memoires = StudentMemoire.objects.filter(student__promotion__id=student.promotion.id)
                queryset = queryset.exclude(id__in=[student_memoire.student.id for student_memoire in student_memoires])

            # Filtrage en fonction de "projet-tutore"
            elif students_for == "projet-tutore":
                projet_tutores = ProjetTutore.objects.filter(head__promotion__id=student.promotion.id, head__academicyear__id = current_academic_year)
                excluded_members = [member.id for projet_tutore in projet_tutores for member in projet_tutore.member.all()]
                excluded_heads = [projet_tutore.head.id for projet_tutore in projet_tutores]
                queryset = queryset.exclude(id__in=excluded_members).exclude(id__in=excluded_heads)
            
            if filter_promotion != None :
                queryset = queryset.filter(promotion__libelle = filter_promotion)
            return queryset

        else :
            queryset =  Student.objects.all()
            if filter_promotion != None :
                queryset = queryset.filter(promotion__libelle = filter_promotion)
            return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        current_academic_year = get_current_academic_year(user)
        queryset = self.get_queryset() #.filter(academic_year__id = current_academic_year)
        return Response({
            "count": len(queryset),
            "l2as": len(queryset.filter(promotion__libelle = "L2 (AS)")),
            "l2lmd": len(queryset.filter(promotion__libelle = "L2 (LMD)")),
            "l3lmd": len(queryset.filter(promotion__libelle = "L3 (LMD)"))
        })
    
    @action(detail=False, methods=['post'], url_path='bulk-upload')
    def bulk_upload(self, request):
        user = request.user
        current_academic_year = get_current_academic_year(user)
        academicyear = get_academic_year(request.user)
        # promotion = Promotion.objects.filter(grade__id = )
        promotion_id = request.data.get('promotion_id', None)
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Aucun fichier fourni.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            df = pd.read_excel(file)
            created_students = []
            
            for _, row in df.iterrows():
                try:
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
                        defaults={'promotion': promotion},
                        academic_year = academicyear
                    )

                    created_students.append(student.id)
                except:
                    pass
            
            return Response({'message': 'Importation réussie.', 'students': created_students}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='reset_password')
    def reset_password(self, request, pk):
        user = request.user
        # student_id = request.data.get('student_id', None)
        # if not student_id:
        #     return Response({'error': 'Aucun étudiant fourni.'}, status=status.HTTP_400_BAD_REQUEST)
        
        student = Student.objects.filter(id=pk).first()
        if not student:
            return Response({'error': 'Étudiant non trouvé.'}, status=status.HTTP_404_NOT_FOUND)
        student.user.set_password(os.environ.get("DEFAULT_PASS", "1234"))
        student.user.save()
        return Response({'message': 'Mot de passe réinitialisé avec succès.'}, status=status.HTTP_200_OK)
    

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


    


    @action(detail=False, url_path=r'get_by_user_id/(?P<user_id>\d+)')
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


    @action(detail=False, methods=['get'])
    def promotions(self, request):
        user: User = request.user 
        dept = DeptRechercheOfficier.objects.filter(employee__user__id=user.id)
        if dept.exists():
            promotions = Promotion.objects.filter(grade = dept[0].dept).order_by('libelle')
            return Response(PromotionSerializer(promotions, many=True).data, status=200)
        return Response({}, status=404)

    @action(detail=False, methods=['get'])
    def student_without_memoires(self, request):
        user = request.user
        academicyear = get_academic_year(user)
        dept = DeptRechercheOfficier.objects.filter(employee__user__id=user.id).first()

        if not dept:
            return Response([], 404)

        # Récupérer les étudiants ayant un mémoire mais sans directeur
        memoires_sans_directeur = StudentMemoire.objects.filter(
            student__promotion__grade=dept.dept, director__isnull=False, academicyear = academicyear
        )
        
        students_a_exclure = memoires_sans_directeur.values_list('student_id', flat=True)
        
        # Récupérer tous les étudiants de L2 (AS) qui n'ont pas de mémoire ou un mémoire sans directeur
        students = Student.objects.filter(
            promotion__grade=dept.dept, 
            promotion__libelle='L2 (AS)',
            academicyear = academicyear
        ).exclude(id__in=students_a_exclure)

        disable_pagination = request.GET.get('disable_pagination', '0')

        if disable_pagination == '0':
            paginator = self.pagination_class()
            paginated_students = paginator.paginate_queryset(students, request)
            return paginator.get_paginated_response(StudentSerializer(paginated_students, many=True).data)
        else:
            return Response(StudentSerializer(students, many=True).data)

    

    @action(detail=False, methods=['get'])
    def generer_excel_student_pedagogique_full(self, request):
        academicyear = get_academic_year(request.user)
        """
        Génère un fichier Excel, l'enregistre dans le répertoire de médias
        et redirige l'utilisateur vers une URL de téléchargement.
        """
        def get_attr(obj, key, default=0):
            if isinstance(obj, dict):
                return float(obj.get(key, default))
            return float(getattr(obj, key, default))

        stage = "pedagogique"

        user = request.user
        dept = DeptRechercheOfficier.objects.filter(employee__user__id=user.id).first()

        if not dept:
            return Response([], 404)
        
        stages = Stage.objects.filter(stage = "pedagogique", student__promotion__grade = dept.dept, academicyear = academicyear)

        # Créer un nouveau classeur Excel 2016
        workbook = Workbook(write_only=True)
        workbook.iso_dates = True  # Format de date Excel 2016
        sheet = workbook.create_sheet(title="Données Etudiants")
        sheet.sheet_properties.filterMode = False  # Désactiver les filtres avancés Excel 2016

        data = []

        if stage == "pedagogique" :
            data.append([
                "ID", 
                "Nom", 
                "Postnom", 
                "Prenom",
                "Seminaire de Stage A/20",
                "Maitre de Stage B/40",
                "Soutenance D/20",
                "Lecture Documents E/20",
                "Total Général /100",
                "Moyenne /20.",
            ])
            
            
            i = 1
            for stage in stages :
                i+=1
                quote = stage.quote_object 
                data.append([
                    f'{stage.id}',
                    f'{stage.student.user.name}',
                    f'{stage.student.user.last_name}',
                    f'{stage.student.user.first_name}',
                    f'{get_attr(quote, 'seminaire',0)}',
                    f'{((get_attr(quote, 'stage',0)+get_attr(quote, 'carnet',0)+get_attr(quote, 'rapport',0))/4)}',
                    f'{get_attr(quote, 'soutenance',0)}',
                    f'{get_attr(quote, 'lecture',0)}',
                    f'=E{i}+F{i}+G{i}+H{i}',
                    f'=(E{i}+F{i}+G{i}+H{i})/5',
                    # f'{((get_attr(quote, 'seminaire',0)+get_attr(quote, 'soutenance',0)+get_attr(quote, 'lecture',0)+float((get_attr(quote, 'stage',0)+get_attr(quote, 'carnet',0)+get_attr(quote, 'rapport',0))/4)))}',
                    # f'{(float(get_attr(quote, 'seminaire',0)+get_attr(quote, 'soutenance',0)+get_attr(quote, 'lecture',0)+float((get_attr(quote, 'stage',0)+get_attr(quote, 'carnet',0)+get_attr(quote, 'rapport',0))/4))/5)}'
                ])

        if stage == "impregnation" :
            data.append([
                "ID", 
                "Nom", 
                "Postnom", 
                "Prenom",
                "Régularité /10"
                "Tenue /10"
                "Carnet de Stage /10"
                "Fiche Préparation /10"
                "Leçon /20"
                "Rapport /20"
                "Défense Rapport /20",
                "Total /100",
                "Moyenne /20",
            ]) 

            i = 1
            for stage in stages :
                i+=1
                quote = stage.quote_object 

                data.append([
                    f'{stage.id}',
                    f'{stage.student.user.name}',
                    f'{stage.student.user.last_name}',
                    f'{stage.student.user.first_name}',
                    f'{get_attr(quote, 'regularite', 0)}',
                    f'{get_attr(quote, 'tenue', 0)}',
                    f'{get_attr(quote, 'carnet_stage', 0)}',
                    f'{get_attr(quote, 'fiche_prepa', 0)}',
                    f'{get_attr(quote, 'lecon', 0)}',
                    f'{get_attr(quote, 'rapport_stage', 0)}',
                    f'{get_attr(quote, 'defense_rapport', 0)}', 
                    f'=E{i}+F{i}+G{i}+H{i}+I{i}+J{i}+K{i}',
                    f'=(E{i}+F{i}+G{i}+H{i}+I{i}+J{i}+K{i})/5',
                    # f'{((get_attr(quote, 'regularite', 0)+get_attr(quote, 'tenue', 0)+get_attr(quote, 'carnet_stage', 0)+get_attr(quote, 'fiche_prepa', 0)+get_attr(quote, 'lecon', 0)+get_attr(quote, 'rapport_stage', 0)+get_attr(quote, 'defense_rapport', 0)))}',
                    # f'{((get_attr(quote, 'regularite', 0)+get_attr(quote, 'tenue', 0)+get_attr(quote, 'carnet_stage', 0)+get_attr(quote, 'fiche_prepa', 0)+get_attr(quote, 'lecon', 0)+get_attr(quote, 'rapport_stage', 0)+get_attr(quote, 'defense_rapport', 0))/5)}',
                ])

        if stage == "entreprise" :
            data.append([
                "ID", 
                "Nom", 
                "Postnom", 
                "Prenom",
                "Maitre de Stage /30"
                "Lecture des documents /70" ,
                "Total /100",
                "Moyenne /20",
            ]) 
            i = 1
            for stage in stages :
                i += 1
                quote = stage.quote_object 
                data.append([
                    f'{stage.id}',
                    f'{stage.student.user.name}',
                    f'{stage.student.user.last_name}',
                    f'{stage.student.user.first_name}', 
                    f'{get_attr(quote, 'stage_master_entreprise_centralized', 0)}',
                    f'{get_attr(quote, 'lecture_document', 0)}', 
                    f'=E{i}+F{i}',
                    f'=(E{i}+F{i})/5',
                    # f'{((get_attr(quote, 'quote_object.stage_master_entreprise_centralized', 0)+get_attr(quote, 'lecture_document', 0)))}',
                    # f'{((get_attr(quote, 'quote_object.stage_master_entreprise_centralized', 0)+get_attr(quote, 'lecture_document', 0))/5)}',
                ])


        # Ajouter des données d'exemple (remplacez ceci par vos données réelles)
        

        

        for row_data in data:
            sheet.append(row_data)

        # Générer un nom de fichier unique
        nom_fichier = f"stage_students_pedagogique_cotes_{slugify(dept.dept.libelle)}.xlsx"
        chemin_fichier = os.path.join(settings.MEDIA_ROOT, nom_fichier)

        # Enregistrer le fichier Excel en format 2016
        workbook.save(chemin_fichier)

        # Construire l'URL de téléchargement
        url_telechargement = os.path.join(settings.MEDIA_URL, nom_fichier)

        # Rediriger l'utilisateur vers l'URL de téléchargement
        return Response(url_telechargement)

    @action(detail=False, methods=['get'])
    def generer_excel_student_pedagogique_full(self, request):
        """
        Génère un fichier Excel, l'enregistre dans le répertoire de médias
        et redirige l'utilisateur vers une URL de téléchargement.
        """

        stage = "pedagogique"

        user = request.user
        academicyear = get_academic_year(user)
        dept = DeptRechercheOfficier.objects.filter(employee__user__id=user.id).first()

        if not dept:
            return Response([], 404)
        
        stages = Stage.objects.filter(stage = "pedagogique", student__promotion__grade = dept.dept, academicyear = academicyear)

        # Créer un nouveau classeur Excel 2016
        workbook = Workbook(write_only=True)
        workbook.iso_dates = True  # Format de date Excel 2016
        sheet = workbook.create_sheet(title="Données Etudiants")
        sheet.sheet_properties.filterMode = False  # Désactiver les filtres avancés Excel 2016

        data = []

        if stage == "pedagogique" :
            data.append([
                "ID", 
                "Nom", 
                "Postnom", 
                "Prenom",
                "Seminaire de Stage A/20",
                "Maitre de Stage B/40",
                "Soutenance D/20",
                "Lecture Documents E/20",
                "Total Général /100",
                "Moyenne /20",
            ])
            

            for stage in stages :
                data.append([
                    f'{stage.id}',
                    f'{stage.student.user.name}',
                    f'{stage.student.user.last_name}',
                    f'{stage.student.user.first_name}',
                    f'{stage.quote_object.seminaire}',
                    f'{((stage.quote_object.stage+stage.quote_object.carnet+stage.quote_object.rapport)/4)}',
                    f'{stage.quote_object.soutenance}',
                    f'{stage.quote_object.lecture}',
                    f'{((stage.quote_object.seminaire+stage.quote_object.soutenance+stage.quote_object.lecture+((stage.quote_object.stage+stage.quote_object.carnet+stage.quote_object.rapport)/4)))}'
                    f'{((stage.quote_object.seminaire+stage.quote_object.soutenance+stage.quote_object.lecture+((stage.quote_object.stage+stage.quote_object.carnet+stage.quote_object.rapport)/4))/5)}'
                ])

        if stage == "impregnation" :
            data.append([
                "ID", 
                "Nom", 
                "Postnom", 
                "Prenom",
                "Régularité /10"
                "Tenue /10"
                "Carnet de Stage /10"
                "Fiche Préparation /10"
                "Leçon /20"
                "Rapport /20"
                "Défense Rapport /20",
                "Total /100",
                "Moyenne /20",
            ]) 

            for stage in stages :
                data.append([
                    f'{stage.id}',
                    f'{stage.student.user.name}',
                    f'{stage.student.user.last_name}',
                    f'{stage.student.user.first_name}',
                    f'{stage.quote_object.regularite}',
                    f'{stage.quote_object.tenue}',
                    f'{stage.quote_object.carnet_stage}',
                    f'{stage.quote_object.fiche_prepa}',
                    f'{stage.quote_object.lecon}',
                    f'{stage.quote_object.rapport_stage}',
                    f'{stage.quote_object.defense_rapport}', 
                    f'{((stage.quote_object.regularite+stage.quote_object.tenue+stage.quote_object.carnet_stage+stage.quote_object.fiche_prepa+stage.quote_object.lecon+stage.quote_object.rapport_stage+stage.quote_object.defense_rapport))}',
                    f'{((stage.quote_object.regularite+stage.quote_object.tenue+stage.quote_object.carnet_stage+stage.quote_object.fiche_prepa+stage.quote_object.lecon+stage.quote_object.rapport_stage+stage.quote_object.defense_rapport)/5)}',
                ])

        if stage == "entreprise" :
            data.append([
                "ID", 
                "Nom", 
                "Postnom", 
                "Prenom",
                "Maitre de Stage /30"
                "Lecture des documents /70" ,
                "Total /100",
                "Moyenne /20",
            ]) 

            for stage in stages :
                data.append([
                    f'{stage.id}',
                    f'{stage.student.user.name}',
                    f'{stage.student.user.last_name}',
                    f'{stage.student.user.first_name}', 
                    f'{stage.quote_object.stage_master_entreprise_centralized}',
                    f'{stage.quote_object.lecture_document}', 
                    f'{((stage.quote_object.quote_object.stage_master_entreprise_centralized+stage.quote_object.lecture_document))}',
                    f'{((stage.quote_object.quote_object.stage_master_entreprise_centralized+stage.quote_object.lecture_document)/5)}',
                ])


        # Ajouter des données d'exemple (remplacez ceci par vos données réelles)
        

        

        for row_data in data:
            sheet.append(row_data)

        # Générer un nom de fichier unique
        nom_fichier = f"stage_students_pedagogique_cotes_{slugify(dept.dept.libelle)}.xlsx"
        chemin_fichier = os.path.join(settings.MEDIA_ROOT, nom_fichier)

        # Enregistrer le fichier Excel en format 2016
        workbook.save(chemin_fichier)

        # Construire l'URL de téléchargement
        url_telechargement = os.path.join(settings.MEDIA_URL, nom_fichier)

        # Rediriger l'utilisateur vers l'URL de téléchargement
        return Response(url_telechargement)

    @action(detail=False, methods=['get'])
    def generer_excel_student_pedagogique(self, request):
        """
        Génère un fichier Excel, l'enregistre dans le répertoire de médias
        et redirige l'utilisateur vers une URL de téléchargement.
        """

        user = request.user
        academicyear = get_academic_year(user)
        dept = DeptRechercheOfficier.objects.filter(employee__user__id=user.id).first()

        if not dept:
            return Response([], 404)
        
        stages = Stage.objects.filter(stage = "pedagogique", student__promotion__grade = dept.dept, academicyear = academicyear)

        # Créer un nouveau classeur Excel 2016
        workbook = Workbook(write_only=True)
        workbook.iso_dates = True  # Format de date Excel 2016
        sheet = workbook.create_sheet(title="Données Etudiants")
        sheet.sheet_properties.filterMode = False  # Désactiver les filtres avancés Excel 2016

        # Ajouter des données d'exemple (remplacez ceci par vos données réelles)
        data = [
            ["ID", "Nom Complet", "Cote"]
        ]

        for stage in stages :
            data.append([
                f'{stage.id}',
                f'{stage.student.user.name} {stage.student.user.last_name} {stage.student.user.first_name}',
                f'{0}'
            ])

        for row_data in data:
            sheet.append(row_data)

        # Générer un nom de fichier unique
        nom_fichier = f"stage_students_pedagogique_cotes_{slugify(dept.dept.libelle)}.xlsx"
        chemin_fichier = os.path.join(settings.MEDIA_ROOT, nom_fichier)

        # Enregistrer le fichier Excel en format 2016
        workbook.save(chemin_fichier)

        # Construire l'URL de téléchargement
        url_telechargement = os.path.join(settings.MEDIA_URL, nom_fichier)

        # Rediriger l'utilisateur vers l'URL de téléchargement
        return Response(url_telechargement)
    
    @action(detail=False, methods=['POST'])
    def post_excel_student_pedagogique(self, request):
        user = request.user
        """
        Reçoit un fichier Excel via une requête POST, le parcourt et affiche son contenu.
        """
        if request.method == 'POST' and request.FILES.get('fichier_excel'):
            fichier_excel = request.FILES['fichier_excel']
            file_name = default_storage.save(f'uploads/{fichier_excel.name}', fichier_excel)
            file_path = default_storage.path(file_name)
            _job = job({
                "id": "isp_stage_uploading_centralized_quotes",
                "db": get_db_name(request),
                "username": user.username,
                "index": request.POST.get('index', 'index'),
                "fichier_excel": file_path
            })

            if _job != None :
                return Response({'jobId': _job.id})
            else:
               return Response("Job is none", 400) 
        else:
            return Response( 'Error happen', 400)
     
class ProjetTutoreViewSet(viewsets.ModelViewSet):
    queryset = ProjetTutore.objects.all()
    serializer_class = ProjetTutoreSerializer
    pagination_class = Paginator
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["head__username", "head__first_name", "head__last_name", "head__first_name", "head__phone", "head__email"]

    def get_queryset(self):
        user = self.request.user
        current_academic_year = get_current_academic_year(user)
        academicyear = get_academic_year(user)
        queryset = ProjetTutore.objects.filter(academicyear = academicyear)
        # Superutilisateur voit tout
        if user.is_superuser:
            return queryset

        # Vérifier si l'utilisateur est un directeur 
        if user.has_perm('isp_stage.isp_directeur_travaux'):
            director = DirecteurTravaux.objects.filter(employee__user=user, direction_type="projet-tutore").first()
            if director:
                return queryset.filter(director__id=director.id)

        # Vérifier si l'utilisateur est un directeur 
        if user.has_perm('isp_stage.isp_departement_officier'):
            departmentOfficier = DeptRechercheOfficier.objects.filter(employee__user=user).first() 
            if departmentOfficier :
                return queryset.filter(head__promotion__grade__id=departmentOfficier.dept.id)

        # Par défaut, retour vide
        return queryset.all()

    @action(detail=False, methods=['get'])
    def my_projects(self, request):
        """Récupère les projets tutorés où l'utilisateur est soit 'head' soit 'member'"""
        user = self.request.user
        current_academic_year = get_current_academic_year(user)
        academicyear = get_academic_year(user)
        student = Student.objects.filter(user=request.user, academicyear = academicyear).first()
        if not student:
            return Response({"detail": "Aucun étudiant associé à cet utilisateur."}, status=404)

        projets = ProjetTutore.objects.filter(models.Q(head=student) | models.Q(member=student)).distinct()
        projects = projects.filter(academicyear = academicyear)
        if len(projets) >= 1 :
            serializer = self.get_serializer(projets[0])
            return Response(serializer.data)
        return Response({"detail": "Aucun projet associé à cet utilisateur."}, status=404)


    @action(detail=False, methods=['get'], url_path='student-without-project')
    def student_without_project(self, request):
        user = request.user
        current_academic_year = get_current_academic_year(user)
        academicyear = get_academic_year(user)
        dept = DeptRechercheOfficier.objects.filter(employee__user__id=user.id).first()
        if not dept :
            return Response([], 404)

        students_without_project = Student.objects.filter(academicyear = academicyear,  promotion__grade=dept.dept, promotion__libelle="L3 (LMD)")

        heads_notnull = [pj.head.id for pj in ProjetTutore.objects.filter(director__isnull=False, academicyear = academicyear)]
        members_notnull = [member.id for pj in ProjetTutore.objects.filter(director__isnull=False , academicyear = academicyear) for member in pj.member.all()]

        students_without_project = students_without_project.exclude(
            id__in=heads_notnull + members_notnull
        ).distinct()

        students_without_project = students_without_project.order_by("user__name")

        if request.query_params.get('disable_pagination') == '1':
            serializer = StudentSerializer(students_without_project, many=True)
            return Response(serializer.data)
        else:
            paginator = self.pagination_class()
            paginated_students = paginator.paginate_queryset(students_without_project, self.request)
            serializer = StudentSerializer(paginated_students, many=True)
            return paginator.get_paginated_response(serializer.data)
    

    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        projet = self.get_object()
        user = request.user
        current_academic_year = get_current_academic_year(user)
        academicyear = get_academic_year(user)

        # Vérifier si l'utilisateur est le chef du projet
        student = Student.objects.filter(user=request.user, academicyear = academicyear).first()
        # if not student or projet.head != student:
        #     return Response({"detail": "Seul l'étudiant concerné peut soumettre le travail."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProjetTutoreSubmissionSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Créer la soumission
            submission = ProjetTutoreSubmission.objects.create(
                projet=projet,
                submitter=student,
                final_subject=data["final_subject"],
                academicyear = academicyear
            )

            # Ajout des membres (ManyToMany)
            submission.members.set(data["members"])
            submission.save()
            
            # Mettre à jour le statut du projet
            projet.status = 'submitted'
            projet.save()
            
            return Response(ProjetTutoreSubmissionModelSerializer(submission).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        


    @action(detail=True, methods=['get'], url_path='details_submission')
    def details_submission(self, request, pk=None):
        user = request.user 
        current_academic_year = get_current_academic_year(user)
        academicyear = get_academic_year(user)
        projet = self.get_object()
        submission = ProjetTutoreSubmission.objects.filter(projet=projet, academicyear = academicyear).last()
        if not submission:
            return Response({"detail": "Aucune soumission trouvée pour ce travail."}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(ProjetTutoreSubmissionDetailSerializer(submission).data)

    @action(detail=True, methods=['post'], url_path='cancel_submission')
    def cancel_submission(self, request, pk=None):
        user = request.user 
        current_academic_year = get_current_academic_year(user)
        academicyear = get_academic_year(user)
        # Seuls les utilisateurs avec la permission 'isp_departement_officier' peuvent annuler
        if not request.user.has_perm('isp_stage.isp_departement_officier'):
            return Response({"detail": "Vous n'avez pas la permission d'annuler la soumission."}, status=status.HTTP_403_FORBIDDEN)

        projet = self.get_object()
        if projet.status != 'submitted':
            return Response({"detail": "Le travail n'est pas en statut 'soumis'."}, status=status.HTTP_400_BAD_REQUEST)

        # Supprimer la dernière soumission
        last_submission = ProjetTutoreSubmission.objects.filter(projet=projet, academicyear=academicyear).last()
        if last_submission:
            last_submission.delete()

        # Remettre le statut du projet à 'in_progress'
        projet.status = 'in_progress'
        projet.save()

        return Response({"detail": "La soumission a été annulée avec succès."}, status=status.HTTP_200_OK)
            


class StudentMemoireViewSet(viewsets.ModelViewSet):
    queryset = StudentMemoire.objects.all()
    serializer_class = StudentMemoireSerializer
    pagination_class = Paginator
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["student__user__username", "student__user__first_name", "student__user__last_name", "student__user__name", "student__user__phone", "student__user__email"]

    @action(detail=False, methods=['get'])
    def my_memoire(self, request):
        user = request.user 
        current_academic_year = get_current_academic_year(user)
        academicyear = get_academic_year(user)
        """Récupère les projets tutorés où l'utilisateur est soit 'head' soit 'member'"""
        student = Student.objects.filter(user=request.user, academicyear=academicyear).first()
        if not student:
            return Response({"detail": "Aucun étudiant associé à cet utilisateur."}, status=404)

        projets = StudentMemoire.objects.filter(models.Q(student=student), academicyear=academicyear).distinct()
        if len(projets) >= 1 :
            serializer = self.get_serializer(projets[0])
            return Response(serializer.data)
        return Response({"detail": "Aucun memoire associé à cet utilisateur."}, status=404)

    def get_queryset(self): 
        user = self.request.user
        current_academic_year = get_current_academic_year(user)
        academicyear = get_academic_year(user)
        queryset = StudentMemoire.objects.filter(academicyear=academicyear)
        # Superutilisateur voit tout
        if user.is_superuser:
            return queryset

        # Vérifier si l'utilisateur est un enseignant avec la permission spécifique
        if user.has_perm('isp_stage.isp_directeur_travaux'):
            director = DirecteurTravaux.objects.filter(employee__user=user, direction_type="memoire", academicyear=academicyear)
            if director.exists() :
                queryset = queryset.exclude(director = None)
                queryset = queryset.filter(director__in = director) 
            else :
                return StudentMemoire.objects.none()

        # Vérifier si l'utilisateur est un etudiant avec la permission spécifique
        if user.has_perm('isp_stage.isp_user_student') or user.has_perm("uscitech_academy.academy_is_student"):
            student = Student.objects.filter(user=user, academicyear=academicyear).first()
            if student:
                queryset = queryset.filter(student=student)

        # Vérifier si l'utilisateur est un responsable à la recherche avec la permission spécifique
        if user.has_perm('isp_stage.isp_departement_officier') :
            dept = DeptRechercheOfficier.objects.filter(employee__user__id = user.id)
            if not dept.exists() :
                queryset = StudentMemoire.objects.none()
            else :
                dept = dept.first()
                students = Student.objects.filter(promotion__grade=dept.dept, academicyear=academicyear)
                queryset = queryset.filter(student__in=students)

        # Par défaut, retour vide
        return queryset

    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        memoire = self.get_object()
        academicyear = get_academic_year(request.user)
        
        # Vérifier si l'utilisateur est le chef du projet
        student = Student.objects.filter(user=request.user, academicyear=academicyear).first()
        if not student or memoire.student != student:
            return Response({"detail": "Seul l'étudiant concerné peut soumettre le travail."}, status=status.HTTP_403_FORBIDDEN)

        serializer = StudentMemoireSubmissionSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Créer la soumission
            submission = StudentMemoireSubmission.objects.create(
                memoire=memoire,
                submitter=student,
                final_subject=data['subject'],
                academicyear=academicyear
            )
            
            # Mettre à jour le statut du projet
            memoire.status = 'submitted'
            memoire.save()
            
            return Response(StudentMemoireSubmissionDetailSerializer(submission).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='details_submission')
    def details_submission(self, request, pk=None):
        academicyear = get_academic_year(request.user)
        memoire = self.get_object()
        submission = StudentMemoireSubmission.objects.filter(memoire=memoire, academicyear = academicyear).last()
        if not submission:
            return Response({"detail": "Aucune soumission trouvée pour ce travail."}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(StudentMemoireSubmissionDetailSerializer(submission).data)

    @action(detail=True, methods=['post'], url_path='cancel_submission')
    def cancel_submission(self, request, pk=None):
        academicyear = get_academic_year(request.user)
        # Seuls les utilisateurs avec la permission 'isp_departement_officier' peuvent annuler
        if not request.user.has_perm('isp_stage.isp_departement_officier'):
            return Response({"detail": "Vous n'avez pas la permission d'annuler la soumission."}, status=status.HTTP_403_FORBIDDEN)

        memoire = self.get_object()
        if memoire.status != 'submitted':
            return Response({"detail": "Le travail n'est pas en statut 'soumis'."}, status=status.HTTP_400_BAD_REQUEST)

        # Supprimer la dernière soumission
        last_submission = StudentMemoireSubmission.objects.filter(memoire=memoire, academicyear = academicyear).last()
        if last_submission:
            last_submission.delete()

        # Remettre le statut du projet à 'in_progress'
        memoire.status = 'in_progress'
        memoire.save()

        return Response({"detail": "La soumission a été annulée avec succès."}, status=status.HTTP_200_OK)


class DepartmentSettingsViewSet(viewsets.ModelViewSet):
    queryset = DepartmentSettings.objects.all()
    serializer_class = DepartmentSettingsSerializer
    pagination_class = Paginator

    def get_queryset(self):
        academicyear = get_academic_year(self.request.user)
        queryset = DepartmentSettings.objects.filter(academicyear = academicyear)
        return queryset 

    @action(detail=False, methods=['get'])
    def me(self, request):
        academicyear = get_academic_year(request.user)
        user: User = request.user
        if user.has_perm('isp_stage.isp_departement_officier') :
            department_officier = DeptRechercheOfficier.objects.filter(employee__user__id = user.id)
            if not department_officier.exists() :
                return Response("Aucune donnée trouvé  -> department_officier", 404 )
            else :
                department_officier: DeptRechercheOfficier  = department_officier[0]
                department_settings = DepartmentSettings.objects.filter(department = department_officier.dept, academicyear = academicyear )
                if department_settings.exists() :
                    department_settings = department_settings[0]
                else :
                    department_settings = DepartmentSettings.objects.create(
                        department = department_officier.dept,
                        academicyear = academicyear
                    )
                serializer = self.get_serializer(department_settings)
                return Response(serializer.data)

        if user.has_perm('isp_stage.isp_user_student') or user.has_perm('uscitech_academy.academy_is_student') :
            student = Student.objects.filter(user = user, academicyear = academicyear)
            if not student.exists() :
                return Response("Aucune donnée trouvé -> student", 404 )
            else :
                student: Student  = student[0]
                department_settings = DepartmentSettings.objects.filter(department = student.promotion.grade, academicyear = academicyear )
                if department_settings.exists() :
                    department_settings = department_settings[0]
                else :
                    department_settings = DepartmentSettings.objects.create(
                        department = student.promotion.grade,
                        academicyear = academicyear
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
        academicyear = get_academic_year(user)
        # Vérification des permissions
        if user.has_perm('isp_stage.isp_user_student') or user.has_perm('uscitech_academy.academy_is_student'):
            try:
                # Récupérer l'étudiant
                student = Student.objects.get(user=user, academicyear = academicyear)
            except ObjectDoesNotExist as e:
                print(e)
                return Teacher.objects.none()

            # Récupérer les paramètres de département pour l'étudiant
            department_settings, created = DepartmentSettings.objects.get_or_create(
                department=student.promotion.grade,
                academicyear = academicyear
            )

            # Récupérer les projets tutorés pour le grade de l'étudiant
            projets = ProjetTutore.objects.filter(head__promotion__grade=student.promotion.grade, academicyear = academicyear)
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
            if student.promotion.libelle == "L3 (LMD)" :
                limit = department_settings.max_teacher_tutore_project_group
            elif student.promotion.libelle == "L2 (AS)" :
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

        academicyear = get_academic_year(request.user)
        students_without_stage = Student.objects.filter(academicyear = academicyear)
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

        if stage_type == "pedagogique" or stage_type == "entreprise" :
            students_without_stage = students_without_stage.filter(promotion__libelle = "L3 (LMD)")
        
        if stage_type == "impregnation" :
            students_without_stage = students_without_stage.filter(promotion__libelle = "L2 (LMD)")
        
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
        
        academicyear = get_academic_year(self.request.user) 
        """Ajouter la permission isp_directeur_travaux à l'utilisateur lors de la création."""
        directeur_travaux = serializer.save()
        directeur_travaux.academicyear = academicyear 
        directeur_travaux.save()
        user = directeur_travaux.employee.user  # Récupérer l'utilisateur

        permission = Permission.objects.get(codename="isp_directeur_travaux")
        user.user_permissions.add(permission)  # Ajouter la permission
        user.save()

    def perform_destroy(self, instance):
        # Supprimer le directeur du département
        employee = instance.employee
        super().perform_destroy(instance)

        # Vérifier si l'employé a encore des directeurs
        if not DirecteurTravaux.objects.filter(employee=employee).exists():
            # Si l'employé n'a plus de directeur, retirer la permission
            user = employee.user
            permission = Permission.objects.get(codename='isp_directeur_travaux')
            if permission in user.user_permissions.all():
                user.user_permissions.remove(permission)
                # Vous pouvez ajouter un message pour confirmer
                print(f"Permission 'isp_directeur_travaux' retirée de l'utilisateur {user.username}")
        
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Appeler la méthode `perform_destroy` pour gérer la logique de suppression et de mise à jour des permissions
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_queryset(self):

        user = self.request.user
        academicyear = get_academic_year(user)
        queryset = DirecteurTravaux.objects.filter(academicyear = academicyear)

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
            student = Student.objects.filter(user__id = user.id, academicyear = academicyear)
            if not student.exists():
                return DirecteurTravaux.objects.none()
            student = student.first()
            queryset = queryset.filter(department = student.promotion.grade)

            # Récupérer les paramètres de département pour l'étudiant
            department_settings, created = DepartmentSettings.objects.get_or_create(
                department=student.promotion.grade,
                academicyear = academicyear
            )

            useds =  [] 
            
            if direction_type == "projet-tutore":
                useds = ProjetTutore.objects.filter(director__in = queryset, academicyear = academicyear)
            if direction_type == "memoire":
                useds = StudentMemoire.objects.filter(director__in = queryset, academicyear = academicyear)
            director_count = {}
            for projet in useds:
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
            for director_id, director_info in director_count.items():
                director = director_info['director']
                counts = director_info['counts']
                
                if (director.category == "externe" and counts >= department_settings.max_teacher_externe_tutore_project_group and director.direction_type == "projet-tutore") or \
                (director.category == "interne" and counts >= department_settings.max_teacher_tutore_project_group and director.direction_type == "projet-tutore") or \
                (director.category == "externe" and counts >= department_settings.max_teacher_externe_memoire and director.direction_type == "memoire") or \
                (director.category == "interne" and counts >= department_settings.max_teacher_memoire and director.direction_type == "memoire"):
                    final_directors.append(director.id)

            # Exclusion des directeurs dont les ID sont dans final_directors
            queryset = queryset.exclude(id__in=final_directors)

        return queryset

    @action(detail=False, methods=['get'])
    def me(self, request):

        user = self.request.user
        academicyear = get_academic_year(user)
        # if user.has_perm('isp_stage.isp_directeur_travaux'):
        directeursTraveaux = DirecteurTravaux.objects.filter(employee__user__id = user.id, academicyear = academicyear)
        if directeursTraveaux.exists() :
            return Response( DirecteurTravauxSerializer(directeursTraveaux, many=True).data )
        return Response("Aucun enregistrement de directeur de travaux trouvé pour vous ", 404 )

    @action(detail=False, methods=['get'])
    def resumes(self, request):
        user = self.request.user    
        academicyear = get_academic_year(user)
        
        # Fetching all associated "Directeurs de Travaux" for the current user
        directeursTraveaux = DirecteurTravaux.objects.filter(employee__user__id=user.id, academicyear = academicyear)
        
        if not directeursTraveaux.exists():
            return Response("Aucun enregistrement de directeur de travaux trouvé pour vous", status=404)
        
        details = {}

        # Organizing the data by department ID
        for directeursTravail in directeursTraveaux:
            dept_id = str(directeursTravail.department.id)
            
            # Fetch DepartmentSettings for the current department
            dept_settings = DepartmentSettings.objects.get_or_create(department=directeursTravail.department, academicyear = academicyear)[0]
            
            # Calculate used quota based on direction type and category
            used_tutore_projects_interne = 0
            used_tutore_projects_externe = 0
            used_memoire_projects_interne = 0 
            used_memoire_projects_externe = 0

            if directeursTravail.direction_type == "projet-tutore":
                if directeursTravail.category == "interne":
                    used_tutore_projects_interne = ProjetTutore.objects.filter(director=directeursTravail, academicyear = academicyear).count()
                else:
                    used_tutore_projects_externe = ProjetTutore.objects.filter(director=directeursTravail, academicyear = academicyear).count()
            
            elif directeursTravail.direction_type == "memoire":
                if directeursTravail.category == "interne":
                    used_memoire_projects_interne = StudentMemoire.objects.filter(director=directeursTravail, academicyear = academicyear).count()
                else:
                    used_memoire_projects_externe = StudentMemoire.objects.filter(director=directeursTravail, academicyear = academicyear).count()

            # Prepare the quota data
            quota_data = {
                'max_tutore_projects_interne': dept_settings.max_teacher_tutore_project_group,
                'max_externe_tutore_projects': dept_settings.max_teacher_externe_tutore_project_group,
                'max_memoire_projects_interne': dept_settings.max_teacher_memoire,
                'max_externe_memoire_projects': dept_settings.max_teacher_externe_memoire,
            }

            # Prepare the used data
            used_data = {
                'used_tutore_projects_interne': used_tutore_projects_interne,
                'used_tutore_projects_externe': used_tutore_projects_externe,
                'used_memoire_projects_interne': used_memoire_projects_interne,
                'used_memoire_projects_externe': used_memoire_projects_externe
            }
            
            # Add or update department details
            if dept_id not in details:
                details[dept_id] = {
                    "department": GradeClasseSerializer(directeursTravail.department).data,
                    "quota": quota_data,
                    "used": used_data,
                    "directeurs": []
                }
            
            # Always update the used counts and add the director
            details[dept_id]["used"] = {
                key: max(details[dept_id]["used"].get(key, 0), used_data[key])
                for key in used_data
            }
            details[dept_id]["directeurs"].append(DirecteurTravauxSerializer(directeursTravail).data)
        
        return Response(list(details.values()), status=200)


from django.http import HttpResponse
from openpyxl import Workbook
from io import BytesIO

class ProjetTutoreSubmissionViewSet(viewsets.ModelViewSet):
    queryset = ProjetTutoreSubmission.objects.all().order_by('-submission_date')
    serializer_class = ProjetTutoreSubmissionDetailSerializer
    pagination_class = Paginator
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = [
        "final_subject", 
        "projet__subject", 
        "submitter__user__name", 
        "submitter__user__first_name", 
        "submitter__user__last_name"
    ]

    def get_queryset(self):
        user = self.request.user
        academicyear = get_academic_year(user)
        queryset = super().get_queryset().filter(academicyear = academicyear)

        if user.is_superuser:
            return queryset

        if user.has_perm('isp_stage.isp_departement_officier'):
            dept_officier = DeptRechercheOfficier.objects.filter(employee__user=user).first()
            if dept_officier:
                return queryset.filter(projet__head__promotion__grade=dept_officier.dept)
            else:
                return ProjetTutoreSubmission.objects.none()

        student = Student.objects.filter(user=user, academicyear = academicyear).first()
        if student:
            return queryset.filter(members=student)

        return ProjetTutoreSubmission.objects.none()

    @action(detail=False, methods=['get'], url_path='export-excel')
    def export_excel(self, request):
        academicyear = get_academic_year(request.user)
        queryset = self.get_queryset().filter(academicyear = academicyear)
        
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = "Projets Tutorés Soumis"

        # Ajout de la colonne Date
        headers = ["N°", "Noms et Post-nom", "Sujet", "Directeur", "Lecteur 1", "Lecteur 2", "Date"]
        sheet.append(headers)

        projets = defaultdict(list)
        for submission in queryset:
            projets[submission.projet.id].append(submission)

        row_index = 2  # première ligne après l'entête
        group_number = 1

        for projet_id, submissions in projets.items():
            submission = submissions[0]

            sujet = submission.final_subject
            directeur = submission.projet.director.employee.fullname if submission.projet.director else "N/A"
            date_creation = submission.created_at.strftime("%d/%m/%Y %H:%M")  # Format lisible

            membres = []
            membres += [f"{m.user.name} {m.user.last_name}" for m in submission.members.all()]

            start_row = row_index
            for membre in membres:
                sheet.append([group_number, membre, sujet, directeur, "", "", date_creation])
                row_index += 1

            end_row = row_index - 1

            # Fusionner cellules (sauf Date, car spécifique à chaque submission si besoin)
            if start_row < end_row:
                sheet.merge_cells(start_row=start_row, start_column=1, end_row=end_row, end_column=1)  # N° Groupe
                sheet.merge_cells(start_row=start_row, start_column=3, end_row=end_row, end_column=3)  # Sujet
                sheet.merge_cells(start_row=start_row, start_column=4, end_row=end_row, end_column=4)  # Directeur
                sheet.merge_cells(start_row=start_row, start_column=5, end_row=end_row, end_column=5)  # Lecteur 1
                sheet.merge_cells(start_row=start_row, start_column=6, end_row=end_row, end_column=6)  # Lecteur 2
                sheet.merge_cells(start_row=start_row, start_column=7, end_row=end_row, end_column=7)  # Date

            group_number += 1

        # Génération du fichier Excel
        virtual_workbook = BytesIO()
        workbook.save(virtual_workbook)
        virtual_workbook.seek(0)

        response = HttpResponse(
            virtual_workbook.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="projets-soumis.xlsx"'
        
        return response


class StudentMemoireSubmissionViewSet(viewsets.ModelViewSet):
    queryset = StudentMemoireSubmission.objects.all().order_by('-submission_date')
    serializer_class = StudentMemoireSubmissionDetailSerializer
    pagination_class = Paginator
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = [
        "final_subject", 
        "memoire__subject", 
        "submitter__user__name", 
        "submitter__user__first_name", 
        "submitter__user__last_name"
    ]

    def get_queryset(self):
        user = self.request.user
        academicyear = get_academic_year(user)
        queryset = super().get_queryset().filter(academicyear = academicyear)

        if user.is_superuser:
            return queryset

        if user.has_perm('isp_stage.isp_departement_officier'):
            dept_officier = DeptRechercheOfficier.objects.filter(employee__user=user).first()
            if dept_officier:
                return queryset.filter(memoire__student__promotion__grade=dept_officier.dept)
            else:
                return StudentMemoireSubmission.objects.none()

        student = Student.objects.filter(user=user, academicyear = academicyear).first()
        if student:
            return queryset.filter(submitter=student)

        return StudentMemoireSubmission.objects.none()

    @action(detail=False, methods=['get'], url_path='export-excel')
    def export_excel(self, request):
        academicyear = get_academic_year(request.user)
        queryset = self.get_queryset().filter(academicyear = academicyear)

        workbook = Workbook()
        sheet = workbook.active
        sheet.title = "Mémoires Soumis"

        headers = ["N°", "Noms et Post-nom", "Sujet", "Directeur", "Lecteur 1", "Lecteur 2", "Date"]
        sheet.append(headers)

        row_index = 2
        for index, submission in enumerate(queryset, start=1):
            student_name = f"{submission.memoire.student.user.name} {submission.memoire.student.user.last_name}"
            sujet = submission.final_subject
            directeur = submission.memoire.director.employee.fullname if submission.memoire.director else "N/A"
            date_creation = submission.created_at.strftime("%d/%m/%Y %H:%M")  # Format lisible
            
            sheet.append([index, student_name, sujet, directeur, "", "", date_creation])
            row_index += 1

        virtual_workbook = BytesIO()
        workbook.save(virtual_workbook)
        virtual_workbook.seek(0)

        response = HttpResponse(
            virtual_workbook.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="memoires-soumis.xlsx"'
        
        return response



class IspConfigViewSet(viewsets.ModelViewSet):
    queryset = IspConfig.objects.all()
    serializer_class = IspConfigSerializer
    pagination_class = Paginator
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = [
        "config_key", 
        "config_value"
    ]

    @action(detail=False, methods=['get'], url_path='config-dict')
    def get_config_dict(self, request):
        return Response([
            {"key": "current_academic_year", "description": "Année académique actuelle"},
            {"key": "#userId_001", "description": "User selected academic year"}
        ])

    @action(detail=False, methods=['get'], url_path='get-default-academic-year')
    def get_default_academic_year(self, request):
        selected_academic_year = UserSelectedAcademicYear.objects.filter(id="default_academic_year").first()
        if selected_academic_year :
            return Response(
                {
                    "config_key": "default_001",
                    "config_value": selected_academic_year.academic_year.id,
                    "id": selected_academic_year.academic_year.id,
                    "name": selected_academic_year.academic_year.name
                },
                status=status.HTTP_200_OK
            )
        else :
            return Response(
                {
                    "config_key": "default_001",
                    "config_value": None
                },
                status=status.HTTP_200_OK
            )

    @action(detail=False, methods=['post'], url_path='set-default-academic-year')
    def set_default_academic_year(self, request):
        user = request.user
        academic_year = request.data.get('academic_year')
        
        try:
            academic_year = uuid.UUID(academic_year)
        except ValueError:
            return Response(
                {"detail": "academic_year doit être un UUID valide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        academic_year = AcademicYear.objects.filter(id=academic_year).first()
        if not academic_year:
            return Response(
                {"detail": "Année académique introuvable"},
                status=status.HTTP_404_NOT_FOUND
            )
        selected_academic_year = UserSelectedAcademicYear.objects.filter(id="default_academic_year").first()
        if selected_academic_year:
            selected_academic_year.academic_year = academic_year
            selected_academic_year.save()
            return Response(
                {
                    "config_key": "default_001",
                    "config_value": academic_year.id,
                    "created": False
                },
                status=status.HTTP_200_OK
            )
        else:
            selected_academic_year = UserSelectedAcademicYear.objects.create(id="default_academic_year", academic_year=academic_year)
            return Response(
                {
                    "config_key": "default_001",
                    "config_value": academic_year.id,
                    "created": True
                },
                status=status.HTTP_201_CREATED
            )
        
    
    @action(
        detail=False,
        methods=['get'],
        url_path=r'user-config/(?P<config_key>[^/.]+)'
    )
    def get_user_config(self, request, config_key=None):
        user = request.user

        full_key = f"{user.id}_{config_key}"

        config = IspConfig.objects.filter(config_key=full_key).first()

        if config_key == "001":
            user_selected_academic_year = UserSelectedAcademicYear.objects.filter(user=user).first()
            if user_selected_academic_year:
                return Response({
                    "config_key": config_key,
                    "config_value": user_selected_academic_year.academic_year.id,
                    "id": user_selected_academic_year.academic_year.id,
                    "name" : user_selected_academic_year.academic_year.name
                })
            else:
                default_academic_year = UserSelectedAcademicYear.objects.filter(id="default_academic_year").first()
                if default_academic_year :
                    UserSelectedAcademicYear.objects.create(
                        id = f'{user.id}_001',
                        user = user,
                        academic_year = default_academic_year.academic_year
                    )
                    return Response({
                        "config_key": config_key,
                        "config_value": default_academic_year.academic_year.id,
                        "id": user_selected_academic_year.academic_year.id,
                        "name" : user_selected_academic_year.academic_year.name
                    })
                else:
                    return Response({
                        "config_key": config_key,
                        "config_value": None,
                        "id": user_selected_academic_year.academic_year.id,
                        "name" : user_selected_academic_year.academic_year.name
                    }) 

        if not config:
            return Response(
                {"detail": "Configuration introuvable"},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            "config_key": config.config_key,
            "config_value": config.config_value
        })

    @action(
        detail=False,
        methods=['post'],
        url_path=r'set-user-config/(?P<config_key>[^/.]+)'
    )
    def set_user_config(self, request, config_key=None):
        user = request.user
        value = request.data.get('config_value')

        if config_key == "001":
            try:
                value = uuid.UUID(value)
            except ValueError:
                return Response(
                    {"detail": "config_value doit être un UUID valide"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            academic_year = AcademicYear.objects.filter(id=value).first()
            if not academic_year:
                return Response(
                    {"detail": "Année académique introuvable"},
                    status=status.HTTP_404_NOT_FOUND
                )
            user_selected_academic_year = UserSelectedAcademicYear.objects.filter(user=user).first()
            if user_selected_academic_year:
                user_selected_academic_year.academic_year = academic_year
                user_selected_academic_year.save()
                return Response(
                    {
                        "config_key": config_key,
                        "config_value": academic_year.id,
                        "name": academic_year.name, 
                        "created": False
                    },
                    status=status.HTTP_200_OK
                )
            else:
                user_selected_academic_year = UserSelectedAcademicYear.objects.create(user=user, config_key=config_key, academic_year=academic_year)
                return Response(
                    {
                        "config_key": config_key,
                        "config_value": academic_year.id,
                        "name": academic_year.name, 
                        "created": True
                    },
                    status=status.HTTP_201_CREATED
                )

        else :

            if value is None:
                return Response(
                    {"detail": "config_value est requis"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            full_key = f"{user.id}_{config_key}"

            config, created = IspConfig.objects.update_or_create(
                config_key=full_key,
                config_value=value
            )

            return Response(
                {
                    "config_key": config_key,
                    "config_value": value,
                    "created": created
                },
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
            )
    

class IspPaiementViewSet(viewsets.ModelViewSet):
    queryset = IspPaiement.objects.all()
    serializer_class = IspPaiementSerializer
    pagination_class = Paginator

    filter_backends = [filters.SearchFilter, DjangoFilterBackend]

    search_fields = [
        "student__matricule",
        "student__nom",
        "student__postnom",
        "student__prenom",
    ]

    filterset_fields = [
        "datepai",
        "student__codpromo",
        "student__vacation",
    ]

    def get_queryset(self):
        user = self.request.user

        queryset = IspPaiement.objects.all().select_related("student")


        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Calcul de la somme totale avant pagination
        total_sum = queryset.aggregate(total=Sum("montant"))["total"] or 0

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "total_sum": total_sum,
                "results": serializer.data
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "total_sum": total_sum,
            "results": serializer.data
        })