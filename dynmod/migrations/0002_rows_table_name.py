# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('dynmod', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='rows',
            name='table_name',
            field=models.CharField(default=datetime.date(2014, 9, 10), max_length=255),
            preserve_default=False,
        ),
    ]
