
try:
    import httplib
    import urllib
except ImportError:
    import http.client
    httplib = http.client
    import urllib.parse
    urllib = urllib.parse

import base64
import sys
import os

sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from common_test_helpers import apache_mode, delete_db, get_registrations, \
                                assert_no_emails, last_email, last_n_emails, \
                                remove_user, root, \
                                assert_load_template, template

def make_connection():
    if not apache_mode():
        return httplib.HTTPConnection("127.0.0.1",5000)
    else:
        return httplib.HTTPSConnection("localhost")

def modify_endpoint(endpoint):
    return "/userman" + endpoint if apache_mode() else endpoint

def unicode_encode(params_hash):
    for key in params_hash:
        params_hash[key] = params_hash[key].encode("utf-8")

def server_request(method, endpoint, params=None, headers=None):
    headers = headers or {}
    conn = make_connection()
    endpoint = modify_endpoint(endpoint)
    if params != None:
        if "username" in params and "password" in params:
            credential = '%s:%s' % (params["username"], params["password"])
            base64bytes = base64.b64encode(credential.encode('utf-8'))
            headers["Authorization"] = "Basic %s" % base64bytes.decode('utf-8')
            del params["username"]
            del params["password"]
        unicode_encode(params)
        url_params = urllib.urlencode(params)
        conn.request(method, endpoint, url_params, headers)
    else:
        conn.request(method, endpoint)

    resp = conn.getresponse()
    data = resp.read()
    return resp, data.decode('utf-8')

def server_post(endpoint, params=None):
    headers = {"Content-type": "application/x-www-form-urlencoded",
                "Accept": "text/plain"}
    return server_request('POST', endpoint, params, headers)

def server_get(endpoint, params=None):
    return server_request('GET', endpoint, params)
