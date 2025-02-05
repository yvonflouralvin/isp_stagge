from django.shortcuts import render , get_object_or_404
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import JsonResponse 
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes

from rest_framework.permissions import IsAuthenticated
from .models import * 
from .serializers import *

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stages_resumes(request):
    stages = Stage.objects.all().exclude(student = None).exclude(student__user = None)
    
    user: User = request.user
    if user == None :
        return Response({
            "students": 0,
            "impregnations": 0 ,
            "pedagogiques": 0,
            "affected": 0,
            "error":"No user exist"
        })
    # print(user.pemissions)
    if user.is_superuser : 
        stages = Stage.objects.all().exclude(student = None).exclude(student__user = None)
    elif not user.is_superuser and user.has_perm('isp_stage.isp_departement_officier'):
        dept_off = DeptRechercheOfficier.objects.filter(user__id=user.id)
        if dept_off.exists() :
            stages = Stage.objects.filter(student__promotion__grade__id=dept_off[0].dept.id)
    elif not user.is_superuser and not user.has_perm('isp_stage.isp_departement_officier') and user.has_perm('isp_stage.isp_user_stage_master'):
        stages = Stage.objects.filter(stagemaster__user__id = user.id)
    else :
        return Response({
            "students": 0,
            "impregnations": 0 ,
            "pedagogiques": 0,
            "affected": 0,
            "error":"We occure some error here"
        })

    return Response({
        "students": len(stages),
        "impregnations": len(stages.filter(stage="impregnation")) ,
        "pedagogiques": len(stages.filter(stage="pedagogique")),
        "affected": len(stages.exclude(stagemaster=None))
    })