from django.contrib import admin
from django.urls import include, path

app_name = "fms"
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('fms.urls')),
]
