from unittest import case
import MySQLdb
from django.http.response import HttpResponse

from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt
from .forms import UploadFileForm
import yaml
from south.db import db
from django.db.models.fields import CharField, IntegerField, DateField, AutoField
import time

from dynmod.models import Row, Table
import simplejson
from django.db import connections


def create_new_model(fields, title, name):
    create_table(fields, name, title)


def create_table(fields, table_name, title):
    table_name += str(int(time.time()))
    dynfields = [('id', AutoField(primary_key=True))]
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


def home(request):
    tables = Table.objects.all()
    return render_to_response('home.html', {'tables': tables})


def get_table(request, table):
    table_name = request.GET.get('table_name', None)

    rows = Row.objects.filter(table_name=table_name)
    # data = serializers.serialize('json', header)
    header = []
    header_dates = []
    for row in rows:
        header.append({'id': row.id, 'row_name': row.row_name, 'type': row.type, 'title': row.title})
        if row.type == 'date':
            header_dates.append(row.row_name)

    cursor = connections['default'].cursor()
    cursor.execute("SELECT * FROM " + table_name)

    rows = dictfetchall(cursor)

    for row in rows:
        for head in header_dates:
            row[head] = str(row[head])

    response_data = simplejson.OrderedDict([
        ('table_name', table_name),
        ('header', header),
        ('data', rows),
    ])
    return HttpResponse(simplejson.dumps(response_data), content_type="application/json")


def upload_file(request):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            yml = handle_uploaded_file(request.FILES['file'])
            make_models(yml)
            return HttpResponseRedirect('/')
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


def dictfetchall(cursor):
    """Returns all rows from a cursor as a dict"""
    desc = cursor.description
    return [
        dict(zip([col[0] for col in desc], row))
        for row in cursor.fetchall()
    ]


def create(request, table_name):
    params = request.GET
    names = []
    values = []
    for name in params:
        names.append(name)
        values.append("'" + params.get(name) + "'")

    cursor = connections['default'].cursor()
    cursor.execute("INSERT INTO " + table_name + " (" + ", ".join(names) + ") VALUES (" + ", ".join(values) + ")")

    response_data = simplejson.OrderedDict([
        ('table_name', table_name),
        ('params', params),
    ])
    return HttpResponse(simplejson.dumps(response_data), content_type="application/json")


@csrf_exempt
def post_row(request):
    params = dict(request.POST)
    row_id = params.get('id')[0]
    table_name = params.get('table_name')[0]
    del params['table_name']
    del params['id']

    values = []
    for param in params:
        values.append(param + "='" + params[param][0] + "'")
    value_string = ", ".join(values)

    cursor = connections['default'].cursor()
    cursor.execute("UPDATE " + table_name + " SET " + value_string + " WHERE id = " + row_id)

    response_data = simplejson.OrderedDict([
        ('table_name', table_name),
        ('id', row_id),
        ('params', params),
    ])
    return HttpResponse(simplejson.dumps(response_data), content_type="application/json")


@csrf_exempt
def delete_row(request):
    row_id = request.POST.get('id')
    table_name = request.POST.get('table_name')

    cursor = connections['default'].cursor()
    cursor.execute("DELETE FROM " + table_name + " WHERE id = " + row_id)

    response_data = simplejson.OrderedDict([
        ('table_name', table_name),
        ('id', row_id),
    ])
    return HttpResponse(simplejson.dumps(response_data), content_type="application/json")
