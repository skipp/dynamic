from django.db import models


class Table(models.Model):
    table_name = models.CharField(max_length=255)
    title = models.CharField(max_length=255)

    def __unicode__(self):
        return self.title + ' (' + self.table_name + ')'


class Row(models.Model):
    table_name = models.CharField(max_length=255)
    row_name = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=255)

    def __unicode__(self):
        return self.title + ' (' + self.table_name + '.' + self.row_name + '), type: ' + self.type
