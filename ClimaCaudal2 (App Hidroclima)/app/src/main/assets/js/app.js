jsPlumb.ready(function () {

    var instance = window.jsp = jsPlumb.getInstance({
        // default drag options
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
        // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
        ConnectionOverlays: [
            [ "Arrow", {
                location: 1,
                visible:true,
                width:11,
                length:11,
                id:"ARROW",
                events:{
                    click:function() { alert("you clicked on the arrow overlay")}
                }
            } ]
        ],
        Container: "canvas"
    });

    var basicType = {
        connector: "StateMachine",
        paintStyle: { stroke: "red", strokeWidth: 4 },
        hoverPaintStyle: { stroke: "blue" },
        overlays: [
            "Arrow"
        ]
    };
    instance.registerConnectionType("basic", basicType);

    // this is the paint style for the connecting lines..
    var connectorPaintStyle = {
            strokeWidth: 2,
            stroke: "#61B7CF",
            joinstyle: "round",
            outlineStroke: "white",
            outlineWidth: 2
        },
    // .. and this is the hover style.
        connectorHoverStyle = {
            strokeWidth: 3,
            stroke: "#216477",
            outlineWidth: 5,
            outlineStroke: "white"
        },
        endpointHoverStyle = {
            fill: "#216477",
            stroke: "#216477"
        },
    // the definition of source endpoints (the small blue ones)
        sourceEndpoint = {
            endpoint: "Dot",
            paintStyle: {
                stroke: "#7AB02C",
                fill: "transparent",
                radius: 7,
                strokeWidth: 1
            },
            isSource: true,
            connector: [ "Flowchart", { stub: [10, 10], gap: 5, cornerRadius: 0, alwaysRespectStubs: false } ],
            connectorStyle: connectorPaintStyle,
            hoverPaintStyle: endpointHoverStyle,
            connectorHoverStyle: connectorHoverStyle,
            dragOptions: {},
        },
    // the definition of target endpoints (will appear when the user drags a connection)
        targetEndpoint = {
            endpoint: "Dot",
            paintStyle: { fill: "#7AB02C", radius: 7 },
            hoverPaintStyle: endpointHoverStyle,
            maxConnections: -1,
            dropOptions: { hoverClass: "hover", activeClass: "active" },
            isTarget: true,
            /*overlays: [
                [ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible:false } ]
            ]*/
        },
        init = function (connection) {
            //connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
        };

    var _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
        for (var i = 0; i < sourceAnchors.length; i++) {
            var sourceUUID = toId + sourceAnchors[i];
            var ep = instance.addEndpoint("flowchart" + toId, sourceEndpoint, {
                anchor: sourceAnchors[i], uuid: sourceUUID
            });
            ep.setEnabled(false);
        }
        for (var j = 0; j < targetAnchors.length; j++) {
            var targetUUID = toId + targetAnchors[j];
            var ep = instance.addEndpoint("flowchart" + toId, targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
            ep.setEnabled(false);
        }
    };

    // suspend drawing and initialise.
    instance.batch(function () {

        _addEndpoints("Window8", [], ["TopCenter", "RightMiddle","LeftMiddle"]);
		_addEndpoints("Window7", [], ["TopCenter", "RightMiddle"]);
		_addEndpoints("Window6", [], ["BottomCenter"]);
		_addEndpoints("Window5", [], ["LeftMiddle", "RightMiddle"]);
		_addEndpoints("Window4", [], ["TopCenter", "BottomCenter"]);
        _addEndpoints("Window2", [], ["TopCenter", "BottomCenter"]);
        _addEndpoints("Window3", [], ["RightMiddle", "TopCenter"]);
        _addEndpoints("Window1", [], ["LeftMiddle", "RightMiddle", "BottomCenter"]);

        // listen for new connections; initialise them the same way we initialise the connections at startup.
        instance.bind("connection", function (connInfo, originalEvent) {
            init(connInfo.connection);
        });

        // connect a few up
        instance.connect({uuids: ["Window1LeftMiddle", "Window2TopCenter"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [10, 10], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window1BottomCenter", "Window5LeftMiddle"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [10, 10], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window1RightMiddle", "Window3TopCenter"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [10, 10], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window2BottomCenter", "Window4TopCenter"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [10, 10], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window4BottomCenter", "Window1TopCenter"], enabled:false, editable: false,  connector: [ "Flowchart", { stub: [10, 10], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window3BottomCenter", "Window1BottomCenter"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [10, 10], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window3RightMiddle", "Window8RightMiddle"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [15, 15], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window5RightMiddle", "Window8RightMiddle"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [15, 15], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window6BottomCenter", "Window8TopCenter"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [15, 15], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window8LeftMiddle", "Window7RightMiddle"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [15, 15], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window4BottomCenter", "Window7TopCenter"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [15, 15], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        //

    });

    jsPlumb.fire("jsPlumbDemoLoaded", instance);

                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth()+1; //January is 0!

                var yyyy = today.getFullYear();
                if(dd<10){
                    dd='0'+dd;
                }
                if(mm<10){
                    mm='0'+mm;
                }
                var today = yyyy + '-' + mm + '-' + dd;
                $("#fecha").val(today);

                $.ajax({
                				url: "http://hclima.org/public/getPCHs",
                				cache: false,
                				crossDomain: true
                }).done(function(data){
                    var i = 0;
                    for(i = 0; i < data.length; i++)
                    {
                        $("#pch").append($("<option />").val(data[i].idpch).text(data[i].nombre_pch));
                    }
                    $("#pch").val(idpch);
                });

                $.ajax({
    				url: "http://hclima.org/public/getResultadosPCH",
    				cache: false,
    				crossDomain: true,
    				data: {"idpch":Android.getIdPch(),"fecha":today}
    			}).done(function(data){
    			    //console.log(data);
    			    if(data.length>1){
                        pronostico = data;
                        $('#qentrada').html(data[0][2][0]);
                        $('#qcaptacion').html(data[0][4][0]);
                        $('#qecologico').html(data[0][10][0]);
                        $('#qturbina').html(data[0][7][0]);
                        $('#qexcedente').html(data[0][3][0]);
                        $('#qincremental').html(data[0][5][0]);
                        $('#qsalida').html(data[0][8][0]);
                        $('#qtramo').html(data[0][6][0]);
                        $('#potencia').html("<strong>Potencia aproximada:</strong> " + data[0][9][0]);

                        $('#ppm24h').html(data[0][1][0]);
                        $('#ppm48h').html(data[0][1][1]);
                        $('#ppm72h').html(data[0][1][2]);

                        $('#escorrentia24h').html(data[0][2][0]);
                        $('#escorrentia48h').html(data[0][2][1]);
                        $('#escorrentia72h').html(data[0][2][2]);

                        $('#qturbina24h').html(data[0][7][0]);
                        $('#qturbina48h').html(data[0][7][1]);
                        $('#qturbina72h').html(data[0][7][2]);

                        $('#potencia24h').html(data[0][9][0]);
                        $('#potencia48h').html(data[0][9][1]);
                        $('#potencia72h').html(data[0][9][2]);
                    }else{
                        var today = new Date();
                        today.setDate(today.getDate() - 1);
                        dd = today.getDate();
                        mm = today.getMonth()+1; //January is 0!

                        yyyy = today.getFullYear();
                        if(dd<10){
                           dd='0'+dd;
                        }
                        if(mm<10){
                           mm='0'+mm;
                        }
                        today = yyyy + '-' + mm + '-' + dd;
                        $("#fecha").val(today);
                        $.ajax({
                            url: "http://hclima.org/public/getResultadosPCH",
                            cache: false,
                            crossDomain: true,
                            data: {"idpch":Android.getIdPch(),"fecha":today}
                         }).done(function(data){
                            pronostico = data;
                            $('#qentrada').html(data[0][2][0]);
                            $('#qcaptacion').html(data[0][4][0]);
                            $('#qecologico').html(data[0][10][0]);
                            $('#qturbina').html(data[0][7][0]);
                            $('#qexcedente').html(data[0][3][0]);
                            $('#qincremental').html(data[0][5][0]);
                            $('#qsalida').html(data[0][8][0]);
                            $('#qtramo').html(data[0][6][0]);
                            $('#potencia').html("<strong>Potencia aproximada:</strong> " + data[0][9][0]);

                            $('#ppm24h').html(data[0][1][0]);
                            $('#ppm48h').html(data[0][1][1]);
                            $('#ppm72h').html(data[0][1][2]);

                            $('#escorrentia24h').html(data[0][2][0]);
                            $('#escorrentia48h').html(data[0][2][1]);
                            $('#escorrentia72h').html(data[0][2][2]);

                            $('#qturbina24h').html(data[0][7][0]);
                            $('#qturbina48h').html(data[0][7][1]);
                            $('#qturbina72h').html(data[0][7][2]);

                            $('#potencia24h').html(data[0][9][0]);
                            $('#potencia48h').html(data[0][9][1]);
                            $('#potencia72h').html(data[0][9][2]);
                         });
                    }
    			})
    			.fail(function(){

    			});
});