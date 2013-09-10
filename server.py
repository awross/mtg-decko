from os import path as op

import datetime
import hashlib
from pprint import pprint
import os
import re
import hmac
import time
import Cookie
import base64
import json

from tornado import web, database, auth
from tornado.escape import utf8, _unicode
from tornado.util import b

from tornadio2 import SocketConnection, TornadioRouter, SocketServer

from SQL import Sql
from DeckoGame import GameServer


ROOT = op.normpath(op.dirname(__file__))
my_cookie_secret = "oif24fjdskfhrz4r8f4j398fj"
game=GameServer()

def decode_signed_value(secret, name, value, max_age_days=31):
    if not value:
        print "Value is NONE"
        return None
    parts = utf8(value).split(b("|"))
    if len(parts) != 3:
        print "Need 3 parts"
        return None
    signature = _create_signature(secret, name, parts[0], parts[1])
    if not _time_independent_equals(parts[2], signature):
        logging.warning("Invalid cookie signature %r", value)
        print "Invalid Cookie"
        return None
    timestamp = int(parts[1])
    if timestamp < time.time() - max_age_days * 86400:
        logging.warning("Expired cookie %r", value)
        print "Expired Cookie"
        return None
    if timestamp > time.time() + 31 * 86400:
        # _cookie_signature does not hash a delimiter between the
        # parts of the cookie, so an attacker could transfer trailing
        # digits from the payload to the timestamp without altering the
        # signature.  For backwards compatibility, sanity-check timestamp
        # here instead of modifying _cookie_signature.
        logging.warning("Cookie timestamp in future; possible tampering %r", value)
        print "Future Cookie"
        return None
    if parts[1].startswith(b("0")):
        logging.warning("Tampered cookie %r", value)
        print "Tampered Cookie"
        return None
    try:
        return base64.b64decode(parts[0])
    except Exception:
        print "Exception Cookie"
        return None

def _create_signature(secret, *parts):
    hash = hmac.new(utf8(secret), digestmod=hashlib.sha1)
    for part in parts:
        hash.update(utf8(part))
    return utf8(hash.hexdigest())

def _time_independent_equals(a, b):
    if len(a) != len(b):
        return False
    result = 0
    if type(a[0]) is int:  # python3 byte strings
        for x, y in zip(a, b):
            result |= x ^ y
    else:  # python2
        for x, y in zip(a, b):
            result |= ord(x) ^ ord(y)
    return result == 0


class BaseHandler(web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("user")

class GoogleHandler(web.RequestHandler, auth.GoogleMixin):
    @web.asynchronous
    def get(self):
        if self.get_argument("openid.mode", None):
            self.get_authenticated_user(self.async_callback(self._on_auth))
            return
        self.authenticate_redirect()

    def _on_auth(self, user):
        if not user:
            raise web.HTTPError(500, "Google auth failed")
        # Save the user with, e.g., set_secure_cookie()
        print "USER------"
        pprint(user)
        self.set_secure_cookie("user", user["name"])
        self.set_secure_cookie("email", user["email"])
        self.redirect("/")
        print "User %s -> Redirected to /" % user["name"]

class LoginHandler(BaseHandler):
    def get(self):
        self.write('<html><body><form action="/login" method="post">'
                   'Name: <input type="text" name="name"><br />'
                   'Pass: <input type="password" name="password"><br />'
                   '<input type="submit" value="Sign in">'
                   '</form></body></html>')

    def post(self):
        db = database.Connection("localhost", "mtg", "root", "temple29")
        username = self.get_argument("name")
        passwd = hashlib.md5(self.get_argument("password")).hexdigest()
        rows = db.execute_rowcount("SELECT * FROM users WHERE usr = '%s' AND pass = '%s'" % (username, passwd))
        print "User logged in - %s" % (username)
        self.set_secure_cookie("user", self.get_argument("name"))
        self.redirect("/")
        print "Redirected to /"

class IndexHandler(BaseHandler):
    """Regular HTTP handler to serve the chatroom page"""
    def get(self):
        if not self.current_user:
            print "Cookie not found, redirecting to login"
            self.redirect("/login")
            return
        self.render('index.html')


class SocketIOHandler(web.RequestHandler):
    def get(self):
        self.render('../socket.io.js')

class DecksListHandler(web.RequestHandler):
    def get(self, uid):
        s = Sql("mtg")
        q = "SELECT d.id, d.usr, d.name, u.usr, u.uid "
        q+= "FROM users u "
        q+= "JOIN decks d ON u.usr = d.usr "
        q+= "WHERE u.`uid` = '" + uid + "' "
        q+= " ORDER BY d.id DESC;"
        rows = s.ex(q)
        if len(rows) > 0:
            decks = []
            for r in rows:
                temp = {"id": r[0], "name": r[2]}
                decks.append(temp)
            self.write(json.dumps(decks))
        self.write("")

class TokenListHandler(web.RequestHandler):
    def get(self, deckid):
        s = Sql("mtg")
        q = "SELECT name, decklist, updateDate FROM decks WHERE id = '"+deckid+"' LIMIT 1;"
        rows = s.ex(q)
        if len(rows) == 1:
            r = rows[0]
            arr = json.loads(r[1])
            c_lst = ",".join(str(x) for x in arr)
            sql  = "SELECT t.id AS t_id, "
            sql += "t.size AS size, "
            sql += "t.t_type AS t_type, "
            sql += "l.img AS img, "
            sql += "c.name AS card_name "
            sql += "FROM token_lookup AS l "
            sql += "JOIN tokens t ON t.id = l.token_id "
            sql += "JOIN cards c ON c.id = l.card_id "
            sql += "WHERE card_id IN (" + c_lst + ");"
            toks = s.ex(sql)
            if len(toks) > 0:
                tokens = []
                for x in toks:
                    tokens.append({
                        'id': x[0],
                        'size': x[1],
                        'type': x[2],
                        'img_src': x[3],
                        'card_name': x[4],

                    })
                self.write(json.dumps(tokens))
        else:
            self.write("false")

class getCardHandler(web.RequestHandler):
    def get(self, id):
        s = Sql("mtg")
        q = "SELECT c.id, c.number, c.name, c.set_no, c.rarity, c.legendary, c.type, c.subtype, c.power, c.toughness, c.cost, c.cmc, c.text, c.flavor, c.illus, s.abrev "
        q+= "FROM cards c "
        q+= "JOIN sets s ON c.set_no = s.id "
        q+= "WHERE c.id = '" + str(id) + "' "
        q+= "LIMIT 1;"
        rows = s.ex(q)
        if len(rows) == 1:
            c = {}
            r = rows[0]
            c["id"] = r[0]
            c["number"] = r[1]
            c["name"] = r[2]
            c["set_no"] = r[3]
            c["rarity"] = r[4]
            c["legendary"] = r[5]
            c["type"] = r[6]
            c["subtype"] = r[7]
            c["power"] = r[8]
            c["toughness"] = r[9]
            c["cost"] = r[10]
            c["cmc"] = r[11]
            c["text"] = r[12]
            c["flavor"] = r[13]
            c["illus"] = r[14]
            c["abrev"] = r[15]
            self.write(json.dumps(c))
        self.write("")

class getTokenHandler(web.RequestHandler):
    def get(self, id):
        s = Sql("mtg")
        q = "SELECT t.id, t.set_no, t.t_type, t.size, t.number, t.artist, l.img "
        q+= "FROM tokens t "
        q+= "JOIN token_lookup l ON t.id = l.token_id "
        q+= "WHERE t.id = '" + str(id) + "' "
        q+= "LIMIT 1;"
        rows = s.ex(q)
        if len(rows) == 1:
            c = {}
            r = rows[0]
            c["id"] = r[0]
            c["set"] = r[1]
            c["type"] = r[2]
            c["size"] = r[3]
            c["number"] = r[4]
            c["illus"] = r[5]
            c["img_src"] = r[6]
            self.write(json.dumps(c))
        self.write("")

class ChatConnection(SocketConnection):
    participants = set()
    unique_id = 0

    @classmethod
    def get_username(cls, name=""):
        cls.unique_id += 1
        return 'User-%s-%d' % (name, cls.unique_id)
        #name = self.current_user
        #return name

    def on_open(self, info):
        print 'Chat', repr(info)

        name = info.get_cookie("user")
        name = decode_signed_value(my_cookie_secret, "user", name.value)
        print 'user - %s' % name

        email=info.get_cookie("email")
        email = decode_signed_value(my_cookie_secret, "email", email.value)
        print 'email - %s' % email
        

        # Give user unique ID
        #self.user_name = self.get_username()
        self.user_name = name
        self.participants.add(self)

        self.broadcast('%s joined chat.' % self.user_name)

    def on_message(self, message):
        self.broadcast('%s: %s' % (self.user_name, message))

    def on_close(self):
        self.participants.remove(self)

        self.broadcast('%s left chat.' % self.user_name)

    def broadcast(self, msg):
        for p in self.participants:
            p.send(msg)

class GSConnection(SocketConnection):
    participants = {}
    unique_id = 0
    name = ""
    email = ""
    u_id = ""

    @classmethod
    def get_username(cls, name=""):
        cls.unique_id += 1
        return 'User-%s-%d' % (name, cls.unique_id)
        #name = self.current_user
        #return name

    def on_open(self, info):
        print 'GS Connected', repr(info)
        pprint(game)
        #print 'GAME ID:', game.game.id

        name = info.get_cookie("user")
        name = decode_signed_value(my_cookie_secret, "user", name.value)
        self.name = name
        print 'user - %s' % name

        email=info.get_cookie("email")
        email = decode_signed_value(my_cookie_secret, "email", email.value)
        self.email = email
        print 'email - %s' % email
        
        self.u_id = hashlib.md5(email).hexdigest()
        print "UID: ", self.u_id
        self.participants[self.u_id] = self

        if not game.playerExists(self.u_id):
            if (game.game.state == "join" or game.game.state == "ready"):
                if (game.game.state == "ready"):
                    game.game.state = "join"
                    self.broadcast(json.dumps({
                        'type': 'killstart',
                    }))
                print "Adding player:", self.email
                game.addPlayer(email,name,self.u_id)
                ret = game.setPlayerState(self.u_id, "connected")
                self.send(json.dumps(ret))
                # then we have to tell the other clients so they can add new player's table space
            else:
                print "PLAYER " + self.email + " TURNED AWAY, GAME ALREADY STARTED"
                self.send(json.dumps({
                    'type': 'msg',
                    'msg': 'GAME ALREADY STARTED, CANNOT JOIN'
                }))
        else:
            print "Player Reconnected!:", self.email
            #Re-send player state
            self.sendClient(game.getPlayerReinit(self.u_id))
            #x = game.getPlayerReinit(self.u_id)

    def on_message(self, message):
        x = game.msg(json.dumps(message))
        if x:
            self.sendClient(x)

    def on_close(self):
        #self.participants.remove(self)
        self.broadcast('%s disconnected.' % self.name)

        if game.playerExists(self.u_id):
            #Set a p.disconnected flag and alert other players?
            #Shouldn't be a state though, that should be preserved
            pass
        if self.u_id in self.participants:
            #del self.participants[self.u_id]
            pass

    def broadcast(self, msg):
        for p in self.participants:
           self.participants[p].send(msg)
           print "BROADCASTING FROM GAME CHANNEL", msg

    def sendClient(self, msg):
        if isinstance(msg, list):
            for r in msg:
                if 'uid' in r:
                    self.participants[r['uid']].send(json.dumps(r))
                else:
                    self.broadcast(json.dumps(r))
        else:
            if 'uid' in msg:
                self.participants[msg['uid']].send(json.dumps(msg))
            else:
                self.broadcast(json.dumps(msg))

class PingConnection(SocketConnection):
    def on_open(self, info):
        print 'Ping', repr(info)

    def on_message(self, message):
        now = datetime.datetime.now()

        message['server'] = [now.hour, now.minute, now.second, now.microsecond / 1000]
        self.send(message)


class RouterConnection(SocketConnection):
    __endpoints__ = {'/chat': ChatConnection,
                     '/ping': PingConnection,
                     '/gs': GSConnection}

    def on_open(self, info):
        print 'Router', repr(info)


# Create tornadio server
MyRouter = TornadioRouter(RouterConnection)

# Create socket application
application = web.Application(
        MyRouter.apply_routes([(r"/", IndexHandler),
        (r"/socket.io.js", SocketIOHandler),
        (r"/login", GoogleHandler),
        (r"/getDeck/([0-9a-f]+)", DecksListHandler),
        (r"/getTokens/([0-9a-f]+)", TokenListHandler),
        (r"/getCard/([0-9]+)", getCardHandler),
        (r"/getAToken/([0-9]+)", getTokenHandler),
    ]),
    #flash_policy_port = 843,
    #flash_policy_file = op.join(ROOT, 'flashpolicy.xml'),
    cookie_secret=my_cookie_secret,
    static_path=os.path.join(os.path.dirname(__file__), "static"),
    login_url="/login",
    socket_io_port = 5000,
    debug=True,
)

if __name__ == "__main__":
    import logging
    logging.getLogger().setLevel(logging.DEBUG)
    # Create and start tornadio server
    SocketServer(application)
