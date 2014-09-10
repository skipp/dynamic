from unittest import case
import MySQLdb
from django.shortcuts import render

from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from .forms import UploadFileForm
import yaml
from south.db import db
from django.db.models.fields import CharField, IntegerField, DateField
import time

from dynmod.models import Row, Table


def create_new_model(fields, title, name):
    # print(len(fields), title)
    create_table(fields, name, title)


def create_table(fields, table_name, title):
    # model_class = generate_my_model_class()
    # fields = [(f.name, f) for f in ['a', 'b']]

    table_name += str(int(time.time()))
    dynfields = []
    type = None
    for field in fields:
        if field['type'] == 'char':
            type = CharField(max_length=255)
        elif field['type'] == 'date':
            type = DateField()
        elif field['type'] == 'int':
            type = IntegerField()

        name = field['id']
        dynfields.append((name, type))
        r = Row(row_name=name, title=field['title'], type=field['type'], table_name=table_name)
        r.save()

    dynfields = tuple(dynfields)

    try:
        db.create_table(table_name, dynfields)
        r = Table(title=title, table_name=table_name)
        r.save()

    except MySQLdb.OperationalError as e:
        print e.message
    except Exception as e:
        print e.message


def make_models(yml):
    for name in yml:
        model = yml[name]
        create_new_model(model['fields'], model['title'], name)


def upload_file(request):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            yml = handle_uploaded_file(request.FILES['file'])
            make_models(yml)
            # return render_to_response('uploaded.html', {'result': yml})
            return HttpResponseRedirect('/admin/')
    else:
        form = UploadFileForm()

    return render_to_response(
        'upload.html',
        {'form': form},
        context_instance=RequestContext(request)
    )


def handle_uploaded_file(f):
    try:
        return yaml.load(f)
    except yaml.ScannerError:
        return 'ScannerError'
