__author__ = 'rahul'

import unittest
import test_login
import test_logout
import os
import HTMLTestRunner
import sys

direct = os.getcwd()

class MyTestSuite(unittest.TestCase):

    def test_Issue(self):

        smoke_test = unittest.TestSuite()
        smoke_test.addTests([
            unittest.defaultTestLoader.loadTestsFromTestCase(test_login.TestLogin),
            unittest.defaultTestLoader.loadTestsFromTestCase(test_logout.TestLogout),
        ])

        fp = file('my_report.html', 'wb')
        runner = HTMLTestRunner.HTMLTestRunner(
                    stream=fp,
                    title='My unit test',
                    description='This demonstrates the report output by HTMLTestRunner.'
                    )

        runner.run(smoke_test)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        os.environ["PASSWORD"] = sys.argv.pop()
        os.environ["USERNAME"] = sys.argv.pop()
        os.environ["URL"] = sys.argv.pop()
    else:
        os.environ["PASSWORD"] = "admin"
        os.environ["USERNAME"] = "admin"
        os.environ["URL"] = "https://dev.observatorioderelaves.cl/mineras"
    unittest.main()
