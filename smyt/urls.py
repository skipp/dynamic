from django.conf.urls import patterns, include, url

from django.contrib import admin
import dynmod

admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'smyt.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^upload_file/', 'dynmod.views.upload_file', name='upload_file'),
    url(r'', 'dynmod.views.upload_file', name='upload_file'),
)
