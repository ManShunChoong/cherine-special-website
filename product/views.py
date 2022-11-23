import decimal
import json

from django.shortcuts import render

from .models import Product


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return json.JSONEncoder.default(self, obj)


def product_view(request):
    include_fields = ["dynamic_id", "combined_name", "combined_full_name"]
    exclude_fields = ["name", "chinese_name", "full_name", "chinese_full_name"]
    fields = include_fields + [
        field
        for field in Product.get_field_names()
        if field not in exclude_fields
    ]

    important_fields = ["dynamic_id", "combined_name", "price"]

    numeric_fields = Product.get_field_names(numeric_only=True)

    products = {
        product.id: {
            field: getattr(product, field) for field in fields
        }
        for product in Product.objects.all()
    }

    context = {
        "title": "Products",
        "fields": fields,
        "important_fields": important_fields,
        "numeric_fields": numeric_fields,
        "products": products,
        "products_json": json.dumps(products, cls=DecimalEncoder),
    }

    # TODO: Hover and select cell (highlight whole row and column)
    # TODO: Different column scrollbar
    # TODO: Search and filter
    # https://www.mockplus.com/blog/post/table-ui-design-examples

    return render(request, 'table.html', context)
