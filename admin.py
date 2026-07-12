from django.contrib import admin

from .models import MemoireDepot


@admin.register(MemoireDepot)
class MemoireDepotAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'phone', 'section', 'department', 'status', 'created_at')
    list_filter = ('status', 'section', 'department')
    search_fields = ('full_name', 'phone', 'subject')
    readonly_fields = ('created_at', 'updated_at')
