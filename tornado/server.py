import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import tornado.autoreload
import tornado.database

import os
import logging
import uuid
import hashlib


class WSHandler(tornado.websocket.WebSocketHandler):
    waiters = set()
    cache = []
    cache_size = 200

    @classmethod
    def update_cache(cls, chat):
        cls.cache.append(chat)
        if len(cls.cache) > cls.cache_size:
            cls.cache = cls.cache[-cls.cache_size:]

    @classmethod
    def send_updates(cls, chat):
        logging.info("sending message to %d waiters", len(cls.waiters))
        for waiter in cls.waiters:
            try:
                waiter.write_message(chat)
            except:
                logging.error("Error sending message", exc_info=True)

    def open(self):
        WSHandler.waiters.add(self)
        print 'new connection'

    def on_message(self, message):
        logging.info("got message %r", message)
        parsed = tornado.escape.json_decode(message)
        action = parsed["action"]
        if action == "message":
            chat = {
                "id": str(uuid.uuid4()),
                "name" : parsed["user"],
                "body": parsed["body"],
                }
            chat["html"] = self.render_string("message.html", message=chat)

            WSHandler.update_cache(chat)
            WSHandler.send_updates(chat)

            print "Message recieved from %s, message sent to cache: %s" % (parsed["user"], parsed["body"])
        elif action == "greeting":
            print "Message recieved, user identified as %s" % (parsed["user"])
        else:
            print "Message recieved, no action taken: %s" % (message)


    def on_close(self):
        WSHandler.waiters.remove(self)
        print 'connection closed'

class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("user")

class WebHandler(BaseHandler):
    def get(self):
        if not self.current_user:
            print "Cookie not found, redirecting to login"
            self.redirect("/login")
            return
        name = tornado.escape.xhtml_escape(self.current_user)
        self.render("index.html", messages=WSHandler.cache, username=name)

class LoginHandler(BaseHandler):
    def get(self):
        self.write('<html><body><form action="/login" method="post">'
                   'Name: <input type="text" name="name"><br />'
                   'Pass: <input type="password" name="password"><br />'
                   '<input type="submit" value="Sign in">'
                   '</form></body></html>')

    def post(self):
        db = tornado.database.Connection("localhost", "mtg", "root", "temple29")
        username = self.get_argument("name")
        passwd = hashlib.md5(self.get_argument("password")).hexdigest()
        rows = db.execute_rowcount("SELECT * FROM users WHERE usr = '%s' AND pass = '%s'" % (username, passwd))
        print "User logged in - %s" % (username)
        self.set_secure_cookie("user", self.get_argument("name"))
        self.redirect("/")
        print "Redirected to /"

settings = {
    "cookie_secret": "hZVE0olWbvA9fx2d",
    "login_url": "/login",
    "template_path" : os.path.join(os.path.dirname(__file__), "templates"),
    "static_path" : os.path.join(os.path.dirname(__file__), "static"),
    "debug": True
}

application = tornado.web.Application([
    (r'/favicon.ico', tornado.web.StaticFileHandler, {'path': 'img/favicon.ico'}),
    (r"/", WebHandler),
    (r'/ws', WSHandler),
    (r"/login", LoginHandler),
], **settings)


if __name__ == "__main__":
    def fn():
        print "File changed, reloading server now..."

    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(5000)
    tornado.autoreload.add_reload_hook(fn)
    tornado.autoreload.start()
    tornado.ioloop.IOLoop.instance().start()
