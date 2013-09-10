from time import sleep
from pprint import pprint
from SQL import Sql
import json
from DeckoGame import Game, Player, Deck, GameServer

class test():
    def printA():
        print "A mothertrucker"

    def printB():
        print "And this is B"

    run = {
            "a": printA,
            "b": printB
            }

def pause(secs):
    print "Waiting %d seconds" % secs
    for x in range(secs, 0, -1):
        s = ""
        for x in range(x):
            s += "#####"
        s += "  %d" % x
        print s
        sleep(1)

if __name__ == "__main__":
    s = Sql("mtg")
    q = "SELECT d.id, d.usr, d.name, u.usr, u.uid "
    q+= "FROM users u "
    q+= "JOIN decks d ON u.usr = d.usr "
    q+= "WHERE u.`uid` = '01114ecbca5c52018c133ccfabd0db9c';"

    print q
    #t = test()
    #t.run['a']()
    #t.run['b']()
    #g = GameServer()
    #u = g.addPlayer("testyTest@mail.com", "Andy")
    #pause(2)

    #msg = { 'type': 'join', 'uid': u, 'deck_id': 60 }
    #x = g.msg(json.dumps(msg))
    #pprint(x)

    #if 'uid' in x:
        #print "Broadcast only to %s" % x['uid']
    #else:
        #print "No UID, Broadcast all"
