
import os
import sys
import time

sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from common_test_helpers import sqlite_connect, last_email, template
from common_test_helpers import delete_db as clear_database
from common_test_helpers import remove_user as remove_user_helper

# Customisable import. Deliberately not present by default
import local

def get_browser():
    '''
    Returns a webdriver instance already pointing at the nemesis main page.
    This wrapper just asserts that this is the case.
    '''
    browser = local.get_browser()
    browser.get(local.root_url)
    assert 'Userman' in browser.title
    return browser

def end_browser():
    '''
    Quits the started browser, plus any related tidyup.
    '''
    local.end_browser()

def registration_count():
    conn = sqlite_connect()
    cur  = conn.cursor()
    return cur.execute("SELECT COUNT(*) FROM registrations").next()[0]

def remove_user(username):
    remove_user_helper(username)()

def wait_while(predicate, max = 5):
    end = time.time() + max
    while predicate():
        time.sleep(0.1)
        if time.time() > end:
            break
