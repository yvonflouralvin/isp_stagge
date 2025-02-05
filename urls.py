from django.urls import path, include
from . import views
from .views_set import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter() 
router.register(r'dept-recherche-officier', DeptRechercheOfficierViewSet)
router.register(r'stage', StageViewSet)
router.register(r'stage-master', StageMasterViewSet)



urlpatterns = [
    path('',include(router.urls)),
    path('promotions-l2', PromotionL2.as_view(), name="promotions-l2"),
    path('promotions-l3', PromotionL3.as_view(), name="promotions-l3"),
    path('student', StudentForStageAPIView.as_view(), name="student"),
    path('student/<stage>', StudentForStageAPIView.as_view(), name="student-stage"), 
    path('resumes', views.stages_resumes, name="staff-resumes")
    # path('stage/get-by-user-id/', )
]
