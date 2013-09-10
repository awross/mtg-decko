<!doctype html>
<html>
    <head>
        <title>WebSockets Hello World</title>
        <meta charset="utf-8" />
        <style type="text/css">
            body {
                text-align: center;
                min-width: 500px;
            }
        </style>
        <script src="http://code.jquery.com/jquery.min.js"></script>
        <script>
            $(document).ready(function () {

                var ws;

                $("#open").click(function(evt) {
                    evt.preventDefault();

                    var host = $("#host").val();
                    var port = $("#port").val();
                    var uri = $("#uri").val();

                    ws = new WebSocket("ws://" + host + ":" + port + uri);
                    ws.onmessage = function(evt) {alert("message received: " + evt.data)};
                    ws.onclose = function(evt) { alert("Connection close"); };
                    ws.onopen = function(evt) { 
                        $("#host").css("background", "#00ff00"); 
                        $("#port").css("background", "#00ff00"); 
                        $("#uri").css("background", "#00ff00");
                    };
                });
            });
        </script>
    </head>

    <body>
        <h1>WebSockets Hello World</h1>
        <div>
            <label for="host">host:</label>
            <input type="text" id="host" value="184.56.21.127" style="background:#ff0000;"/><br />
            <label for="port">port:</label>
            <input type="text" id="port" value="5000" style="background:#ff0000;"/><br />
            <label for="uri">uri:</label>
            <input type="text" id="uri" value="/ws" style="background:#ff0000;"/><br />
            <input type="submit" id="open" value="open" />
        </div>
    </body>
</html>
