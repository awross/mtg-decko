function Card(c_in) {
	this.id = "";
	this.uuid = "";
	this.img_id = "";
	this.number = "";
	this.name = "";
	this.set = 0;
	this.rarity = "";
	this.legendary = false;
	this.type = "";
	this.subtype = "";
	this.power = "";
	this.toughness = "";
	this.cost = "";
	this.cmc = 0;
	this.text = "";
	this.flavor = "";
	this.illus = "";
	this.abrev = "";
	
	this.position = {
		top: 0,
		left: 0
	};

    if (typeof c_in.card_id !== 'undefined') {
        var that = this;
        $.ajax({
            type: "GET",
            async: false,
            url: "getCard/" + c_in.card_id,
            success: function(c)
            {
                var data = jQuery.parseJSON(c);
                that.id = data.id;
                that.number = data.number;
                that.name = data.name;
                that.set = data.set;
                that.rarity = data.rarity;
                that.legendary = data.legendary;
                that.type = data.type;
                that.subtype = data.subtype;
                that.power = data.power;
                that.toughness = data.toughness;
                that.cost = data.cost;
                that.cmc = data.cmc;
                that.text = data.text;
                that.flavor = data.flavor;
                that.illus = data.illus;
                that.abrev = data.abrev;
                that.uuid = c_in.uuid;
                isDFC = that.number.match(/a$/);
            }
        });
    } else {
        alert("NO CARD ID!");
    }

    this.toHand = function() {
        var c_height = (typeof client.row_height !== 'undefined') ? client.row_height-16 : 150;
        var that = this;
        var x = $('<img />').attr({
            "id": this.uuid,
            "uuid": this.uuid,
            "src": "http://magiccards.info/scans/en/" + this.abrev + "/" + this.number + ".jpg",
            "class": isDFC ? "card front" : "card",
            "alt": this.name,
            "height": c_height + "px",
        }).appendTo('#own_hand');
    };

    this.move = function(to_area) {
        var c_height = (typeof client.row_height !== 'undefined') ? client.row_height-16 : 150;
        var c_width = c_height * 0.7;
        
        var t_card = $("#"+this.uuid);
        if (t_card.length == 0) {
            var that = this;
            t_card = $('<img />').attr({
                "id": that.uuid,
                "uuid": that.uuid,
                "src": "http://magiccards.info/scans/en/" + that.abrev + "/" + that.number + ".jpg",
                "class": isDFC ? "card front" : "card",
                "alt": that.name,
                "height": c_height + "px",
            });
        }
        if (to_area.match("#lands")) {
            var z = $(to_area+" img[alt='"+this.name+"']");
            if (z.length > 0) {
                z.last().after(t_card.css({
                    "margin-left" : (c_width*5/-6),
                    "margin-top" : "15px"
                }));
            } else {
                t_card.removeAttr("attached").removeAttr("parent").css({
                    "position" : "static",
                    "margin-left" : "",
                    "margin-top" : "",
                    "top" : "",
                });
                t_card.appendTo(to_area);
            }
        } else {
            t_card.removeAttr("attached").removeAttr("parent").css({
                "position" : "static",
                "margin-left" : "",
                "margin-top" : "",
                "top" : "",
            });
            t_card.appendTo(to_area);
        }
    };

    this.attach = function(childId, parentId) {
        $("#"+childId).attr("parent", parentId).css({
            "position": "relative",
        }).insertBefore("#"+parentId);
        var space = 20, x=0, left="";
        var aLst = $(".card[parent="+parentId+"]");
        for (var i=0;i<aLst.length;i++) {
            $(aLst[i]).css({
                "margin-left" : left,
                "top": x+"px",
            });
            x+=space;
            if (left=="") {
                left = (($("#"+childId).width()+5)*-1)+"px";
            }
        }
        $("#"+parentId).attr("attached", "true").css({
            "position" : "relative",
            "margin-left" : left,
            "top" : (x>0) ? x+"px" : "",
        });
    };
}
Card.spells = ["Instant", "Sorcery", "Interrupt"];
Card.lands = ["Land", "Basic", "Artifact Land", "Legendary Land"];
Card.auras = ["Aura", "Equipment"];

function Token(t_in) {
	this.uuid = "";

	this.id = "";
	this.set = "";
	this.type = "";
	this.size = "";
	this.number = "";
	this.illus = "";
	this.img_src = "";
	
	this.position = {
		top: 0,
		left: 0
	};

    if (typeof t_in.token_id !== 'undefined') {
        var that = this;
        $.ajax({
            type: "GET",
            async: false,
            url: "getAToken/" + t_in.token_id,
            success: function(c)
            {
                var data = jQuery.parseJSON(c);
                that.id = data.id;
                that.set = data.set;
                that.type = data.type;
                that.size = data.size;
                that.number = data.number;
                that.illus = data.illus;
                that.img_src = data.img_src;

                that.uuid = t_in.uuid;
            }
        });
    } else {
        alert("NO TOKEN ID!");
    }

    this.move = function(to_area) {
        var c_height = (typeof client.row_height !== 'undefined') ? client.row_height-16 : 150;
        var c_width = c_height * 0.7;
        var t_card = $("#"+this.uuid);
        if (t_card.length == 0) {
            var that = this;
            t_card = $('<img />').attr({
                "id": that.uuid,
                "uuid": that.uuid,
                "src": that.img_src,
                "class": "card",
                "alt": that.type+" "+that.size,
                "height": c_height + "px",
            });
        }
        var z = $(to_area+" img[alt='"+this.type+" "+this.size+"']");
        if (z.length > 0) {
            z.last().after(t_card.css({
                "margin-left" : (c_width*5/-6),
                "margin-top" : "15px"
            }));
        } else {
            t_card.css({
                "margin-left" : "",
                "margin-top" : ""
            });
            t_card.appendTo(to_area);
        }
    };
}

function Player (uid, name) {
    this.state = "";
    this.active = false;
    this.uid = "";
    this.name = "";
    this.hand = [];
    this.graveyard = [];
    this.library = [];
    this.tokens = [];
    this.deck_id = 0;
    if(typeof(uid)!=="undefined") {
        this.uid = uid;
    }
    if(typeof(name)!=="undefined") {
        this.name = name;
    }

    this.setState = function(s) {
        state = s;
    };

    this.findCard = function(c_uuid) {
        for (var i=0;i<this.hand.length;i++) {
            if (this.hand[i].uuid == c_uuid) {
                return this.hand[i];
            }
        }
        return false;
    };
    this.getCard = function(c_uuid) {
        for (var i=0;i<this.hand.length;i++) {
            if (this.hand[i].uuid == c_uuid) {
                var temp = this.hand.splice(i, 1);
                return temp[0];
            }
        }
    };
    
    this.setHand = function(h) {
        if(typeof(Storage)!=="undefined") {
            localStorage.own_hand = new Object();
        }
        for (var n=0; n<h.length; n++) {
            var temp = new Card(h[n]);
            this.hand.push(temp);
            temp.toHand();
            //console.dir(temp);
            //console.dir(this.hand);
        }
        var that = this;
        $("#own_hand").sortable({
            cursorAt: { top: 50, left: 50 },
            /*revert: 'invalid',*/
            start: function(event, ui) {
                var c_uuid = ui.item[0].id;
                var x = that.findCard(c_uuid);
                var y = "Dragging [" + x.name + "]";
                var z = $("<div />", {
                    id: "active_card",
                    class: "hud",
                    text: y,
                }).appendTo("#hud");
                /*gs.json.send({
                    uid: p.uid,
                    type: "play",
                    to: "battlefield",
                    c_uuid: y
                });*/
            },
            stop: function(event, ui) {
                $("#active_card").remove();
            }
        });
        localStorage.own_hand = this.hand;
        //console.dir(localStorage.own_hand);
    };
    
    this.Draw = function(d) {
        for (var n=0; n<d.length; n++) {
            var temp = new Card(d[n]);
            this.hand.push(temp);
            temp.toHand();
            //console.dir(temp);
            //console.dir(this.hand);
        }
        $("#own_hand").sortable({
            cursorAt: { top: 50, left: 50 },
        });
        localStorage.own_hand = this.hand;
        //console.dir(localStorage.own_hand);
    };

    this.clear = function() {
        this.hand = [];
        this.graveyard = [];
        this.library = [];
        this.tokens = [];
    };
}

function DeckoClient() {
    var zones = {
        stack: [],
        battle: [],
        exile: [],
        p: [new Player()],
    };
    var p = zones.p[0];
    if(typeof(Storage)!=="undefined") {
        localStorage.clear();
    }


	var sock = new io.connect('http://' + window.location.host + '?test=blahblahblah'),
		chat = new io.connect('http://' + window.location.host + '/chat'),
		ping = new io.connect('http://' + window.location.host + '/ping');
		gs = new io.connect('http://' + window.location.host + '/gs');

	// Establish event handlers
	sock.on('disconnect', function() {
		sock.socket.reconnect();
	});

	chat.on('message', function(data) {
		$("#chat").append("<div>" + data + "</div>");
	});

	function getPrintableDate(date) {
	  return date.getFullYear().toString() + '/' +
		 (date.getMonth()+1).toString() + '/' +
		 date.getDate().toString() + ' ' +
		 date.getHours().toString() + ':' +
		 date.getMinutes().toString() + ':' +
		 date.getSeconds().toString() + '.' +
		 date.getMilliseconds().toString();
	}

	function encodeDate(date)
	{
		return [date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
	}

	function decodeDate(data)
	{
		var date = new Date();
		return new Date(date.getFullYear(), date.getMonth(), date.getDate(),
						data[0], data[1], data[2], data[3]);
	}

	// Ping
	ping.on('message', function(data) {
		var client = decodeDate(data.client);
		var server = decodeDate(data.server);
		var now = new Date();

		$('#ping').html('<b>Ping: ' + (now.getTime() - client.getTime()).toString() + ' ms</b>;'/*+
						'C2S: ' + (server.getTime() - client.getTime()).toString() + ' ms.</b>'*/
						);
	});

	function sendPing()
	{
		ping.json.send({client: encodeDate(new Date()) });
		setTimeout(sendPing, 5000);
	}
	sendPing();

	//send the message when submit is clicked
	$('#chatform').submit(function (evt) {
		var line = $('#chatform [type=text]').val();
		$('#chatform [type=text]').val('');
		chat.send(line);
		return false;
	});

	var buffer0 = 16;
	var buffer1 = 8;
	var buffer2 = 4;
    var h = {
        "height": $("#header").height(),
        "width": $("#header").width() - (1*buffer0),
        "e": $("#wrapper")
    };

    var w = {
        "top": ((h.height*5)/4),
        "width": h.width,
        "height": $(window).height() - (((h.height*5)/4) + (3*buffer1)),
        "e": $("#wrapper")
    };

    var c = {
        "top": w.top,
        "width": ((h.width-buffer0)/5)-(0*buffer0),
        "height": w.height,
        "e": $("#chat_area")
    };

    var t = {
        "top": w.top,
        "width": h.width-(c.width+buffer0)-(0*buffer0),
        "height": w.height,
        "e": $("#table")
    };

    var bf_height = t.height*2/5;
    var row_height = t.height/5;

	w.e.css({
		"top": w.top,
		"left": 1,
		"height": w.height,
		"width": w.width+"px" 
	});
	t.e.css({
		"top": 0,
		"left": 1,
		"width": t.width+"px"
	});
	c.e.css({
		"top": 0,
		"left": t.width+(2*buffer1)+"px",
		"width": c.width+"px"
	});
	$("#chat").css({
		"height": (c.height-(4*buffer0))+"px"
	});
	$("#chatInput").css({
		"width": (c.width-100)+"px"
	});
    $("#own_battle").css({
        "height": 2*bf_height,
        "top": t.top
    });
    /*$("#opp_battle").css({
        "height": bf_height,
        "top": t.top + bf_height
    });*/
    $("#info").css({
        "height": row_height,
        "top": t.top + (2*bf_height)
    });

    this.h = h;
    this.w = w;
    this.t = t;
    this.c = c;
    this.p = p;
    this.bf_height = bf_height;
    this.row_height = row_height;

    this.zones = zones;


    this.Save = function() {
        //
    };

    this.sendMove = function(c_uuid, to_area, from_area) {
        gs.json.send({
            uid: p.uid,
            type: "move",
            c_uuid: c_uuid,
            to: to_area,
            from: from_area,
        });
    };

    this.showConcede = function() {
        if ($("#concede").length < 1) { /*create it*/
            $("<div />", {
                id: "concede",
            }).wijdialog({
                closeOnEscape: false,
                title: "Concede?",
                zIndex: 500,
                captionButtons: {
                    pin: {visible: false},
                    refresh: {visible: false},
                    toggle: {visible: false},
                    minimize: {visible: false},
                    maximize: {visible: false},
                    close: {visible: true, click: self.close, iconClassOn: 'ui-icon-close'}
                },
                buttons: [
                    {
                        text:"Cancel",
                        click: self.close,
                    },
                    {
                        text: "OK",
                        click: function () {
                            gs.json.send({
                                uid: p.uid,
                                type: "concede",
                            });
                            $("#concede").wijdialog("destroy");
                            $("#concede").remove();
                        }
                    },
                ],
            });
        } else {
            $("#concede").wijdialog ("open");
        }
    };

    this.deckChange = function() {
        if ($("#deck_change").length < 1) { /*create it*/
            $("<div />", {
                id: "deck_change",
            }).wijdialog({
                closeOnEscape: false,
                title: "Quit and Change Deck?",
                zIndex: 500,
                captionButtons: {
                    pin: {visible: false},
                    refresh: {visible: false},
                    toggle: {visible: false},
                    minimize: {visible: false},
                    maximize: {visible: false},
                    close: {visible: true, click: self.close, iconClassOn: 'ui-icon-close'}
                },
                buttons: [
                    {
                        text:"Cancel",
                        click: self.close,
                    },
                    {
                        text: "OK",
                        click: function () {
                            gs.json.send({
                                uid: p.uid,
                                type: "deck_change",
                            });
                            $("#deck_change").wijdialog("destroy");
                            $("#deck_change").remove();
                        }
                    },
                ],
            });
        } else {
            $("#deck_change").wijdialog ("open");
        }
    };

    function findACard(c_uuid) {
        for(var i=0;i<zones.stack.length;i++) {
            if (zones.stack[i].uuid == c_uuid) {
                return zones.stack[i];
            }
        }
        for(var i=0;i<zones.exile.length;i++) {
            if (zones.exile[i].uuid == c_uuid) {
                return zones.exile[i];
            }
        }
        for(var i=0;i<zones.battle.length;i++) {
            if (zones.battle[i].uuid == c_uuid) {
                return zones.battle[i];
            }
        }
        for (var i=0;i<zones.p.length;i++) {
            var P = zones.p[i];
            for(var j=0;j<P.hand.length;j++) {
                if (P.hand[j].uuid == c_uuid) {
                    return P.hand[j];
                }
            }
            for(var j=0;j<P.graveyard.length;j++) {
                if (P.graveyard[j].uuid == c_uuid) {
                    return P.graveyard[j];
                }
            }
            for(var j=0;j<P.tokens.length;j++) {
                if (P.tokens[j].uuid == c_uuid) {
                    return P.tokens[j];
                }
            }
            for(var j=0;j<P.library.length;j++) {
                if (P.library[j].uuid == c_uuid) {
                    return P.library[j];
                }
            }
        }
        return false;
    }

    function getACard(c_uuid) {
        for(var i=0;i<zones.stack.length;i++) {
            if (zones.stack[i].uuid == c_uuid) {
                return zones.stack.splice(i, 1)[0];
            }
        }
        for(var i=0;i<zones.exile.length;i++) {
            if (zones.exile[i].uuid == c_uuid) {
                return zones.exile.splice(i, 1)[0];
            }
        }
        for(var i=0;i<zones.battle.length;i++) {
            if (zones.battle[i].uuid == c_uuid) {
                return zones.battle.splice(i, 1)[0];
            }
        }
        for (var i=0;i<zones.p.length;i++) {
            var P = zones.p[i];
            for(var j=0;j<P.hand.length;j++) {
                if (P.hand[j].uuid == c_uuid) {
                    return P.hand.splice(i, 1)[0];
                }
            }
            for(var j=0;j<P.graveyard.length;j++) {
                if (P.graveyard[j].uuid == c_uuid) {
                    return P.graveyard.splice(i, 1)[0];
                }
            }
            for(var j=0;j<P.tokens.length;j++) {
                if (P.tokens[j].uuid == c_uuid) {
                    return P.tokens.splice(i, 1)[0];
                }
            }
            for(var j=0;j<P.library.length;j++) {
                if (P.library[j].uuid == c_uuid) {
                    return P.library.splice(i, 1)[0];
                }
            }
        }
        return false;
    }
    this.getACard = getACard;
    this.findACard = findACard;

    function getZone(z) {
        switch(z) {
            case "Basic":
            case "Land":
            case "Artifact Land":
            case "Legendary Land":
                return "#lands";
                break;
            case "Creature":
            case "Artifact Creature":
            case "Eaturecray":
            case "Summon":
            case "Legendary Creature":
            case "Legendary Artifact Creature":
                return "#creatures";
                break;
            case "Enchantment":
            case "Artifact":
                return "#auras";
                break;
            default:
                return "#other";
                break;
        }
    }

    function getPlayer(uid) {
        for (var i=0;i<zones.p.length;i++) {
            if (zones.p[i].uid == uid) {
                return zones.p[i];
            }
        }
        return false;
    }
    this.getPlayer = getPlayer;

    function playerIndex(uid) {
        for (var i=0;i<zones.p.length;i++) {
            if (zones.p[i].uid == uid) {
                return i;
            }
        }
        return -1;
    }

    function setPlayerState(m) {
        //alert("setting state: " + m.state);
        if (typeof m.uid !== 'undefined') {
            p.uid = m.uid;
        }
        if (typeof m.name !== 'undefined') {
            p.name = m.name;
        }
        p.setState(m.state);
    
        switch(m.state) {
            case "connected":
                showDeckSelection(p.uid);
                break;
            case "joined":
                p.deck_id = m.deck_id;
                //Set up battlefield
                setupBattlefield();
                break;
            case "init":
                //Waiting on hand and mulligan option
                ////Need to check server-side on reconnect if player is active to resend mulligan
                break;
            case "mulligan":
                askMulligan();
                break;
            case "phase":
                break;
            default:
                break;
        }
    }

    function setPhase(m) {
        closeStack();
        p.active = (p.uid == m.active);
        $(".phase_info").remove();
        var x = $("<div />", {
            class: "hud phase_info",
            text: m.turn + ":" + m.phase,
        }).appendTo("#own_info");
        /*
        var y = $("<div />", {
            class: "hud phase_info",
            text: (p.active ? "active" : "rec:" + m.active + " -- us:" + p.uid),
        }).appendTo("#own_info");
        */
        if (p.active) {
            //$( "#own_hand" ).sortable( "option", "connectWith", "#own_battle" );
            allowPlay();
            if ($("#pass_phase").length == 0) {
                var z = $("<button />", {
                    id: "pass_phase",
                    text: "pass",
                    value: "pass",
                    click: function () {
                        gs.json.send({
                            uid: p.uid,
                            type: "pass"
                        });
                        killpass();
                    }
                }).appendTo("#own_info");
            }
        } else {
            killpass();
            disallowPlay();
        }
        if (typeof m.life !== 'undefined') {
            for(var i=0;i<m.life.length;i++) {
                setLife(m.life[i]);
            }
        }
        jsPlumb.detachEveryConnection();
        jsPlumb.deleteEveryEndpoint();

        var par_cards = $(".card[attached]");
        for (var i=0;i<par_cards.length;i++) {
            var t_id = $(par_cards[i]).attr("id");
            var t_top = $(par_cards[i]).css("top");
            var chil = $(".card[parent="+t_id+"]");
            if (chil.length == 0) {
                $("#"+t_id).removeAttr("attached").css({
                    "position" : "static",
                    "margin-left" : "",
                    "top" : "",
                });
            } else if (t_top != (chil.length*20)+"px") {
                var space = 20, x=0, left="";
                for (var i=0;i<chil.length;i++) {
                    $(chil[i]).css({
                        "margin-left" : left,
                        "top": x+"px",
                    });
                    x+=space;
                    if (left=="") {
                        left = (($("#"+t_id).width()+5)*-1)+"px";
                    }
                }
                $("#"+t_id).attr("attached", "true").css({
                    "position" : "relative",
                    "margin-left" : left,
                    "top" : (x>0) ? x+"px" : "",
                });
            }
        }

        var offset = {};
        $(".counter").each(function() {
            var par = $(this).attr("parent");
            var x = $("#"+par).position();
            if (par in offset) {
                offset[par]++;
            } else {
                offset[par] = 0;
            }
            offset[par]
            $(this).css({
                "top": x.top+(40*offset[par])+20,
                "left": x.left+25,
            });
        });
    }
    function setLife(z) {
        if (z.uid == p.uid) {
            if ($("#own_life").length > 0) {
                $("#own_life").text(z.life);
            } else {
                $("<div />", {
                    id: "own_life"
                }).click(function() {
                    var valL = $(this).text();
                    if (valL!="") {
                        var x = $("<input />", {
                            id: "own_life_change",
                            type: "number",
                            value: valL,
                        }).blur(function() {
                            gs.json.send({
                                uid: z.uid,
                                type: "life",
                                life: $(this).val()
                            });
                        });
                        $(this).html(x);
                    }
                }).text(z.life).appendTo("#own_player");
            }
        } else {
            if ($("#opp_life").length > 0) {
                $("#opp_life").text(z.life);
            } else {
                $("<div />", {
                    id: "opp_life"
                }).click(function() {
                    var valL = $(this).text();
                    if (valL!="") {
                        var x = $("<input />", {
                            id: "opp_life_change",
                            type: "number",
                            value: valL,
                        }).blur(function() {
                            gs.json.send({
                                uid: z.uid,
                                type: "life",
                                life: $(this).val()
                            });
                        });
                        $(this).html(x);
                    }
                }).text(z.life).appendTo("#opp_player");
            }
        }
    }

    function showGameStarter(m) {
        if ($("#game_start").length == 0) {
            var x = $("<div id='game_start' />");
            var start_btn = $("<button />",
                {
                    text: "Start Game",
                    click: function () {
                        gs.json.send({
                            type: "game_start"
                        });
                    }
                }
            ).appendTo(x);
            $("#hud").append(x);
        }
    }
    function killstart(m) {
        $("#game_start").remove();
    }
    function killpass(m) {
        $("#pass_phase").remove();
    }

    function setupBattlefield(x) {
        if (typeof x === 'undefined') {
            x ="#own_battle"
        }
        var field = "<div id='creatures' class='zone' style='height:"+((2*row_height)-buffer0)+"px;'>&nbsp;</div>";
        field += "<div id='other' class='zone' style='height:"+((2*row_height)-buffer0)+"px;'>&nbsp;</div><br />";
        field += "<div id='lands' class='zone' style='height:"+(row_height-buffer0)+"px;'>&nbsp;</div>";
        field += "<div id='auras' class='zone' style='height:"+(row_height-buffer0)+"px;'>&nbsp;</div>";
        $(x).html(field);
    }

    function activateBattlefield() {
        $("#own_battle").droppable({
            accept: ".card",
            hoverClass: "drop_highlight",
            drop: function(event, ui) {
                console.dir(event);
                console.dir(ui);
                var y = ui.draggable[0].id;
                gs.json.send({
                    uid: p.uid,
                    type: "play",
                    c_uuid: y
                });
            }
        });
    }

    function allowPlay() {
        activateBattlefield();
        $("#own_hand").sortable({
            cursorAt: { top: 50, left: 50 },
        });
        $("#own_hand .card").unbind("click").click(function() {
            if ($(this).hasClass("active")) {
                gs.json.send({
                    uid: p.uid,
                    type: "play",
                    c_uuid: this.id
                });
                $(".card").removeClass("active");
            } else {
                $(".card").removeClass("active");
                $(this).addClass("active");
            }
        });
        $("#own_battle .card").unbind("click").click(function() {
            var tapped = $(this).hasClass("tapped");
            if (!tapped) {
                //$(this).addClass("tapped");
                gs.json.send({
                    uid: p.uid,
                    type: "tap",
                    c_uuid: this.id,
                });
            } else {
                //$(this).removeClass("tapped");
                gs.json.send({
                    uid: p.uid,
                    type: "untap",
                    c_uuid: this.id,
                });
            }
        });
    }
    function disallowPlay() {
        //$("#own_battle").droppable( "disable" );
        $("#own_hand .card").unbind("click");
        $("#own_battle .card").unbind("click");
    }
    function openStack(title) {
        var stack_title = (typeof title === 'undefined') ? "Stack" : title;
        if ($("#stack").length < 1) { /*create it*/
            $("<div />", {
                id: "stack",
            }).wijdialog({
                closeOnEscape: false,
                title: stack_title,
                zIndex: 500,
                captionButtons: {
                    pin: {visible: true, click: self.pin, iconClassOn: 'ui-icon-pin-w', iconClassOff:'ui-icon-pin-s'},
                    refresh: {visible: false},
                    toggle: {visible: false},
                    minimize: {visible: true, click: self.minimize, iconClassOn: 'ui-icon-minus'},
                    maximize: {visible: false},
                    close: {visible: false}
                },
            });
        } else {
            $("#stack").wijdialog ("open");
        }
    }
    function closeStack() {
        if ($("#stack .card").length == 0) {
            $("#stack").wijdialog ("close");
        }
    }

    function tapCard(m) {
        $("#"+m.card_uuid).addClass("tapped");
    }
    function untapCard(m) {
        $("#"+m.card_uuid).removeClass("tapped");
    }
    function untapAll(m) {
        if (m.owner == p.uid) {
            $("#own_battle .card").removeClass("tapped");
        } else {
            $("#"+m.owner+" .card").removeClass("tapped");
        }
    }

    function targetCard(m) {
        if (m.owner != p.uid) {
            jsPlumb.bind("ready", function() {
                    var aa = jsPlumb.addEndpoint(m.from, {
                            anchor: [ "Center", { shape:"circle" } ],
                    }), ab = jsPlumb.addEndpoint(m.to, {
                            anchor: [ "Center", { shape:"circle" } ],
                            endpoint:"Blank"
                        });
                    
                    jsPlumb.connect({source:aa, target:ab});
            });
        }
    }

    function setCounter(m) {
        var x = $("#"+m.parent).position();
        var div_id = m.parent+"-"+m.c_type+"-counter";
        var offset = $(".counter[parent="+m.parent+"]").length;
        if ($("#"+div_id).length==0) {
            var d = $("<div />", {
                id: div_id,
                class: "counter",
            }).css({
                "position": "absolute",
                "top": x.top+(40*offset)+20,
                "left": x.left+25,
                "color": "white",
                "background-color": "black",
            }).attr("parent", m.parent);
            var e = $("<img />", {
                src: "http://mtgdecko.com/img/"+m.c_type+".png",
                height: "32px",
                width: "32px",
            }).appendTo(d);
            var f = $("<span />", {
                class: "qty",
                text: m.qty,
            }).appendTo(d);
        } else {
            $("#"+div_id+" .qty").text(m.qty);
        }
        $("#own_battle").prepend(d);
    }
    this.setCounter = setCounter;

    function attachCard(m) {
        $("#"+m.child).attr("parent", m.parent).css({
            "position": "relative",
        }).insertBefore("#"+m.parent);
        var space = 20, x=0, left="";
        var aLst = $(".card[parent="+m.parent+"]");
        for (var i=0;i<aLst.length;i++) {
            $(aLst[i]).css({
                "margin-left" : left,
                "top": x+"px",
            });
            x+=space;
            if (left=="") {
                left = (($("#"+m.child).width()+5)*-1)+"px";
            }
        }
        $("#"+m.parent).attr("attached", "true").css({
            "position" : "relative",
            "margin-left" : left,
            "top" : (x>0) ? x+"px" : "",
        });
    }

    function playerDraw(m) {
        if (typeof m.draw !== 'undefined') {
            p.Draw(m.draw);
        }
    }
    function boardClear() {
        for (var i=0;i<zones.p.length;i++) {
            zones.p[i].clear();
        }
        zones.stack = [];
        zones.battle = [];
        zones.exile = [];

        $(".card").remove();
        $(".graveyard").remove();
        $("#exile").remove();
        $("#stack").remove();
    }
    function setBoardState(m) {
        if (typeof m.hand !== 'undefined') {
            $("#own_hand").empty();
            p.setHand(m.hand);
            $("#own_player").text(p.name);
        }
        if (typeof m.players !== 'undefined') {
            for(var n=0; n<m.players.length; n++) {
                var x = m.players[n];
                if (p.uid != x.uid && $("#"+x.uid).length == 0) {
                    var y = $("<div />", {
                        id: x.uid,
                        class: "battlefield",
                    }).css({
                        "height": client.bf_height+"px",
                        "top": client.t.top,
                        "-webkit-transform": "rotate(180deg)",
                    }).insertBefore("#own_battle");
                    $("<div />", {
                        id: "opp_player",
                        class: "player"
                    }).text(x.name).appendTo("#wrapper");
                    $("#own_battle").css("height", bf_height+"px");
                    if (!getPlayer(x.uid)) {
                        zones.p.push(new Player(x.uid, x.name));
                    }
                }
                getPlayer(x.uid).deck_id = x.deck_id;
                setupBattlefield("#"+x.uid);
            }
            if ($(".battlefield").length > 1) {
                $(".zone").css("height", row_height+"px");
            }
        }
        if (typeof m.public !== 'undefined') {
            for(var n=0; n<m.public.length; n++) {
                var x = m.public[n];
                var p_uid = x.player;
                var g = x.graveyard;
                var tks = x.tokens;
                var g_sel = "#"+p_uid+"-graveyard";

                if (g.length > 0) {
                    if ($(g_sel).length < 1) { /*create it*/
                        $("<div />", {
                            id: p_uid+"-graveyard",
                            class: "graveyard",
                        }).wijdialog({
                            closeOnEscape: false,
                            title: x.name+"'s Graveyard",
                            zIndex: 500,
                            captionButtons: {
                                pin: {visible: true, click: self.pin, iconClassOn: 'ui-icon-pin-w', iconClassOff:'ui-icon-pin-s'},
                                refresh: {visible: false},
                                toggle: {visible: false},
                                minimize: {visible: true, click: self.minimize, iconClassOn: 'ui-icon-minus'},
                                maximize: {visible: false},
                                close: {visible: false}
                            },
                        });
                    } else {
                        $(g_sel).wijdialog ("open");
                    }

                    for (var q=0; q<g.length; q++) {
                        var z = g[q];
                        var temp = new Card({'uuid':z.uuid, 'card_id':z.card_id});
                        temp.move(g_sel);
                        getPlayer(p_uid).graveyard.push(temp);
                    }
                }
                if (tks.length > 0) {
                    for (var q=0; q<tks.length; q++) {
                        var z = tks[q];
                        var temp = new Token({'uuid':z.uuid, 'token_id':z.token_id});
                        var move_zone = (p_uid == p.uid) ? "#own_battle #creatures" : "#" + z.owner + " #creatures";
                        temp.move(move_zone);
                        getPlayer(p_uid).tokens.push(temp);
                    }
                }
            }
        }
        if (typeof m.stack !== 'undefined' && m.stack.length > 0) {
            openStack();

            for(var n=0; n<m.stack.length; n++) {
                var x = m.stack[n];
                var temp = new Card({'uuid':x.uuid, 'card_id':x.card_id});
                temp.move("#stack");
                zones.stack.push(temp);
            }
        }
        if (typeof m.battle !== 'undefined' && m.battle.length > 0) {
            for(var n=0; n<m.battle.length; n++) {
                var x = m.battle[n];
                var temp = new Card({'uuid':x.uuid, 'card_id':x.card_id});
                var b_zone = (x.owner == p.uid) ? "#own_battle " : "#"+x.owner+" ";
                temp.move(b_zone + x.to_area);
                zones.battle.push(temp);
                if (typeof x.counters !== 'undefined' && x.counters.length > 0) {
                    for(var o=0;o<x.counters.length;o++) {
                        var ctr = x.counters[o];
                        setCounter(ctr);
                    }
                }
            }
        }
    }

    function getPlay(m) {
        if (m.owner != p.uid) {
            var temp = new Card({'uuid':m.card_uuid, 'card_id':m.card_id});
            if (m.to_area != "#stack") {
                zones.battle.push(temp);
                temp.move("#"+m.owner+" "+m.to_area);
            } else {
                openStack();
                zones.stack.push(temp);
                temp.move(m.to_area);
            }
            $("#chat").append("<div>Opponent cast " + temp.name + "</div>");
        } else {
            var x = p.getCard(m.card_uuid);
            $("#"+x.uuid).unbind("click");
            if (m.to_area != "#stack") {
                var z = $(b_zone+m.to_area+" img[alt='"+x.name+"']");
                var b_zone = (m.owner == p.uid) ? "#own_battle " : "#"+m.owner+" ";
                if (z.length > 0) {
                    var t_card = $("#"+x.uuid);
                    z.last().after(t_card.css({
                        "margin-left" : (t_card.width()*5/-6),
                        "margin-top" : "15px"
                    }));
                } else {
                    x.move(b_zone+m.to_area);
                }
                zones.battle.push(x);
                /*
                closeStack();
                */
            } else {
                openStack();
                x.move(m.to_area);//to stack, no b_zone required
                zones.stack.push(x);
            }
            $("#chat").append("<div>You cast " + x.name + "</div>");
        }
    }

    function addTokens(m) {
        /*
        'type': 'token',
        'owner': m['uid'],
        'tokens': tokens,
            "uuid": str(uuid.uuid1()),
            "token_id": m['t_id'],
         */
        var move_zone = "#own_battle #creatures";
        if (p.uid != m.owner) {
            move_zone = "#" + m.owner + " #creatures";
        }
        for (var i=0;i<m.tokens.length;i++) {
            var x = new Token(m.tokens[i]);
            x.move(move_zone);
            getPlayer(m.owner).tokens.push(x);
        }

    }

    function handleMove(m) {
        /*
        'sentby': m['uid'],
        'type': 'move',
        'owner': p.u_id,
        'card_uuid': c.uuid,
        'card_id': c.id,
        'from': "#stack",
        'to_area': self.getZone(c.type)
        */
        var move_zone = "#no_view";
        var to_zone = "";
        var chk_attach = false;
        switch (m.to_area) {
            case "Hand":
                move_zone = (m.owner == p.uid) ? "#own_hand" : "#no_view";
                for (var i=0;i<zones.p.length;i++) {
                    if (zones.p[i].uid == m.owner) {
                        to_zone = zones.p[i].hand;
                        break;
                    }
                }
                break;
            case "Graveyard":
                if (playerIndex(m.owner)>=0) {
                    var x = getPlayer(m.owner);
                    var g_sel = "#"+m.owner+"-graveyard";
                    if ($(g_sel).length < 1) { /*create it*/
                        $("<div />", {
                            id: m.owner+"-graveyard",
                            class: "graveyard",
                        }).wijdialog({
                            closeOnEscape: false,
                            title: x.name+"'s Graveyard",
                            zIndex: 500,
                            captionButtons: {
                                pin: {visible: true, click: self.pin, iconClassOn: 'ui-icon-pin-w', iconClassOff:'ui-icon-pin-s'},
                                refresh: {visible: false},
                                toggle: {visible: false},
                                minimize: {visible: true, click: self.minimize, iconClassOn: 'ui-icon-minus'},
                                maximize: {visible: false},
                                close: {visible: false}
                            },
                        });
                    } else {
                        $(g_sel).wijdialog ("open");
                    }
                    to_zone = x.graveyard;
                    move_zone = g_sel;
                }
                break;
            case "Library":
                for (var i=0;i<zones.p.length;i++) {
                    if (zones.p[i].uid == m.owner) {
                        to_zone = zones.p[i].library;
                        break;
                    }
                }
                break;
            case "Exile":
                if ($("#exile").length < 1) { /*create it*/
                    $("<div />", {
                        id: "exile",
                    }).wijdialog({
                        closeOnEscape: false,
                        title: "Exile",
                        zIndex: 500,
                        captionButtons: {
                            pin: {visible: true, click: self.pin, iconClassOn: 'ui-icon-pin-w', iconClassOff:'ui-icon-pin-s'},
                            refresh: {visible: false},
                            toggle: {visible: false},
                            minimize: {visible: true, click: self.minimize, iconClassOn: 'ui-icon-minus'},
                            maximize: {visible: false},
                            close: {visible: false}
                        },
                    });
                } else {
                    $("#exile").wijdialog ("open");
                }
                to_zone = zones.exile;
                move_zone = "#exile";
                break;
            case "#stack":
            case "Stack":
                to_zone = zones.stack;
                move_zone = "#stack";
                break;
            default:
                move_zone = (m.owner == p.uid) ? "#own_battle" : "#"+m.owner;
                move_zone += " " + m.to_area;
                to_zone = zones.battle;
                chk_attach = true;
                break;
        }
        var temp = getACard(m.card_uuid);
        temp.move(move_zone);
        if(jsPlumb.getConnections().length > 0 && $.inArray(temp.subtype, Card.auras)>=0) {
            var con = jsPlumb.getConnections()[0];
            //var a_details = temp.attach();
            gs.json.send({
                uid: p.uid,
                type: "attach",
                parent: con.targetId,
                child: con.sourceId,
            });
        }
        to_zone.push(temp);
        closeStack();
    }

    function handlePriority(m) {
        killpass();
        if (m.owner != p.uid) {
            $("#stack").wijdialog("option", "buttons", "");
            disallowPlay();
        } else {
            if (zones.stack.length < 1) { /*We're passing phases*/
                openStack("Passing Phase");
            }
            $("#stack").wijdialog("option", "buttons", [{
                text: "Resolve",
                click: function() {
                    gs.json.send({
                        uid: p.uid,
                        type: "pass"
                    });
                    $("#stack").wijdialog("option", "buttons", "");
                }
            }]);
            allowPlay();
        }
    }

    function askMulligan() {
        if ($("#askMulligan").length == 0) {
            var x = $("<span id='askMulligan' />");
            var mull_btn = $("<button />",
                {
                    text: "Mulligan",
                    click: function () {
                        gs.json.send({
                            uid: p.uid,
                            type: "mulligan"
                        });
                        $("#askMulligan").remove();
                    }
                }).appendTo(x);
            var continue_btn = $("<button />",
                {
                    text: "Continue",
                    click: function () {
                        gs.json.send({
                            uid: p.uid,
                            type: "ready"
                        });
                        $("#askMulligan").remove();
                    }
                }).appendTo(x);
            //x.appendTo('#hud');
            $("#hud").prepend(x);
        }
    }

    function showDeckSelection() {
        $.getJSON("/getDeck/" + p.uid, function(data) {
            var b_colors = ["Khaki", "blue", "black", "red", "DarkGreen", "SlateGray", "Lime", "Aqua"];
            var colors = ["black", "white", "white", "white", "yellow", "black", "red", "black"];

            boardClear();
            $(".battlefield[id!=own_battle]").remove();
            $("#own_battle").css({
                "height": 2*bf_height,
                "top": t.top
            });

            var s = $('<div />', {
                id: "deck_wrapper",
                width: "100%",
                height: "100%",
            });
            /*.change(function() {

                $(this).remove();
            });*/
            //$('<option />', {value: "", text: "Select a Deck"}).appendTo(s);
            for(var n=0; n<data.length; n++) {
                $('<div />', {
                    text: data[n].name,
                    class: "deck_card",
                    id: "deck|"+data[n].id
                }).css({
                    "background-color": b_colors[n%b_colors.length],
                    "color": colors[n%colors.length],
                }).click(function() {
                    if ($(this).hasClass("active")) {
                        var d = this.id.split("|")[1];

                        gs.json.send({
                            uid: p.uid,
                            type: "join",
                            deck_id: d
                        });
                    } else {
                        $(".deck_card").removeClass("active");
                        $(this).addClass("active");
                        //alert(this.id.split("|")[1]);
                    }
                }).disableSelection().appendTo(s);
            }
            //s.appendTo('#hud');
            $("#own_battle").html(s);
        }).error(function() { alert("error"); });
    }

    function gameStart(m) {
        p.setState("in_game");
    }

    function reInitialize(m) {
        p.uid = m.uid;
        //alert("uid::" + m.uid);
        console.dir(m);
        if (m.state != "connected") {
            setupBattlefield();
        }
        setPlayerState(m);
    }

    function message(m) {
        //alert(m.msg);
		$("#chat").append("<div>"+m.msg+"</div>");
    }

    run = {
        "reinit": reInitialize,
        "msg": message,
        "killstart": killstart,
        "state": setPlayerState,
        "phase": setPhase,
        "ready": showGameStarter,
        "board": setBoardState,
        "draw": playerDraw,
        "play": getPlay,
        "token": addTokens,
        "counter": setCounter,
        "tap": tapCard,
        "untap": untapCard,
        "untap_all": untapAll,
        "target": targetCard,
        "attach": attachCard,
        "move": handleMove,
        "priority": handlePriority,
        "game_start": gameStart,
        "board_clear": boardClear,
    };

	gs.on('message', function(data) {
        //alert(data);
		$("#chat").append("<div class='debug'>" + data + "</div>");
        toggleDebug();
        var m = $.parseJSON(data);
        if (typeof m.type !== 'undefined') {
            run[m.type](m);
        }
        else {
            alert("No type found!\r\n" + data);
        }
	});

    $(document).bind('keypress', 'Shift+d', function() {
        gs.json.send({
            uid: p.uid,
            type: "draw",
        });
    }).bind('keypress', 'x', function() {
        gs.json.send({
            uid: p.uid,
            type: "phase_next",
        });
    }).bind('keypress', 'Shift+x', function() {
        gs.json.send({
            uid: p.uid,
            type: "turn_next",
        });
    }).bind('keypress', 'Shift+p', function() {
        gs.json.send({
            uid: p.uid,
            type: "pass",
        });
    });
}
/*
if (document.addEventListener) {
    document.addEventListener('contextmenu', function(e) {
        alert("You've tried to open context menu"); //here you draw your own menu
        e.preventDefault();
    }, false);
} else {
    document.attachEvent('oncontextmenu', function() {
        alert("You've tried to open context menu");
        window.event.returnValue = false;
    });
}
*/
function showMenu(event) {
     /*  check whether the event is a right click 
       *  because different browser (ahem IE) assign different numbers to the keys to
       *  your mouse buttons and different values to the event, you'll have to do some evaluation
       */
    var rightclick; //will be set to true or false
    if (typeof event.button !== 'undefined') {
        rightclick = (event.button == 2);
    } else if (e.button !== 'undefined') {
        rightclick = (event.which == 3);
    }

    if(rightclick) { //if the secondary mouse botton was clicked
        e = event;
        var menu = $("#menu");

        var x = e.clientX; //get X and Y coordinance for menu position
        var y = e.clientY;

        var sel = $("#"+e.srcElement.id);
        var par = $("#"+e.srcElement.id).parent();
        var type = "";
        var c_area = "";
        if (sel.hasClass("card")) {
            type = "card";
            $("#chat").append("<div class='debug'>Right clicked a CARD, id='"+sel[0].id+"'</div>");
            toggleDebug();
        } else if (sel.hasClass("battlefield")) {
            type = "battlefield";
            $("#chat").append("<div class='debug'>Right clicked a BATTLEFIELD, id='"+sel[0].id+"'</div>");
            toggleDebug();
        }
        var par_id = par[0].id;
        if (par_id == "stack") {
            c_area = "Stack";
        } else if (par_id == "own_hand") {
            c_area = "Hand";
        } else if (par_id == "exile") {
            c_area = "Exile";
        } else if (par_id.match("graveyard$")) {
            c_area = "Graveyard";
        } else {
            c_area = "Battle";
        }

        buildMenu(type, sel[0].id, c_area);
        //alert(sel);
        $("#menu").css({
            'position': 'fixed',
            'top': y+'px',
            'left': x+'px',
            'visibility': 'visible'
        });

        //This section is necessary if you click on the far right edge or bottom
        //The 200 is arbitrary, choose whatever number you want based on how large your menu is
        /*
        if(window.innerWidth) {
            windowWidth = window.innerWidth;
            windowHeight = window.innerHeight;
        } else if(document.documentElement.clientWidth) {
            windowWidth = document.documentElement.clientWidth;
            windowHeight = document.documentElement.clientHeight;
        } else {
            windowWidth = document.getElementsByTagName('body')[0].clientWidth;
            windowHeight = document.getElementsByTagName('body')[0].clientHeight;
        }
        if(windowWidth < (x + 200)) {
            x = x - 200;
        }
        if(windowHeight < (y + 200)) {
            y -= 200;
        }
        */

        //position the menu
        //menu.style.position = "fixed"; // use fixed or it will not work when the window is scrolled
        //menu.style.top = y+"px";
        //menu.style.left= x+"px";
    } else {
        clearMenu();
    }
}
 
function clearMenu() { //used to make the menu disappear
     //this function should be used at the beginning of any function that is called from the menu
     //var menu = document.getElementById('menu');
     //menu.style.display = "none"; //don't show menu
     $("#menu").css({
         'visibility': 'hidden'
     });
}

function buildMenu(t, e_id, e_area) {
    var menu = "";
    var  area_lst = ["Hand", "Graveyard", "Battle", "Library", "Exile"]; //omit Stack
    switch(t) {
        case "card":
            $("#menu").html("").append(
                $("<li />", {
                    id: "Tap",
                    text: "Tap",
                    class: "menu-item",
                }).click(function () {
                    clearMenu();
                    var tapped = $("#"+e_id).hasClass("tapped");
                    if (!tapped) {
                        //$(this).addClass("tapped");
                        gs.json.send({
                            uid: client.p.uid,
                            type: "tap",
                            c_uuid: e_id,
                        });
                    } else {
                        //$(this).removeClass("tapped");
                        gs.json.send({
                            uid: client.p.uid,
                            type: "untap",
                            c_uuid: e_id,
                        });
                    }
                    //alert("Tapping, then");
                })
            ).append(
                $("<li />", {
                    id: "Target",
                    text: "Target",
                    class: "menu-item",
                }).click(function () {
                    clearMenu();
                    jsPlumb.addEndpoint(e_id, {
                        isSource:true,
                        anchor: [ "Center", { shape:"circle" } ],
                        deleteEndpointsOnDetach: true,
                        maxConnections:-1,
                    });
                    jsPlumb.makeTarget($(".player"), {
                        endpoint:"Blank"
                    });
                    jsPlumb.makeTarget($(".battlefield .card"), {
                        endpoint:"Blank"
                    });
                    //alert("Targeting an object?");
                })
            ).append(
                $("<li />").append("<hr />")
            ).append(
                $("<li />", {
                    id: "counterPlus",
                    text: "+1",
                    class: "menu-item",
                }).click(function () {
                    gs.json.send({
                        uid: client.p.uid,
                        type: "counter",
                        parent: e_id,
                        c_type: "Plus",
                    });
                    clearMenu();
                })
            ).append(
                $("<li />", {
                    id: "counterMinus",
                    text: "-1",
                    class: "menu-item",
                }).click(function () {
                    gs.json.send({
                        uid: client.p.uid,
                        type: "counter",
                        parent: e_id,
                        c_type: "Minus",
                    });
                    clearMenu();
                })
            ).append(
                $("<li />", {
                    id: "counterWhite",
                    text: "White",
                    class: "menu-item",
                }).click(function () {
                    gs.json.send({
                        uid: client.p.uid,
                        type: "counter",
                        parent: e_id,
                        c_type: "White",
                    });
                    clearMenu();
                })
            ).append(
                $("<li />", {
                    id: "counterBlue",
                    text: "Blue",
                    class: "menu-item",
                }).click(function () {
                    gs.json.send({
                        uid: client.p.uid,
                        type: "counter",
                        parent: e_id,
                        c_type: "Blue",
                    });
                    clearMenu();
                })
            ).append(
                $("<li />", {
                    id: "counterBlack",
                    text: "Black",
                    class: "menu-item",
                }).click(function () {
                    gs.json.send({
                        uid: client.p.uid,
                        type: "counter",
                        parent: e_id,
                        c_type: "Black",
                    });
                    clearMenu();
                })
            ).append(
                $("<li />", {
                    id: "counterRed",
                    text: "Red",
                    class: "menu-item",
                }).click(function () {
                    gs.json.send({
                        uid: client.p.uid,
                        type: "counter",
                        parent: e_id,
                        c_type: "Red",
                    });
                    clearMenu();
                })
            ).append(
                $("<li />", {
                    id: "counterGreen",
                    text: "Green",
                    class: "menu-item",
                }).click(function () {
                    gs.json.send({
                        uid: client.p.uid,
                        type: "counter",
                        parent: e_id,
                        c_type: "Green",
                    });
                    clearMenu();
                })
            ).append(
                $("<li />").append("<hr />")
            );
            
            for (var i=0;i<area_lst.length;i++) {
                if (e_area != area_lst[i]) {
                    (function(area_name) {
                        $("#menu").append(
                            $("<li />", {
                                id: "to"+area_name,
                                text: "To "+area_name,
                                class: "menu-item",
                            }).click(function () {
                                clearMenu();
                                client.sendMove(e_id, area_name, e_area);
                                //alert("Targeting an object?");
                            })
                        );
                    })(area_lst[i]);
                }
            }
            break;
        case "battlefield":
            $("#menu").html("");
            if ($("._jsPlumb_endpoint").length > 0) {
                $("#menu").append(
                    $("<li />", {
                        id: "clearTargets",
                        text: "Clear Targets",
                        class: "menu-item",
                    }).click(function () {
                        jsPlumb.detachEveryConnection();jsPlumb.deleteEveryEndpoint();
                        //alert("Tapping, then");
                    })
                );
            }
            break;
        default:
            $("#menu").html("");
            return;
    }

    $("#menu").append(
        $("<li />").append("<hr />")
    ).append(
        $("<li />", {
            id: "token",
            text: "Token",
            class: "menu-item",
        }).click(function () {
            $("#token_make").remove();
            $.ajax({
                type: "GET",
                async: false,
                url: "getTokens/" + client.p.deck_id,
                success: function(c)
                {
                    if (c != "") {
                        var qty = $("<select />", {
                            id: "token_qty"
                        }).css("display", "inline");
                        for (var i=1;i<11;i++) {
                            $("<option />", {
                                value: i,
                                text: i,
                            }).appendTo(qty);
                        }
                        var tokens = $("<select />").change(function() {
                            gs.json.send({
                                uid: client.p.uid,
                                type: "token",
                                qty: $("#token_qty").val(),
                                t_id: $(this).val()
                            });
                            $("#token_make").remove();
                        }).css("display", "inline");
                        $("<option />", {
                            value: "",
                            text: "SELECT A TOKEN"
                        }).appendTo(tokens);
                        var data = jQuery.parseJSON(c);
                        for(var i=0;i<data.length;i++)
                        {
                            var y = data[i];
                            $("<option />", {
                                value: y.id,
                                text: y.size+" "+y.type+" ["+y.card_name+"]",
                            }).appendTo(tokens);
                        }
                        $("<div />", {
                            id: "token_make",
                        }).append(qty).append(tokens).appendTo("#hud");
                    } else {
                        alert("Your deck makes no tokens!");
                    }
                }
            });
            clearMenu();
        })
    ).append(
        $("<li />").append("<hr />")
    ).append(
        $("<li />", {
            id: "btnConcede",
            text: "Concede",
            class: "menu-item",
        }).click(function () {
            clearMenu();
            client.showConcede();
        })
    ).append(
        $("<li />", {
            id: "btnSwitchDecks",
            text: "Change Deck",
            class: "menu-item",
        }).click(function () {
            clearMenu();
            client.deckChange();
        })
    );
}
function toggleDebug() {
    if ($("#toggle_debug :checkbox:checked").length == 0) {
        $("#chat .debug").hide();
    } else {
        $("#chat .debug").show();
    }
}
jsPlumb.ready(function() {
    jsPlumb.importDefaults({
        DragOptions : { cursor: 'pointer', zIndex:2000 },
        PaintStyle : { strokeStyle:'#d81417', lineWidth:5 },
        EndpointStyle : {
            width:25,
            height:25,
            strokeStyle:'#d81417',
            joinstyle:"round",
            lineWidth:10,
            //fillStyle:'#d81417',
        },
        Endpoint : "Rectangle",
        Anchors : ["Center", "Center"],
        Container : $("body"),
        Connector : [ "Bezier", { curviness: 150 } ],
        ConnectorZIndex  : 1000,
        ConnectionOverlays: [
            [ "Arrow", {
                foldback:0.5,
                location:1,
                width:30,
                length:60,
            }],
            [ "Label", { cssClass:"labelClass" } ]  
        ]
    });
    jsPlumb.bind("beforeDrop", function(e) {
        //alert("dropping");
        //var xx = e;
        gs.json.send({
            uid: client.p.uid,
            type: "target",
            from: e.sourceId,
            to: e.targetId,
        });
        return true;
    });     
});     
