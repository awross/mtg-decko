import hashlib
from SQL import Sql
from pprint import pprint

s = Sql("mtg")
q = "SELECT id, email FROM users;"
rows = s.ex(q)
for r in rows:
    uid = hashlib.md5(r[1]).hexdigest()
    x = "UPDATE users SET `uid` = '" + uid + "' WHERE id = " + str(r[0]) + ";"
    print x
    s.ex(x)
