from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import ProductSerializer
from product.models import Product


@api_view(['GET', 'POST'])
def products_view(request):
    if request.method == 'GET':
        query = """
            SELECT *, SUBSTR(CASE WHEN type = 'Warm' THEN meat ELSE type END, 1, 1) || RANK() OVER (
                PARTITION BY CASE WHEN type = 'Warm' THEN meat ELSE type END
                ORDER BY price DESC
            ) AS dynamic_id
            FROM product_product
            ORDER BY
                CASE WHEN type = 'Warm' THEN 0
                    WHEN type = 'Frozen' THEN 1
                    WHEN type = 'Ingredient' THEN 2
                    ELSE 3 END,
                CASE WHEN meat = 'Duck' THEN 0
                    WHEN meat = 'Chicken' THEN 1
                    WHEN meat = 'Pork' THEN 2
                    WHEN meat = 'Egg' THEN 3
                    WHEN meat = 'Meatless' THEN 4
                    ELSE 5 END;
        """
        products = Product.objects.all()
        products.aggregate()
        print(products)
        products = Product.objects.raw(query)
        print(products)
        serializer = ProductSerializer(products, many=True)

        return Response(serializer.data)

    if request.method == 'POST':
        serializer = ProductSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH'])
def product_view(request, pk):
    try:
        product = Product.objects.get(id=pk)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProductSerializer(product, many=False)

        return Response(serializer.data)

    if request.method == 'PATCH':
        serializer = ProductSerializer(product, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
