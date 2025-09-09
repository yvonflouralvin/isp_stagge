from django.urls import path, include
from . import views
from .views_set import *
from rest_framework.routers import DefaultRouter

# DeptRechercheOfficierPromotionsViewSet

router = DefaultRouter()  

router.register(r'dept-recherche-officier', DeptRechercheOfficierViewSet) 
router.register(r'students', DeptRechercheOfficierStudentListsViewSet) 
router.register(r'promotions', IspGombePromotionViewSet) 

router.register(r'stage', StageViewSet)
router.register(r'stage-master', StageMasterViewSet)
router.register(r'projets-tutores', ProjetTutoreViewSet)
router.register(r'students-memoires', StudentMemoireViewSet)
router.register(r'department-settings', DepartmentSettingsViewSet)
router.register(r'teacher-for-memoire-projet', StageSearchingTeacherViewSet)
router.register(r'directeur-travaux', DirecteurTravauxViewSet)

urlpatterns = [
    path('',include(router.urls)),
    path('promotions-l2', PromotionL2.as_view(), name="promotions-l2"),
    path('promotions-l3', PromotionL3.as_view(), name="promotions-l3"),
    path('student', StudentForStageAPIView.as_view(), name="student"),
    path('student/<stage>', StudentForStageAPIView.as_view(), name="student-stage"), 
    path('resumes', views.stages_resumes, name="staff-resumes"),
    path('admin-resumes', views.admin_reports, name='admin-resumes'),
    path('department-resumes-for-director/<employee>', views.department_resumes_for_director, name='department-resumes-for-director'),
    path('projets-tutores/<uuid:projet_id>/submit/', views.submit_projet_tutore, name='submit_projet_tutore'),
]
