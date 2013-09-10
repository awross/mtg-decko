import uuid
import hashlib
import json
import random

from pprint import pprint
from SQL import Sql

class Card():
    id = 0
    number = 0
    name = ""
    set_no = 0
    rarity = ""
    legendary = False
    type = ""
    subtype = ""
    power = ""
    toughness = ""
    cost = ""
    cmc = 0
    text = ""
    flavor = ""
    illus = ""
    abrev = ""

    uuid = ""
    owner = ""

    def __init__(self, id, uuid="", owner=""):
        self.tapped = False
        self.parent = False
        self.attached = False
        self.counters = {}
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
            self.id = r[0]
            self.number = r[1]
            self.name = r[2]
            self.set_no = r[3]
            self.rarity = r[4]
            self.legendary = r[5]
            self.type = r[6]
            self.subtype = r[7]
            self.power = r[8]
            self.toughness = r[9]
            self.cost = r[10]
            self.cmc = r[11]
            self.text = r[12]
            self.flavor = r[13]
            self.illus = r[14]
            self.abrev = r[15]
            self.uuid = uuid
            self.owner = owner


class Token():
    id = 0
    set = 0
    type = ""
    size = ""
    number = ""
    illus = ""
    img_src = ""

    uuid = ""
    owner = ""

    def __init__(self, id, uuid="", owner=""):
        self.tapped = False
        self.parent = False
        self.attached = False
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
            self.id = r[0]
            self.set = r[1]
            self.type = r[2]
            self.size = r[3]
            self.number = r[4]
            self.illus = r[5]
            self.img_src = r[6]
            self.uuid = uuid
            self.owner = owner

class Game():
    id = 0
    players = []
    state = ""
    phases = [
        "untap",
        "upkeep",
        "draw",
        "first_main",
        "begin_combat",
        "attack",
        "defend",
        "damage",
        "end_combat",
        "second_main",
        "end",
    ]

    def getPhaseAction(self):
        if self.phases[self.phase] == "untap":
            p = self.players[self.active]
            self.untapAll(p.u_id)
            x = {
                'owner': p.u_id,
                'type': 'untap_all'
            }
            return x
        if self.phases[self.phase] == "draw":
            x = self.players[self.active].Draw()
            return x
        return False

    def p_curr(self):
        return self.phases[self.phase]

    def p_next(self):
        self.phase = ((self.phase+1) % len(self.phases))
        if (self.phase == 0):
            self.t_next()
        return self.getPhaseAction()

    def t_next(self):
        self.active = ((self.active+1) % len(self.players))
        self.priority = self.active
        self.phase = 0
        self.turn = self.turn + 1
        print "TURN NUMBER", self.turn
        return self.getPhaseAction()

    def __init__(self):
        self.id = 1
        self.state = "join"
        self.turn = 0
        self.active = 0
        self.priority = 0
        self.resolve = -1
        self.phase = 0
        self.stack = []
        self.battle = []
        self.exile = []

    @classmethod
    def getByUid(cls, uid):
        for x in cls.players:
            if x.u_id == uid:
                return x
        print "No such player found!"
        return None

    def playerExists(self, uid):
        for p in self.players:
            if p.u_id == uid:
                return True
        return False

    def getCard(self, c_uuid):
        #Check hands
        for b in self.exile:
            if b.uuid == c_uuid:
                c = self.exile.pop(self.exile.index(b))
                return c, "Exile"
        #Check field
        for b in self.battle:
            if b.uuid == c_uuid:
                c = self.battle.pop(self.battle.index(b))
                return c, "Battle"
        #Check stack
        for b in self.stack:
            if b.uuid == c_uuid:
                c = self.stack.pop(self.stack.index(b))
                return c, "Stack"
        #Check players areas
        for a in self.players:
            #Check hands
            for b in a.zones['hand']:
                if b.uuid == c_uuid:
                    c = a.zones['hand'].pop(a.zones['hand'].index(b))
                    return c, "Hand"
            #Check yards
            for b in a.zones['graveyard']:
                if b.uuid == c_uuid:
                    c = a.zones['graveyard'].pop(a.zones['graveyard'].index(b))
                    return c, "Graveyard"
            #Check tokens
            for b in a.tokens:
                if b.uuid == c_uuid:
                    c = a.tokens.pop(a.tokens.index(b))
                    return c, "Token"
            #Check libraries - last
            for b in a.zones['library']:
                if b.uuid == c_uuid:
                    c = a.zones['library'].pop(a.zones['library'].index(b))
                    return c, "Library"
        return None, "NOTFOUND"

    def findCard(self, c_uuid):
        #Check hands
        for b in self.exile:
            if b.uuid == c_uuid:
                return b, "Exile"
        #Check field
        for b in self.battle:
            if b.uuid == c_uuid:
                return b, "Battle"
        #Check stack
        for b in self.stack:
            if b.uuid == c_uuid:
                return b, "Stack"
        #Check players areas
        for a in self.players:
            #Check hands
            for b in a.zones['hand']:
                if b.uuid == c_uuid:
                    return b, "Hand"
            #Check yards
            for b in a.zones['graveyard']:
                if b.uuid == c_uuid:
                    return b, "Graveyard"
            #Check tokens
            for b in a.tokens:
                if b.uuid == c_uuid:
                    return b, "Token"
            #Check libraries - last
            for b in a.zones['library']:
                if b.uuid == c_uuid:
                    return b, "Library"
        return None, "NOTFOUND"


    def getZone(self, type):
        land_types = [
            "Basic",
            "Land",
            "Artifact Land",
            "Legendary Land",
        ]
        creature_types = [
            "Creature",
            "Artifact Creature",
            "Eaturecray",
            "Summon",
            "Legendary Creature",
            "Legendary Artifact Creature",
        ]
        aura_types = [
            "Enchantment",
            "Artifact",
        ]
        if type in land_types:
            return "#lands"
        elif type in creature_types:
            return "#creatures"
        elif type in aura_types:
            return "#auras"
        else:
            return "#other"

    def setLife(self, m):
        ret = []
        p = self.getByUid(m['uid'])
        x = int(m['life'])
        y = " lost " if (p.life-x) > 0 else " gained "
        z = p.name + y + str(abs(p.life-x)) + " life"
        p.life = x
        ret.append({
            'type': 'msg',
            'msg': z
        })
        ret.append({
            'type': 'phase',
            'active': self.players[self.active].u_id,
            'phase': self.p_curr(),
            'turn': self.turn,
            'life': self.getLife(),
        })
        return ret

    def getLife(self):
        x = []
        for a in self.players:
            x.append({
                'uid': a.u_id,
                'life': a.life
            })
        return x
        

    def loadPlayerDeck(self, m):
        ret = None
        uid = m['uid']
        if (uid != ""):
            deck_id = int(m['deck_id'])
            #print "Loading deck #%d for uid %s" % (deck_id, uid)
            ret = [self.getByUid(uid).loadDeck(deck_id)] 
            if self.state == "join":
                ready = True
                for p in self.players:
                    ready = ready and (p.state == "joined")
                if ready:
                    #Let any player start the game
                    self.state = "ready"
                    show_start = {
                        'type': 'ready',
                    }
                    ret.append(show_start)
            else:
                ret.append({
                    'type': 'msg',
                    'msg': self.getByUid(uid).name + " is switching decks"
                })
            return ret

    def mulliganPlayer(self, m):
        ret = []
        uid = m['uid']
        if (uid != ""):
            ret.append(self.getByUid(uid).mulligan())
        # send message to next player
        x = (self.active+1) % len(self.players)
        while (self.players[x].state == "ready" and x != self.active):
            x = (x+1) % len(self.players) # try next player
        if (self.players[x].state == "ready"):
            # move to next game state
            msg = {
                'type': 'msg',
                'msg': 'THIS SHOULD NOT BE HIT',
            }
            ret.append(msg)
        else:
            mull = {
                'uid': self.players[x].u_id,
                'type': 'state',
                'state': 'mulligan',
            }
            ret.append(mull) # send next mulligan option out
        self.active = x
        return ret

    def readyPlayer(self, m):
        ret = []
        uid = m['uid']
        if (uid != ""):
            ret.append(self.getByUid(uid).ready())
        # send message to next player
        x = (self.active+1) % len(self.players)
        while (self.players[x].state == "ready" and x != self.active):
            x = (x+1) % len(self.players) # try next player
        if (self.players[x].state == "ready"):
            # move to next game state
            self.state = "game"
            self.active = 0
            self.priority = 0
            self.phase = 3
            self.turn = 1
            p = self.players[self.active]
            ret.append({
                'type': 'game_start',
            })
            ret.append({
                'type': 'phase',
                'active': p.u_id,
                'phase': self.p_curr(),
                'turn': self.turn,
                'life': self.getLife(),
            })
            if (len(self.players) != 2):
                ret.append(p.Draw())
        else:
            mull = {
                'uid': self.players[x].u_id,
                'type': 'state',
                'state': 'mulligan',
            }
            ret.append(mull) # send next mulligan option out
        #self.active = x
        return ret

    def gameStart(self, m):
        self.state = "setup"
        ret = []
        ret.append({
            'type': 'killstart',
        })
        p_lst = []
        for a in self.players:
            p_lst.append({
                'uid': a.u_id,
                'name': a.name,
                "deck_id": a.deck.deck_id,
            })
        for p in self.players:
            p.InitDeck()
            ret.append({
                'uid': p.u_id,
                'type': 'board',
                'players': p_lst,
                'hand': p.getHand()
            })
        #Send mulligan option to first player
        ret.append({
            'uid': self.players[self.active].u_id,
            'type': 'state',
            'state': 'mulligan',
        })
        for x in range(len(self.players)):
            y = self.players[x]
            #pprint(y.u_id)
            #pprint(y.zones)
            #print("\r\n\r\n")
        #print("\r\n\r\n")
        return ret

    def sendPlay(self, m):
        ret = []
        p = self.getByUid(m['uid'])
        c = p.findCard(m['c_uuid'])
        land_types = [
            "Basic",
            "Land",
            "Artifact Land",
            "Legendary Land",
        ]
        to_area = "#stack"
        if c.type in land_types:
            #move the card
            self.battle.append(c)
            p.zones['hand'].remove(c)
            #send to players
            to_area = "#lands"
            ret.append({
                'type': 'play',
                'owner': p.u_id,
                'card_uuid': c.uuid,
                'card_id': c.id,
                'to_area': "#lands"
            })
            ret.append({
                'type': 'phase',
                'active': p.u_id,
                'phase': self.p_curr(),
                'turn': self.turn,
                'life': self.getLife(),
            })
        else:
            #move the card
            self.stack.append(c)
            p.zones['hand'].remove(c)
            #send to players
            ret.append({
                'type': 'play',
                'owner': p.u_id,
                'card_uuid': c.uuid,
                'card_id': c.id,
                'to_area': "#stack"
            })
            self.priority = self.players.index(p)
            self.resolve = self.priority 
            ret.append({
                'type': 'priority',
                'owner': p.u_id,
            })
        return ret

    def addToken(self, m):
        '''
        uid: p.uid,
        type: "token",
        qty: $("#token_qty").val(),
        t_id: $(this).val()
        '''
        p = self.getByUid(m['uid'])
        ret = []
        tokens = []
        num = int(m['qty'])
        for i in range(num):
            temp = {
                "uuid": str(uuid.uuid1()),
                "token_id": m['t_id'],
                "owner": m['uid'],
            }
            tokens.append(temp)
            p.tokens.append(Token(m['t_id'],temp['uuid'],m['uid']))
        ret.append({
            'type': 'token',
            'owner': m['uid'],
            'tokens': tokens,
        })
        ret.append({
            'type': 'phase',
            'active': p.u_id,
            'phase': self.p_curr(),
            'turn': self.turn,
            'life': self.getLife(),
        })
        return ret

    def addCounter(self, m):
        ret = []
        '''
        uid: client.p.uid,
        type: "counter",
        parent: e_id,
        c_type: "Plus",
        '''
        c, a = self.findCard(m['parent'])
        p = self.getByUid(c.owner)
        if m['c_type'] in c.counters:
            c.counters[m['c_type']] += 1
        else:
            c.counters[m['c_type']] = 1
        ret.append({
            'type': "counter",
            'parent': m['parent'],
            'c_type': m['c_type'],
            'qty': str(c.counters[m['c_type']]),
        })
        return ret

    def moveCard(self, m):
        '''
        uid: p.uid,
        type: "move",
        c_uuid: c_uuid,
        to: to_area,
        from: from_area, area_lst = ["Hand", "Graveyard", "Battle", "Library", "Exile"];
        '''
        ret = []
        p = self.getByUid(m['uid'])
        c_obj, c_area = self.getCard(m['c_uuid'])
        c_to = ""

        if (m['to'] == "Hand"):
            c_to = "Hand"
            p.zones['hand'].append(c_obj)
        elif (m['to'] == "Graveyard"):
            c_to = "Graveyard"
            p.zones['graveyard'].append(c_obj)
        elif (m['to'] == "Library"):
            c_to = "Library"
            p.zones['library'].append(c_obj)
        elif (m['to'] == "Battle"):
            c_to = self.getZone(c_obj.type)
            self.battle.append(c_obj)
        elif (m['to'] == "Exile"):
            c_to = "Exile"
            self.exile.append(c_obj)
        elif (m['to'] == "Stack"):
            c_to = "Stack"
            self.stack.append(c_obj)

        ret.append({
            'sentby': m['uid'],
            'type': 'move',
            'owner': c_obj.owner,
            'card_uuid': c_obj.uuid,
            'card_id': c_obj.id,
            'from': c_area,
            'to_area': c_to
        })
        ret.append({
            'type': 'phase',
            'active': p.u_id,
            'phase': self.p_curr(),
            'turn': self.turn,
            'life': self.getLife(),
        })
        return ret

    def handleResolve(self, m):
        ret = []
        if self.players[self.priority].u_id == m['uid']:
            if self.resolve < 0:
                self.resolve = self.active
            self.priority = ((self.priority+1) % len(self.players))
            #if we're _back_ to owner of top of stack, we're good
            if self.priority == self.resolve:
                if len(self.stack) == 0:#no stack, he's passing phase
                    x = self.p_next()
                    if x != False:
                        ret.append(x)
                    self.priority = self.active
                    self.resolve = -1
                    ret.append({
                        'type': 'phase',
                        'active': self.players[self.priority].u_id,
                        'phase': self.p_curr(),
                        'turn': self.turn,
                        'life': self.getLife(),
                    })
                else:
                    c = self.stack.pop()
                    self.battle.append(c)
                    p = self.getByUid(c.owner)
                    self.priority = self.players.index(p)
                    self.resolve = self.priority 
                    ret.append({
                        'type': 'move',
                        'owner': p.u_id,
                        'card_uuid': c.uuid,
                        'card_id': c.id,
                        'from': "#stack",
                        'to_area': self.getZone(c.type)
                    })
                    if len(self.stack) == 0:#no stack, return to phase
                        self.resolve = -1
                        ret.append({
                            'type': 'phase',
                            'active': p.u_id,
                            'phase': self.p_curr(),
                            'turn': self.turn,
                            'life': self.getLife(),
                        })
                    else:
                        self.priority = self.active #active player gets priority(116.3b)
                        ret.append({
                            'type': 'phase',
                            'active': p.u_id,
                            'phase': self.p_curr(),
                            'turn': self.turn,
                            'life': self.getLife(),
                        })
                        ret.append({
                            'type': 'priority',
                            'owner': self.players[self.priority].u_id,
                        })
            else:#pass priority to next player
                ret.append({
                    'type': 'priority',
                    'owner': self.players[self.priority].u_id,
                })
        else:#he doesnt have priority (outdated client)
            pass
        return ret

    def playerDraw(self, m):
        ret = []
        p = self.getByUid(m['uid'])
        ret.append(p.Draw())
        ret.append({
            'type': 'phase',
            'active': p.u_id,
            'phase': self.p_curr(),
            'turn': self.turn,
        })
        return ret

    def tapCard(self, m):
        c = None
        for x in self.battle:
            if x.uuid == m['c_uuid']:
                c = x
                break
        if not c:
            p = self.getByUid(m['uid'])
            for x in p.tokens:
                if x.uuid == m['c_uuid']:
                    c = x
                    break
        if c:
            c.tapped = True
            ret = {
                'type': 'tap',
                'card_uuid': m['c_uuid'],
                'owner': x.owner,
            }
            return ret

    def untapCard(self, m):
        c = None
        for x in self.battle:
            if x.uuid == m['c_uuid']:
                c = x
                break
        if not c:
            p = self.getByUid(m['uid'])
            for x in p.tokens:
                if x.uuid == m['c_uuid']:
                    c = x
                    break
        if c:
            c.tapped = False
            ret = {
                'type': 'untap',
                'card_uuid': m['c_uuid'],
                'owner': x.owner,
            }
            return ret

    def untapAll(self, uid):
        if len(self.battle) > 0:
            for c in self.battle:
                if c.owner == uid:
                    c.tapped = False

    def targetCard(self, m):
        ret = []
        t_from = m['from']
        c, a = self.findCard(t_from)
        t_to = m['to']
        t_target = ""
        if t_to == "own_player":
            t_to = "opp_player"
            t_target = "player"
        elif t_to == "opp_player":
            t_to = "own_player"
            t_target = "player"
        else:
            c_to, a_to = self.findCard(t_to)
            t_target = c_to.name
        ret.append({
            'type': 'target',
            'from': t_from,
            'to': t_to,
            'owner': m['uid'],
        })
        ret.append({
            'type': 'msg',
            'msg': c.name+" targets "+t_target
        })
        return ret

    def attachCard(self, m):
        '''
        uid: p.uid,
        type: "attach",
        parent: a_details.parent,
        child: a_details.child,
        '''
        ret = []
        c_parent, a_parent = self.findCard(m['parent'])
        c_child, a_child = self.findCard(m['child'])
        c_child.parent = c_parent.uuid
        c_parent.attached = True
        ret.append({
            'type': 'attach',
            'sender': m['uid'],
            'parent': m['parent'],
            'child': m['child'],
        })
        ret.append({
            'type': 'msg',
            'msg': c_child.name+" attaches to "+c_parent.name
        })
        return ret

    def nextPhase(self, m):
        ret = []
        x = self.p_next()
        if x != False:
            ret.append(x)
        p = self.players[self.active]
        ret.append({
            'type': 'phase',
            'active': p.u_id,
            'phase': self.p_curr(),
            'turn': self.turn,
            'life': self.getLife(),
        })
        return ret

    def nextTurn(self, m):
        ret = []
        x = self.t_next()
        if x != False:
            ret.append(x)
        p = self.players[self.active]
        ret.append({
            'type': 'phase',
            'active': p.u_id,
            'phase': self.p_curr(),
            'turn': self.turn,
            'life': self.getLife(),
        })
        return ret
    
    def resetGame(self):
        print "\r\n" + "GAME RESET!!" + "\r\n"
        self.state = "join"
        for x in self.players:
            x.reset()
        self.turn = 0
        self.active = 0
        self.priority = 0
        self.resolve = -1
        self.phase = 0
        self.stack = []
        self.battle = []
        self.exile = []
        ret = {
            'type': 'board_clear'
        }
        return ret

    def concede(self, m):
        ret = []
        ret.append(self.resetGame())

        self.state = "boarding"
        ret.append({
            'type': 'ready'
        })
        return ret

    def deckChange(self, m):
        ret = []
        ret.append(self.resetGame())
        p = self.getByUid(m['uid'])
        p.state = "connected"
        ret.append({
            "type": "state",
            "uid": p.u_id,
            "state": p.state,
        })
        return ret

class Player():
    u_id = ""
    name = ""
    email = ""
    state = ""

    def __init__(self, email, name, uid):
        self.life = 20
        self.poison = 0
        self.active = False
        self.lost = False
        self.deck = None
        self.email = email
        self.name = name
        self.u_id = uid

        self.zones = {}
        self.zones['library'] = []
        self.zones['hand'] = []
        self.zones['graveyard'] = []
        self.tokens = []

    def reset(self):
        print "\r\n" + self.name + " RESET!!" + "\r\n"
        self.life = 20
        self.poison = 0
        self.active = False
        self.lost = False

        self.state = "joined"

        self.zones['library'] = []
        self.zones['hand'] = []
        self.zones['graveyard'] = []
        self.tokens = []

    def loadDeck(self, deck_id):
        if self.deck == None:
            self.deck = Deck()
        if self.deck.loadDeck(self.u_id, deck_id):
            self.state = "joined"
            #self.deck.Shuffle()
        ret = {
            "type": "state",
            "uid": self.u_id,
            "state": self.state,
            "deck_id": deck_id
        }
        return ret

    def mulligan(self):
        num_cards = len(self.zones['hand'])
        self.deck.Shuffle()
        self.LoadLibrary()
        self.zones['hand'] = []
        for n in range(num_cards-1):
            self.zones['hand'].append(self.zones['library'].pop())
        board = {
            'uid': self.u_id,
            'type': 'board',
            'hand': self.getHand()
        }
        return board


    def ready(self):
        self.state = "ready"
        ret = {
            "type": "state",
            "uid": self.u_id,
            "state": self.state,
        }
        return ret

    def LoadLibrary(self):
        self.zones['library'] = []
        for x in self.deck.deck:
            self.zones['library'].append(Card(x['card_id'], x['uuid'], self.u_id))

    def InitDeck(self):
        self.state = "init"
        self.deck.Shuffle()
        #self.zones['library'] = self.deck.deck
        self.LoadLibrary()
        self.zones['hand'] = []
        for n in range(7):
            self.zones['hand'].append(self.zones['library'].pop())


    def getHand(self):
        x = []
        for a in self.zones['hand']:
            x.append({
                'uuid': a.uuid,
                'card_id': a.id,
            })
        return x

    def findCard(self, cid):
        for x in self.zones['hand']:
            if x.uuid == cid:
                return x
        return None

    def Draw(self, num=1):
        x = []
        for n in range(num):
            y = self.zones['library'].pop()
            x.append({
                'uuid': y.uuid,
                'card_id': y.id,
            })
            self.zones['hand'].append(y)
        draw = {
            'uid': self.u_id,
            'type': 'draw',
            'draw': x
        }
        return draw

        return



class Deck():
    name = ""
    deck_id = 0
    deck = []
    sideboard = []

    def __init__(self):
        name = "Untitled Deck"

    def loadDeck(self, uid, deck_id=0):
        if deck_id != 0:
            self.deck = []
            self.deck_id = deck_id

            s = Sql("mtg")
            q = "SELECT name, decklist, sideboard "
            q += "FROM decks "
            q += "WHERE id = '" + str(deck_id) + "';"
            rows = s.ex(q)
            if (len(rows) > 0):
                temp = rows[0]
                self.name = temp[0]
                if temp[1] != "":
                    x = json.loads(temp[1])
                    for a in x:
                        self.deck.append({
                            "uuid": str(uuid.uuid1()),
                            "card_id": a,
                        })
                if temp[2] != "":
                    x = json.loads(temp[1])
                    for a in x:
                        self.sideboard.append({
                            "uuid": str(uuid.uuid1()),
                            "card_id": a,
                        })
                return True
            return False

    def Shuffle(self):
        random.seed()
        for n in range(random.randint(1, 10)):
            #pprint(json.dumps(self.deck))
            random.shuffle(self.deck)


class GameServer():

    game = None
    run = None

    def __init__(self):
        self.game = Game()
        self.run = {
            "join": self.game.loadPlayerDeck,
            "game_start": self.game.gameStart,
            "mulligan": self.game.mulliganPlayer,
            "ready": self.game.readyPlayer,
            "play": self.game.sendPlay,
            "token": self.game.addToken,
            "counter": self.game.addCounter,
            "move": self.game.moveCard,
            "pass": self.game.handleResolve,
            "life": self.game.setLife,
            "tap": self.game.tapCard,
            "untap": self.game.untapCard,
            "target": self.game.targetCard,
            "attach": self.game.attachCard,
            "draw": self.game.playerDraw,
            "phase_next": self.game.nextPhase,
            "turn_next": self.game.nextTurn,
            "concede": self.game.concede,
            "deck_change": self.game.deckChange,
        }
        print "INITIALIZED!!!"

    def addPlayer(self, email, name, uid):
        if self.game != None:
            if self.game.state == "join":
                temp = Player(email,name,uid)
                self.game.players.append(temp)
                return True
            return False
        else:
            print "Game not started"
            pprint(self.game)

    def playerExists(self, uid):
        return self.game.playerExists(uid)

    def getPlayer(self, uid):
        return self.game.getByUid(uid)

    def setPlayerState(self, uid, state):
        for p in self.game.players:
            if p.u_id == uid:
                p.state = state
                ret = {
                    "type": "state",
                    "uid": uid,
                    "name": p.name,
                    "state": state
                }
                return ret
    def getPlayerState(self, uid):
        for p in self.game.players:
            if p.u_id == uid:
                ret = {
                    "type": "state",
                    "uid": uid,
                    "name": p.name,
                    "state": p.state
                }
                return ret

    def getPlayerReinit(self, uid):
        p = self.game.getByUid(uid)
        ret = []
        p_lst = []
        x = []
        stack = []
        battle = []
        ret.append({
            "type": "reinit",
            "uid": p.u_id,
            "name": p.name,
            "state": p.state,
            "deck_id": p.deck.deck_id,
        })
        for a in self.game.players:
            p_lst.append({
                'uid': a.u_id,
                'name': a.name,
                "deck_id": a.deck.deck_id,
            })
            y = {
                "player": a.u_id,
                'name': a.name,
                "graveyard": [],
                "tokens": []
            }
            for c in a.zones['graveyard']:
                y['graveyard'].append({
                    'uuid': c.uuid,
                    'card_id': c.id,
                    'owner': c.owner,
                })
            for t in a.tokens:
                y['tokens'].append({
                    'uuid': t.uuid,
                    'token_id': t.id,
                    'owner': t.owner,
                })
            x.append(y)
        if len(self.game.stack) > 0:
            for c in self.game.stack:
                stack.append({
                    'uuid': c.uuid,
                    'card_id': c.id,
                    'owner': c.owner,
                })
        if len(self.game.battle) > 0:
            attached = []
            for c in self.game.battle:
                if (c.parent != ""):
                    attached.append({
                        'parent': c.parent,
                        'child': c.uuid,
                        'uid': c.owner,
                    })
                cs = []
                for key, val in c.counters.iteritems():
                    cs.append({
                        'parent': c.uuid,
                        'c_type': key,
                        'qty': val,
                    })
                battle.append({
                    'uuid': c.uuid,
                    'card_id': c.id,
                    'owner': c.owner,
                    'to_area': self.game.getZone(c.type),
                    'counters': cs,
                })

            for att in attached:
                ret.append({
                    'type': 'attach',
                    'sender': att['uid'],
                    'parent': att['parent'],
                    'child': att['child'],
                })

        ret.append({
            'uid': p.u_id,
            'type': 'board',
            'hand': p.getHand(),
            'players': p_lst,
            'public': x,
            'stack': stack,
            'battle': battle,
        })
        if self.game.state == "game":
            ret.append({
                'uid': p.u_id,
                'type': 'phase',
                'active': self.game.players[self.game.active].u_id,
                'phase': self.game.p_curr(),
                'turn': self.game.turn,
                'life': self.game.getLife(),
            })
        if self.game.resolve >= 0:
            ret.append({
                'uid': p.u_id,
                'type': 'priority',
                'owner': self.game.players[self.game.priority].u_id,
            })


        return ret

    def msg(self, msg):
        m = json.loads(msg)
        pprint(m)
        f = self.run[m['type']]
        return f(m)
