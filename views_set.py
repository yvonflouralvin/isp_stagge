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


class PromotionL2(APIView):
    def get(self, request):
        queryset = Promotion.objects.filter(libelle="L2 (LMD)")
        datas = PromotionSerializer(queryset, many=True)
        return Response(datas.data)

class PromotionL3(APIView):
    def get(self, request):
        queryset = Promotion.objects.filter(libelle="L3 (LMD)")
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
        queryset = Stage.objects.filter(student__user__id=user.id).first()
        if queryset:
            return Response(StageSerializer(queryset).data)
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
        stages = Stage.objects.all()
        disable_pagination = request.GET.get('disable_pagination', "0")

        if stage == "entreprise":
            # Get students with pedagogique stage but no entreprise stage
            pedagogique_students = Stage.objects.filter(stage="pedagogique").values_list('student_id', flat=True)
            entreprise_students = Stage.objects.filter(stage="entreprise").values_list('student_id', flat=True)
            missing_entreprise = set(pedagogique_students) - set(entreprise_students)

            # Create missing entreprise stages
            for student_id in missing_entreprise:
                student = Student.objects.get(id=student_id)
                stage = Stage.objects.create(
                    stage="entreprise",
                    student=student
                )
                stage.save()

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
            stages = Stage.objects.all()

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

    def get_queryset(self):
        """
        Permet de filtrer les départements :
        - Si `parent_department_id` est fourni, retourne les sous-départements du département donné.
        - Sinon, retourne tous les départements.
        """
        students_for = self.request.query_params.get('for', None)
        filter_promotion = self.request.query_params.get('filter_promotion', None)
        
        user = self.request.user
        if user.has_perm("isp_stage.isp_departement_officier") : 
            department_officier = DeptRechercheOfficier.objects.filter(employee__user__id = user.id)
            if not  department_officier.exists() :
                return Student.objects.none()
            
            department_officier: DeptRechercheOfficier = department_officier[0]
            queryset = Student.objects.filter(promotion__grade__id = department_officier.dept.id)
            if filter_promotion != None :
                queryset = queryset.filter(promotion__libelle = filter_promotion)
            return queryset
        
        elif user.has_perm('isp_stage.isp_user_student') or user.has_perm("uscitech_academy.academy_is_student"):
            student = Student.objects.filter(user=user)
            if not student.exists() :
                return Student.objects.none()

            student = student.first()
            
            queryset = Student.objects.filter(promotion__id=student.promotion.id)

            # Filtrage en fonction de "memoire"
            if students_for == "memoire":
                student_memoires = StudentMemoire.objects.filter(student__promotion__id=student.promotion.id)
                queryset = queryset.exclude(id__in=[student_memoire.student.id for student_memoire in student_memoires])

            # Filtrage en fonction de "projet-tutore"
            elif students_for == "projet-tutore":
                projet_tutores = ProjetTutore.objects.filter(head__promotion__id=student.promotion.id)
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
        queryset = self.get_queryset()
        return Response({
            "count": len(queryset),
            "l2as": len(queryset.filter(promotion__libelle = "L2 (AS)")),
            "l2lmd": len(queryset.filter(promotion__libelle = "L2 (LMD)")),
            "l3lmd": len(queryset.filter(promotion__libelle = "L3 (LMD)"))
        })
    
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
                        defaults={'promotion': promotion}
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
        
        student.user.set_password(make_password(os.environ.get("DEFAULT_PASS", "1234")))
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
        dept = DeptRechercheOfficier.objects.filter(employee__user__id=user.id).first()

        if not dept:
            return Response([], 404)

        # Récupérer les étudiants ayant un mémoire mais sans directeur
        memoires_sans_directeur = StudentMemoire.objects.filter(
            student__promotion__grade=dept.dept, director__isnull=False
        )
        
        students_a_exclure = memoires_sans_directeur.values_list('student_id', flat=True)
        
        # Récupérer tous les étudiants de L2 (AS) qui n'ont pas de mémoire ou un mémoire sans directeur
        students = Student.objects.filter(
            promotion__grade=dept.dept, 
            promotion__libelle='L2 (AS)'
        ).exclude(id__in=students_a_exclure)

        disable_pagination = request.GET.get('disable_pagination', '0')

        if disable_pagination == '0':
            paginator = self.pagination_class()
            paginated_students = paginator.paginate_queryset(students, request)
            return paginator.get_paginated_response(StudentSerializer(paginated_students, many=True).data)
        else:
            return Response(StudentSerializer(students, many=True).data)

    @action(detail=False, methods=['get'])
    def generer_excel_student_pedagogique(self, request):
        """
        Génère un fichier Excel, l'enregistre dans le répertoire de médias
        et redirige l'utilisateur vers une URL de téléchargement.
        """

        user = request.user
        dept = DeptRechercheOfficier.objects.filter(employee__user__id=user.id).first()

        if not dept:
            return Response([], 404)
        
        stages = Stage.objects.filter(stage = "pedagogique", student__promotion__grade = dept.dept)

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
        queryset = ProjetTutore.objects.all()
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
        student = Student.objects.filter(user=request.user).first()
        if not student:
            return Response({"detail": "Aucun étudiant associé à cet utilisateur."}, status=404)

        projets = ProjetTutore.objects.filter(models.Q(head=student) | models.Q(member=student)).distinct()
        if len(projets) >= 1 :
            serializer = self.get_serializer(projets[0])
            return Response(serializer.data)
        return Response({"detail": "Aucun projet associé à cet utilisateur."}, status=404)


    @action(detail=False, methods=['get'], url_path='student-without-project')
    def student_without_project(self, request):
        user = request.user
        dept = DeptRechercheOfficier.objects.filter(employee__user__id=user.id).first()
        if not dept :
            return Response([], 404)

        students_without_project = Student.objects.filter(promotion__grade=dept.dept, promotion__libelle="L3 (LMD)")

        heads_notnull = [pj.head.id for pj in ProjetTutore.objects.filter(director__isnull=False)]
        members_notnull = [member.id for pj in ProjetTutore.objects.filter(director__isnull=False) for member in pj.member.all()]

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
    
            


class StudentMemoireViewSet(viewsets.ModelViewSet):
    queryset = StudentMemoire.objects.all()
    serializer_class = StudentMemoireSerializer
    pagination_class = Paginator
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["student__user__username", "student__user__first_name", "student__user__last_name", "student__user__name", "student__user__phone", "student__user__email"]

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
        queryset = StudentMemoire.objects.all()
        # Superutilisateur voit tout
        if user.is_superuser:
            return queryset

        # Vérifier si l'utilisateur est un enseignant avec la permission spécifique
        if user.has_perm('isp_stage.isp_directeur_travaux'):
            director = DirecteurTravaux.objects.filter(employee__user=user, direction_type="memoire")
            if director.exists() :
                queryset = queryset.exclude(director = None)
                queryset = queryset.filter(director__in = director) 
            else :
                return StudentMemoire.objects.none()

        # Vérifier si l'utilisateur est un etudiant avec la permission spécifique
        if user.has_perm('isp_stage.isp_user_student') or user.has_perm("uscitech_academy.academy_is_student"):
            student = Student.objects.filter(user=user).first()
            if student:
                queryset = queryset.filter(student=student)

        # Vérifier si l'utilisateur est un responsable à la recherche avec la permission spécifique
        if user.has_perm('isp_stage.isp_departement_officier') :
            dept = DeptRechercheOfficier.objects.filter(employee__user__id = user.id)
            if not dept.exists() :
                queryset = StudentMemoire.objects.none()
            else :
                dept = dept.first()
                students = Student.objects.filter(promotion__grade=dept.dept)
                queryset = queryset.filter(student__in=students)

        # Par défaut, retour vide
        return queryset


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
        """Ajouter la permission isp_directeur_travaux à l'utilisateur lors de la création."""
        directeur_travaux = serializer.save()
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
            queryset = queryset.filter(department = student.promotion.grade)

            # Récupérer les paramètres de département pour l'étudiant
            department_settings, created = DepartmentSettings.objects.get_or_create(
                department=student.promotion.grade
            )

            useds =  [] 
            
            if direction_type == "projet-tutore":
                useds = ProjetTutore.objects.filter(director__in = queryset)
            if direction_type == "memoire":
                useds = StudentMemoire.objects.filter(director__in = queryset)
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
        # if user.has_perm('isp_stage.isp_directeur_travaux'):
        directeursTraveaux = DirecteurTravaux.objects.filter(employee__user__id = user.id)
        if directeursTraveaux.exists() : 
            return Response( DirecteurTravauxSerializer(directeursTraveaux, many=True).data )
        return Response("Aucun enregistrement de directeur de travaux trouvé pour vous ", 404)

    @action(detail=False, methods=['get'])
    def resumes(self, request):
        user = self.request.user
        
        # Fetching all associated "Directeurs de Travaux" for the current user
        directeursTraveaux = DirecteurTravaux.objects.filter(employee__user__id=user.id)
        
        if not directeursTraveaux.exists():
            return Response("Aucun enregistrement de directeur de travaux trouvé pour vous", status=404)
        
        details = {}

        # Organizing the data by department ID
        for directeursTravail in directeursTraveaux:
            dept_id = str(directeursTravail.department.id)
            
            # Fetch DepartmentSettings for the current department
            dept_settings = DepartmentSettings.objects.get_or_create(department=directeursTravail.department)[0]
            
            # Calculate used quota based on direction type and category
            used_tutore_projects_interne = 0
            used_tutore_projects_externe = 0
            used_memoire_projects_interne = 0 
            used_memoire_projects_externe = 0

            if directeursTravail.direction_type == "projet-tutore":
                if directeursTravail.category == "interne":
                    used_tutore_projects_interne = ProjetTutore.objects.filter(director=directeursTravail).count()
                else:
                    used_tutore_projects_externe = ProjetTutore.objects.filter(director=directeursTravail).count()
            
            elif directeursTravail.direction_type == "memoire":
                if directeursTravail.category == "interne":
                    used_memoire_projects_interne = StudentMemoire.objects.filter(director=directeursTravail).count()
                else:
                    used_memoire_projects_externe = StudentMemoire.objects.filter(director=directeursTravail).count()

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