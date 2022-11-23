from django.db.models import fields
from rest_framework.serializers import ModelSerializer, ReadOnlyField

from product.models import Product


class ProductSerializer(ModelSerializer):
    dynamic_id = ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            'id',
            'name',
            'chinese_name',
            'full_name',
            'chinese_full_name',
            'price',
            'type',
            'meat',
            'dynamic_id',
        )
        read_only_fields = ('id', 'dynamic_id')
