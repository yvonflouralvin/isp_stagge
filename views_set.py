from .models import *
from uscitech_academy.models import *
from .serializers import *
from uscitech_academy.serializers import *
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework import filters
from django.db.models import Q

from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import  Permission
from core.models import User

from django.db.models import Q

from core.utils import Paginator
from uscitech_academy.models import Student, GradeClasse
from uscitech_academy.serializers import GradeClasseSerializer


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
    filter_backends = (filters.SearchFilter,)  # Ajout du filtre de recherche
    search_fields = ['user__username', 'user__name', 'user__last_name', 'user__first_name', 'user__email']  # Champs recherchables

    def create(self, request):
 

        if User.objects.filter(username = request.data.get("phone")).exists():
            return Response({"message":"Numéro de téléphone déjà utilisés"}, status=400)

        user = User()
        user.username = request.data.get("phone")
        user.name = request.data.get("name")
        user.last_name = request.data.get("last_name")
        user.first_name = request.data.get("first_name")
        user.email = request.data.get("email")
        user.password = make_password(request.data.get("phone"))
        user.phone = request.data.get('phone')

        user.save()

        permission = Permission.objects.get(codename="isp_user_stage_master")
        user.user_permissions.add(permission)
        user.save()

        stg_master = StageMaster()
        stg_master.user = user
        # stg_master.dept = dept_off[0].dept
        stg_master.save()

        return Response(StageMasterSerializer(stg_master).data)

    def list(self, request, *args, **kwargs):
        user: User = request.user
        queryset = self.filter_queryset(self.get_queryset())

        # Recherche appliquée grâce au `SearchFilter`
        search_query = request.GET.get('search', None)  # Récupère le paramètre de recherche si présent
        if search_query:
            queryset = queryset.filter(
                Q(user__username__icontains=search_query) | 
                Q(user__last_name__icontains=search_query) |
                Q(user__first_name__icontains=search_query) |
                Q(user__name__icontains=search_query) |
                Q(user__email__icontains=search_query) |
                Q(user__phone__icontains=search_query)
            )  # Exemple de recherche sur le username
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, url_path='student-depts')
    def get_my_students_dept(self, request):

        user: User = request.user
        stage = request.GET.get("stage")
        stages = Stage.objects.filter(stagemaster__user__id__in =  [user.id], stage=stage)

        grades = GradeClasse.objects.filter(id__in = [
            _stage.student.promotion.grade.id for _stage in stages
        ])

        return Response(GradeClasseSerializer(grades, many=True).data, status=200)

    @action(detail=False, url_path='submit-quotes')
    def submit_quotes(self, request):

        user: User = request.user
        stage = request.GET.get("stage")
        stages = Stage.objects.filter(stagemaster__user__id__in =  [user.id], stage=stage)

        stagemaster = StageMaster.objects.first(user__id = user.id)
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

        stagemaster = StageMaster.objects.filter(user__id = user.id)
        if stagemaster.exists() :
            return Response(StageMasterSerializer(stagemaster[0]).data)

        return Response("No stage master found !!", status=404)

class StudentForStageAPIView(APIView):

    def post(self, request):

        user = User.objects.filter(username=request.data.get("facture"))
        if user.exists():
            return Response({"message": "Le numéro de facture existe déjà."}, status=400)
        
        std = Student()
        
        std.promotion = Promotion.objects.get(id=request.data.get("promotion"))

        user = User()
        user.username = request.data.get("facture")
        user.password = make_password(str(request.data.get("name")).lower())
        #User()#.objects.create_user(username=request.data.get("phone"), password=make_password(request.data.get("phone")))
        user.phone = request.data.get("phone")
        user.first_name = request.data.get("first_name")
        user.last_name = request.data.get("last_name")
        user.name = request.data.get("name")
        user.email = "unknow" #request.data.get('email')
        user.sexe = request.data.get('sexe', 'm')

        user.save()

        permission = Permission.objects.get(codename="isp_user_student")
        user.user_permissions.add(permission)
        user.save()

        std.user = user 
        std.save()

        stg = Stage()
        stg.stage = request.data.get("stage")
        stg.student = std
        stg.facture = request.data.get("facture")
        stg.save()

        return Response({
            "student":StudentSerializer(std).data,
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
        dept_off = DeptRechercheOfficier.objects.filter(user__id=user.id)
        if (user.has_perm('isp_stage.isp_departement_officier') and not user.has_perm('isp_stage.isp_user_stage_master')) and not dept_off.exists():
            stages = None
        elif (user.has_perm('isp_stage.isp_departement_officier') and not user.has_perm('isp_stage.isp_user_stage_master')) and dept_off.exists(): 
            stages = Stage.objects.filter(student__promotion__grade__id=dept_off[0].dept.id, stage=stage)
        elif (not user.has_perm('isp_stage.isp_departement_officier') and user.has_perm('isp_stage.isp_user_stage_master')) :
            stages = Stage.objects.filter(stagemaster__user__id__in =  [user.id], stage=stage)
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


class DeptRechercheOfficierViewSet(viewsets.ModelViewSet):
    queryset = DeptRechercheOfficier.objects.all()
    serializer_class = DeptRechercheOfficierSerializer
    pagination_class = Paginator

    # isp_departement_officier

    def create(self, request):
        
        user = User.objects.filter(username=request.data.get("phone"))
        if user.exists():
            return Response({"message": "Le numéro de téléphone existe déjà."}, status=400)
        
        user = User() 
        user.password = make_password(request.data.get("phone"))
        user.username = request.data.get("phone")
        user.phone = request.data.get("phone")
        user.first_name = request.data.get("first_name")
        user.last_name = request.data.get("last_name")
        user.email = request.data.get("email")
        user.save()

        permission = Permission.objects.get(codename="isp_departement_officier")
        user.user_permissions.add(permission)
        user.save()

        dept_recherche_officier = DeptRechercheOfficier()
        dept_recherche_officier.user = user
        dept_recherche_officier.dept = GradeClasse.objects.get(id=request.data.get("dept"))
        dept_recherche_officier.save()
        
        return Response(
            { "dept_recherche_officier": DeptRechercheOfficierSerializer(dept_recherche_officier).data},
            status=201,
        )

    @action(detail=False, url_path='get_by_user_id/(?P<user_id>\d+)')
    def get_by_user_id(self, request, user_id):
        dept = DeptRechercheOfficier.objects.filter(user_id=user_id)
        if dept.exists():
            return Response(DeptRechercheOfficierSerializer(dept[0]).data)
        return Response({}, status=404)

    @action(detail=False, url_path='get_by_user')
    def get_by_user(self, request):

        dept = DeptRechercheOfficier.objects.filter(user_id=request.user.id)
        if dept.exists():
            return Response(DeptRechercheOfficierSerializer(dept[0]).data)
        return Response({}, status=404)

    @action(detail=False, url_path='student-depts')
    def get_my_students_dept(self, request):

        user: User = request.user 
        dept = DeptRechercheOfficier.objects.filter(user_id=user.id)
        if dept.exists():
            grades = GradeClasse.objects.filter(id = dept[0].dept.id)
            return Response(GradeClasseSerializer(grades, many=True).data, status=200)
        return Response({}, status=404)