class ETLError(Exception):

    def __init__(self, detail):
        super().__init__(detail)
        self.detail = detail
