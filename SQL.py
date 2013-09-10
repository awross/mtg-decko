import sys
import MySQLdb

class Sql:
    """General handler for SQL requests"""

    db = ""
    user = ""
    passwd = ""
    host = ""

    con = None
    cursor = None

    def __init__(self, db, user="root", passwd="temple29", host="localhost"):
        self.db = db
        self.user = user
        self.passwd = passwd
        self.host = host

        try:
            self.con = MySQLdb.connect(host=self.host,user=self.user,passwd=self.passwd,db=self.db)
        except MySQLdb.Error, e:
            print "Error %d: %s" % (e.args[0], e.args[1])
            sys.exit (1)

    def __del__(self):
        self.con.commit()
        self.con.close()
    
    def ex(self,sql):
        try:
            self.cursor = self.con.cursor()
            self.cursor.execute(sql)
            rows = self.cursor.fetchall()
            return rows
        except MySQLdb.Error, e:
            print "Error %d: %s" % (e.args[0], e.args[1])
            sys.exit (1)

    def ex_none(self,sql):
        try:
            self.cursor = self.con.cursor()
            self.cursor.execute(sql)
            return True
        except MySQLdb.Error, e:
            print "Error %d: %s" % (e.args[0], e.args[1])
            sys.exit (1)

    def ex_add(self,sql):
        try:
            self.cursor = self.con.cursor()
            self.cursor.execute(sql)
            self.con.commit()
            return True
        except MySQLdb.Error, e:
            print "Error %d: %s" % (e.args[0], e.args[1])
            sys.exit (1)
