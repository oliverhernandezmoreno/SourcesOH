from rest_framework.pagination import PageNumberPagination as RestFrameworkPagination


class PageNumberPagination(RestFrameworkPagination):

    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 1000
