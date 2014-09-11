from django.conf.urls import patterns, include, url

from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'dynmod.views.home', name='home'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^upload_file/', 'dynmod.views.upload_file', name='upload_file'),
    url(r'^static/(?P<path>.*)$', 'django.views.static.serve'),
    url(r'^get/(?P<table>.*)/$', 'dynmod.views.get_table'),
    url(r'^create/(?P<table_name>.*)/$', 'dynmod.views.create'),
)
