window.onload = function() {
    // ===================================================================
    var center_lon = 135.100303888; // $BCf?4$N7PEY!J?\Ka1:8x1`!K(B
    var center_lat = 34.637674639; // $BCf?4$N0^EY!J?\Ka1:8x1`!K(B

    var initZoom = 10; // $B%:!<%`$N=i4|CM(B
    var MinZoom  = 6;   // $B%:!<%`$N:G>.CM!J:G$b9-$$HO0O!K(B
    var MaxZoom  = 17;  // $B%:!<%`$N:GBgCM!J:G$b69$$HO0O!K(B
    var initPrecision = 8;  // $B:BI8I=<($N>.?tE@0J2<$N7e?t$N=i4|CM(B
    // *******************************************************************

    var stringifyFunc = ol.coordinate.createStringXY(initPrecision);

    var view = new ol.View({
        projection: "EPSG:3857",
        maxZoom: MaxZoom,
        minZoom: MinZoom
    });

    var baseLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            attributions: [ new ol.Attribution({ html: "<a href='http://portal.cyberjapan.jp/help/termsofuse.html' target='_blank'>$B9qEZCOM}1!(B</a>" }) ],
            url: "http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
            projection: "EPSG:3857"
        })
    });

    var map = new ol.Map({
        target: document.getElementById('map_canvas'),
        layers: [baseLayer],
        view: view,
        renderer: ['canvas', 'dom'],
        controls: ol.control.defaults().extend([new ol.control.ScaleLine()]),
        interactions: ol.interaction.defaults()
    });

    // zoom slider$B$NDI2C(B
    map.addControl(new ol.control.ZoomSlider());

    map.on('click', function(e) {
        var coordinate = e.coordinate;
        var outstr = stringifyFunc(ol.proj.transform(coordinate, "EPSG:3857", "EPSG:4326"));
        document.getElementById("outStr").innerHTML = outstr;
    });

    // $BCf?4$N;XDj!#(Bview$B$KBP$7$F;XDj!#(Btransform$B$rK:$l$J$$$3$H!#(B
    view.setCenter(ol.proj.transform([center_lon, center_lat], "EPSG:4326", "EPSG:3857"));

    // zoom$B$N;XDj!#(Bview$B$KBP$7$F;XDj$9$k!#(B
    view.setZoom(initZoom);
};
