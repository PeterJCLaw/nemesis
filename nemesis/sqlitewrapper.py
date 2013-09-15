
import helpers

class UsernameKeyedSqliteThing(object):

    _db_props = []

    def __init__(self, username, connector):
        self._username = username
        self._connector = connector or helpers.sqlite_connect
        self._conn = None
        self._props = {}
        self._in_db = False
        self._load()

    def __getattr__(self, name):
        if name not in self._db_props:
            raise AttributeError("No property '%s'" % (name))

        return self._props.get(name, None)

    def __setattr__(self, name, value):
        if name in self._db_props:
            self._props[name] = value
        else:
            self.__dict__[name] = value

    def _get_connection(self):
        if self._conn is None:
            self._conn = self._connector()
        return self._conn

    def _exec(self, statement, arguments):
        conn = self._get_connection()
        cur = conn.cursor()
        cur.execute(statement, arguments)
        conn.commit()

    def _fetchone(self, statement, arguments):
        conn = self._get_connection()
        cur = conn.cursor()
        cur.execute(statement, arguments)
        return cur.fetchone()

    def _load(self):
        statement = 'SELECT ' + ', '.join(self._db_props) + ' FROM ' + self._db_table + ' WHERE username=?'
        row = self._fetchone(statement, (self._username,))
        if not row is None:
            for i in xrange(len(self._db_props)):
                self._props[self._db_props[i]] = row[i]
            self._in_db = True

    def _missing_props(self):
        return [name for name in self._db_props if not self._props.has_key(name)]

    @property
    def username(self):
        return self._username

    @property
    def in_db(self):
        return self._in_db

    def save(self):
        missing = self._missing_props()
        if len(missing) > 0:
            missing_str = ', '.join(missing)
            raise Exception( "Cannot save user '%s' - missing settings: '%s'." % (self.username, missing_str) )

        if self.in_db:
            prep_statement = "UPDATE " + self._db_table + " SET " + '=?, '.join(self._db_props) + "=? WHERE username=?"
            self._exec(prep_statement, [self._props[x] for x in self._db_props] + [self.username])
        else:
            prep_statement = "INSERT INTO " + self._db_table + " (username, " + \
                             ', '.join(self._db_props) + ") VALUES (?" + \
                             ',?' * len(self._db_props) + ")"
            self._exec(prep_statement, [self.username] + [self._props[x] for x in self._db_props])
            self._in_db = True

class PendingUser(UsernameKeyedSqliteThing):
    _db_table = 'registrations'
    _db_props = ['teacher_username', 'college', 'team', 'email', 'verify_code']

    def __init__(self, username, connector = None):
        super(PendingUser, self).__init__(username, connector)