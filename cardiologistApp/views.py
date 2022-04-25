from django.shortcuts import render, redirect
from django.conf import settings
from django.template import RequestContext


# Create your views here.
def indexHandler(request):
    # Initial Load
    if request.POST == {}:
        return render(request, "home.html")


def stateHandler(request, dataString):
    return render(request, "state.html", {'dataString': dataString})
