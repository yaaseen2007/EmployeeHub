
from django.contrib import admin
from .models import Employee


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'emp_id',
        'emp_name',
        'designation',
        'department',
        'email',
        'status',
    )
    search_fields = ('emp_id', 'emp_name', 'email')
    list_filter = ('department', 'status')
