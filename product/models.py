from django.db import models


class Product(models.Model):
    # Type choices
    WARM = 'Warm'
    FROZEN = 'Frozen'
    INGREDIENT = 'Ingredient'

    # Meat choices
    DUCK = 'Duck'
    CHICKEN = 'Chicken'
    PORK = 'Pork'
    EGG = 'Egg'
    MEATLESS = 'Meatless'

    name = models.CharField(max_length=255)
    chinese_name = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255, blank=True)
    chinese_full_name = models.CharField(max_length=255, blank=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    type_choices = (
        (WARM, 'Warm'),
        (FROZEN, 'Frozen'),
        (INGREDIENT, 'Ingredient'),
    )
    type = models.CharField(max_length=10, choices=type_choices, blank=True)
    meat_choices = (
        (DUCK, 'Duck'),
        (CHICKEN, 'Chicken'),
        (PORK, 'Pork'),
        (EGG, 'Egg'),
        (MEATLESS, 'Meatless'),
    )
    meat = models.CharField(max_length=8, choices=meat_choices, blank=True)

    @property
    def dynamic_id(self):
        return ""

    @staticmethod
    def get_field_names(numeric_only=False, include_id=False):
        return [
            field.name
            for field in Product._meta.get_fields()
            if (not numeric_only or field.get_internal_type() == 'DecimalField')
            and (field.name != 'id' or include_id)
        ]
