from django.urls import path

from . import views

urlpatterns = [
    path("products/", views.products_view),
    path("products/<int:pk>/", views.product_view),
]
