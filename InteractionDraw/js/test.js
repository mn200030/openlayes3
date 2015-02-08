window.onload = function() {
// ===================================================================
    var map = null,      // $BA4BN$NCO?^MQ$NJQ?t(B
        baseLayer = null,   // $BCOM}1!CO?^MQ$NJQ?t(B
        source = null,
        lineColor = '#ff0000', // red
        center_lon = 135.100303888, // $BCf?4$N7PEY!J?\Ka1:8x1`!K(B
        center_lat = 34.637674639, // $BCf?4$N0^EY!J?\Ka1:8x1`!K(B
        initZoom = 10, // $B%:!<%`$N=i4|CM(B
        minZoom  = 6,   // $B%:!<%`$N:G>.CM!J:G$b9-$$HO0O!K(B
        maxZoom  = 17,  // $B%:!<%`$N:GBgCM!J:G$b69$$HO0O!K(B
        initPrecision = 8, // $B:BI8I=<($N>.?tE@0J2<$N7e?t$N=i4|CM(B
        vector = null,
        view = new ol.View({projection: "EPSG:3857", maxZoom: maxZoom, minZoom: minZoom}),
        interactionDraw = null,
        latlons = document.getElementById('latlons');
// ===================================================================

    // $BCf?4$N;XDj!#(Bview$B$KBP$7$F;XDj!#(Btransform$B$rK:$l$J$$;v!#(B
    view.setCenter(ol.proj.transform([center_lon, center_lat], "EPSG:4326", "EPSG:3857"));
    view.setZoom(initZoom);

    baseLayer = new ol.layer.Tile({
        opacity: 1.0,
	source: new ol.source.XYZ({
        attributions: [new ol.Attribution({ html: "<a href='http://portal.cyberjapan.jp/help/termsofuse.html' target='_blank'>$B9qEZCOM}1!(B</a>" })],
	url: "http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", projection: "EPSG:3857"
	})
    });

    source = new ol.source.Vector();
    vector = new ol.layer.Vector({
       source: source,
       style: new ol.style.Style({
           stroke: new ol.style.Stroke({color:'#0000ff', width:2})
       })
    });

    // $BCO?^JQ?t(B(map$BJQ?t(B)$B$NDj5A!#COM}1!CO?^$rI=<($9$k$h$&$K;XDj$7$F$$$k(B
    map = new ol.Map({
        target:'map_canvas',
        layers:[baseLayer, vector],
        view: view,
        controls: ol.control.defaults().extend([new ol.control.ScaleLine(), new ol.control.ZoomSlider()]),
        interactions: ol.interaction.defaults()
    });

    featureOverlay = new ol.FeatureOverlay({
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({color: '#0000ff', width: 2})
        })
    });
    featureOverlay.setMap(map);

    var modify = new ol.interaction.Modify({
        features: featureOverlay.getFeatures(),
        // the SHIFT key must be pressed to delete vertices, so
        // that new vertices can be drawn at the same position
        // of existing vertices
        deleteCondition: function(event) {
            return ol.events.condition.shiftKeyOnly(event) &&
                ol.events.condition.singleClick(event);
        }
    });
    map.addInteraction(modify);

    // ol.interaction.Draw$B$NDI2C(B
    interactionDraw = new ol.interaction.Draw({
        features: featureOverlay.getFeatures(),
        type:'LineString'
    });
    map.addInteraction(interactionDraw);

    document.getElementById('clearAllLines').onclick = function() {
        latlons.value = '';
        // $B@~$r%/%j%"(B
        featureOverlay.getFeatures().clear();
    };

    document.getElementById('getLinedataFromText').onclick = function() {
        // $B%G!<%?$r%/%j%"(B
        featureOverlay.getFeatures().clear();

        // $B%F%-%9%H%G!<%?$+$i:BI8G[Ns$XF~$l$k(B
        var coordArray = [],
            lineData = latlons.value,
            singleLines = lineData.split("\n"),
            length = singleLines.length - 1;

        for (var i = 0 ; i < length ; i++) {
            if (singleLines[i].length > 0) {
                var beginLatlon = singleLines[i].split(',');
                var endLatlon = singleLines[i + 1].split(',');
                beginLatlon = parseFloat(beginLatlon);
                endLatlon = parseFloat(endLatlon);
                // $B%a%k%+%H%k:BI87O$KJQ49$7$F$+$iBeF~(B
                transformed = ol.proj.transform([beginLatlon, endLatlon], "EPSG:4326", "EPSG:3857");
                coordArray.push(transformed);
            }
        }
        // $B?7$7$$7PO)$N:n@.(B
        var geometry = new ol.geom.LineString(coordArray);
        // featureOverlay$B$K@~$N%G!<%?$rDI2C(B
        featureOverlay.addFeature(new ol.Feature({geometry: geometry}));
    }

    document.getElementById('displayPoints').onclick = function() {
            // array$B$G$O$J$/!"(Bol.Collection$B$J$N$GCm0UI,MW(B
        var features = featureOverlay.getFeatures(),
            length = features.getLength(),
            transform = ol.proj.transform;

        latlons.value = "";
        for (var i = 0; i < length ; i++) {
            // geometry$B$,6qBNE*$KIA2h$5$l$??^7A$rI=$9JQ?t(B
            // $B!V(Bgeometry$B!W$NCf$K$O(BLineString $B$H$$$&7A<0$N%G!<%?$,F~$C$F$$$k(B
            var geometry = (features.getArray())[i].getGeometry();

            // geometry$B$K!V(BgetCoordinate()$B!W$H$$$&4X?t$r:nMQ$5$;$k$H!$!VE@$NG[Ns!W!J(BcoordArray$B!K$,F@$i$l$k!#(B
            // coordArray $B$O!$7PEY$H0^EY$rMWAG$K;}$D!V:BI8!J(Bol.Coordinate$B!K!W%?%$%W$N%G!<%?$NG[Ns(B
            var coordArray = geometry.getCoordinates();
            var l = coordArray.length;
            for (var j = 0; j < l; j++) {
                latlons.value += transform(coordArray[j],"EPSG:3857", "EPSG:4326").toString() + "\n"; 
            }
            latlons.value += '\n';
        }
    };
};
