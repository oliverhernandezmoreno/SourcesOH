from django.db import connection
from django.http import JsonResponse


def log_query_count(get_response):
    def middleware(request):
        response = get_response(request)
        if "queries" in request.GET:
            return JsonResponse({
                "queries": connection.queries,
                "total": len(connection.queries),
                "time": sum(float(q.get("time", "0")) for q in connection.queries),
            })
        return response

    return middleware


class GetTokenMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.META['PATH_INFO'] == '/api/token-auth/' or request.META['PATH_INFO'] == '/api/token-auth':
            if 'HTTP_COOKIE' in request.META:
                request.META['HTTP_COOKIE'] = ''
        return self.get_response(request)
