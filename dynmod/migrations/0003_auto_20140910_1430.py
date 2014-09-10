# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dynmod', '0002_rows_table_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rows',
            name='type',
            field=models.CharField(max_length=255),
        ),
    ]
