from django.contrib import admin

# Register your models here.

from dynmod.models import Table, Row


class TableAdmin(admin.ModelAdmin):
    pass


class RowAdmin(admin.ModelAdmin):
    pass


admin.site.register(Table, TableAdmin)
admin.site.register(Row, RowAdmin)
