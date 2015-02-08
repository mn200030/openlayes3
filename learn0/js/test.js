window.onload = function() {
    // ===================================================================
    var center_lon = 135.100303888; // 中心の経度（須磨浦公園）
    var center_lat = 34.637674639; // 中心の緯度（須磨浦公園）

    var initZoom = 10; // ズームの初期値
    var MinZoom  = 6;   // ズームの最小値（最も広い範囲）
    var MaxZoom  = 17;  // ズームの最大値（最も狭い範囲）
    var initPrecision = 8;  // 座標表示の小数点以下の桁数の初期値
    // *******************************************************************

    var stringifyFunc = ol.coordinate.createStringXY(initPrecision);

    var view = new ol.View({
        projection: "EPSG:3857",
        maxZoom: MaxZoom,
        minZoom: MinZoom
    });

    var baseLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            attributions: [ new ol.Attribution({ html: "<a href='http://portal.cyberjapan.jp/help/termsofuse.html' target='_blank'>国土地理院</a>" }) ],
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

    // zoom sliderの追加
    map.addControl(new ol.control.ZoomSlider());

    map.on('click', function(e) {
        var coordinate = e.coordinate;
        var outstr = stringifyFunc(ol.proj.transform(coordinate, "EPSG:3857", "EPSG:4326"));
        document.getElementById("outStr").innerHTML = outstr;
    });

    // 中心の指定。viewに対して指定。transformを忘れないこと。
    view.setCenter(ol.proj.transform([center_lon, center_lat], "EPSG:4326", "EPSG:3857"));

    // zoomの指定。viewに対して指定する。
    view.setZoom(initZoom);
};
