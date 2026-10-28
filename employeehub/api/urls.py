

from django.urls import path
from .views import EmployeesView, EmployeeDetailsView


urlpatterns = [
    path('employees/', EmployeesView.as_view()),
    path('employees/<int:pk>/', EmployeeDetailsView.as_view()),
]
