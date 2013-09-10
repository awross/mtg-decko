from SQL import Sql
from pushover import pushover

class Log:
    """General handler for WoodHouse Logs"""

    db = ""
    post_by = ""
    title = ""
    text = ""
    added = None

    def __init__(self, title="", text="", b="wh"):
        self.title = title
        self.text = text
        self.post_by = b

    def Add(self, notify=True):
        s = Sql("woodhouse")
        q = "INSERT INTO logs "
        q += "(post_by, title, text) VALUES ("
        q += "'" + self.post_by + "', "
        q += "'" + self.title + "', "
        q += "'" + self.text + "');"
        if (notify):
            pushover(message=self.text, title=self.post_by + ":" + self.title, token="pvPX3Ag69Iwt4E9dvpVpA5xfoQLaEw", user="BE2sPX65J7xYeYm3dK3ghm8Aw1NY3O")
        return s.ex_add(q)
