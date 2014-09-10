# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dynmod', '0003_auto_20140910_1430'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Rows',
            new_name='Row',
        ),
        migrations.RenameModel(
            old_name='Tables',
            new_name='Table',
        ),
    ]
