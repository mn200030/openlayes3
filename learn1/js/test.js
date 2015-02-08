window.onload = function() {
    // ===================================================================
    var center_lon = 135.100303888; // 中心の経度（須磨浦公園）
    center_lat = 34.637674639, // 中心の緯度（須磨浦公園）
    initZoom = 10, // ズームの初期値
    MinZoom  = 6,   // ズームの最小値（最も広い範囲）
    MaxZoom  = 17,  // ズームの最大値（最も狭い範囲）
    initPrecision = 8,  // 座標表示の小数点以下の桁数の初期値
    beginEndPoints = [],
    coordsArray = [],
    coordsArrayCurIndex = 0,
    lineStrings = new ol.geom.MultiLineString([]),
    lineVector = null,
    vectorFeature = null,
    latlngDisplay = document.getElementById('latlng_display'),
    stringifyFunc = ol.coordinate.createStringXY(initPrecision),
    view = new ol.View({
        projection: "EPSG:3857",
        maxZoom: MaxZoom,
        minZoom: MinZoom
    }),
    baseLayer = new ol.layer.Tile({
        opacity: 1.0,
        source: new ol.source.XYZ({
            attributions: [ new ol.Attribution({ html: "<a href='http://portal.cyberjapan.jp/help/termsofuse.html' target='_blank'>国土地理院</a>" }) ],
            url: "http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
            projection: "EPSG:3857"
        })
    }),
    map = new ol.Map({
        target: document.getElementById('map_canvas'),
        layers: [baseLayer],
        view: view,
        renderer: ['canvas', 'dom'],
        controls: ol.control.defaults().extend([new ol.control.ScaleLine()]),
        interactions: ol.interaction.defaults()
    }),

    // ヒュベニの公式で緯度・経度から距離を求めるための定数
    long_r = 6378137.000,     // [m] 長半径
    short_r = 6356752.314245, // [m] 短半径
    rishin = Math.sqrt((long_r * long_r - short_r * short_r)/(long_r * long_r)), // 第一離心率
    a_e_2 = long_r * (1-rishin * rishin),  // a(1-e^2)
    pi = 3.14159265358979,    // Pi
    nagasa_hosei = 1.0245;    // GPS の計算上の長さの補正
    // *******************************************************************

    // zoom sliderの追加
    map.addControl(new ol.control.ZoomSlider());


    // 中心の指定。viewに対して指定。transformを忘れないこと。
    view.setCenter(ol.proj.transform([center_lon, center_lat], "EPSG:4326", "EPSG:3857"));

    // zoomの指定。viewに対して指定する。
    view.setZoom(initZoom);

    // イベントハンドラ
    map.on('click', function(e) {
        var coordinate = e.coordinate,
            coord = ol.proj.transform(coordinate, "EPSG:3857", "EPSG:4326");
            outstr = stringifyFunc(coord);
        document.getElementById("outStr").innerHTML = outstr;
        drawLine(coord);
        addPoint();
    });

    document.getElementById('opacity01').onclick = function() {
        baseLayer.setOpacity(0.1);
    };

    document.getElementById('opacity05').onclick = function() {
        baseLayer.setOpacity(0.5);
    };

    document.getElementById('opacity10').onclick = function() {
        baseLayer.setOpacity(10);
    };

    document.getElementById('opacityPlus').onclick = function() {
        var opacity = baseLayer.getOpacity();
        baseLayer.setOpacity(opacity + 0.2);
    };

    document.getElementById('opacityMinus').onclick = function() {
        var opacity = parseFloat(baseLayer.getOpacity());
        if (opacity < 0.0) {
            opacity = 0.0;
        } else {
            opacity -= 0.2;
        }
        baseLayer.setOpacity(opacity);
    };

    document.getElementById('deleteLastPoint').onclick = function() {
        if (coordsArray.length < 1) {
            return;
        }
        coordsArray.pop();
        if (coordsArray.length < 1) {
            map.removeLayer(lineVector);
        }
        lineStrings.setCoordinates(coordsArray);
        vectorFeature = new ol.Feature(lineStrings.transform('EPSG:4326', 'EPSG:3857'));
    };

    // 地図をクリックしたら点を追加し線を再描画させる。小数点以下の桁数は initPrecision で指定。
    // メルカトル座標 (EPSG:3857) を WGS84 (EPSG:4326) に変換している。
    document.getElementById('drawLine').onclick = function() {
        var coordArray = [],
            lineStrArray = [],
            length = 0;

        coordArray.push([134.7061693665156,34.61224815577299]);
        coordArray.push([134.98357415167186,34.81544168178658]);
        coordArray.push([135.25304424804563,34.79564582556284]);
        coordArray.push([135.55242168945185,34.622921754425874]);
        coordArray.push([135.4288254980456,34.39459437355049]);
        coordArray.push([135.15004742187372,34.48180482108414]);
        coordArray.push([134.7366868261706,34.47954076626441]);
        length = coordArray.length-1;

        for (i=0; i<length; i++) {
            lineStrArray.push([coordArray[i], coordArray[i+1]]);
        }
        lineStrings.setCoordinates(lineStrArray);

        var vectorFeature = new ol.Feature(lineStrings.transform('EPSG:4326', 'EPSG:3857'));
        var vectorSource = new ol.source.Vector({
            features: [vectorFeature]
        });

        // 経路用のvector layerの作成
        lineVector = new ol.layer.Vector({
    	    source: vectorSource,
	    style: new ol.style.Style({
	        // fill: new ol.style.Fill({color: 'rgba(255, 255, 255, 0.2)'}),
	        stroke: new ol.style.Stroke({color: '#0000ff', width: 2}),
	    })
        });
        map.addLayer(lineVector);
    };

    // textareaから座標値を読込み線を描画する
    document.getElementById('getLineData').onclick = function() {
        var singleLines = latlngDisplay.value.split("\n"),
            length = 0;

        if (singleLines.length < 1) {
            return;
        }

        length = singleLines.length;
        coordsArray = [];
        for (var i = 0 ; i < length ; i++) {
            if (singleLines[i] != "") { // 空行は飛ばす
                var yy = singleLines[i].split(",");
                coordsArray.push([[parseFloat(yy[0]),parseFloat(yy[1])],[parseFloat(yy[2]),parseFloat(yy[3])]]);
            }
        }
        map.removeLayer(lineVector);
        lineStrings.setCoordinates(coordsArray);
        vectorFeature = new ol.Feature(lineStrings.transform('EPSG:4326', 'EPSG:3857'));
        var vectorSource = new ol.source.Vector({
            features: [vectorFeature]
        });
        lineVector = new ol.layer.Vector({
    	    source: vectorSource,
	    style: new ol.style.Style({
	        stroke: new ol.style.Stroke({color: '#0000ff', width: 2}),
	    })
        });
        map.addLayer(lineVector);
        view.fitGeometry(lineStrings, map.getSize());
        lengthLine();
    };

    // クリックされたポイントをテキストエリアに表示
    function addPoint() {
        if (coordsArray.length < 1) {
            coordsArrayCurIndex = 0;
            return;
        }
        latlngDisplay.value += coordsArray[coordsArrayCurIndex].toString() + '\n';
        coordsArrayCurIndex++;
    };

    // 経路の長さを求めて表示する
    function lengthLine() {
        lineLength = 0;
        var length = coordsArray.length-1;
        for (i=0; i < length; i++) {
            console.log(coordsArray[i]);
            lineLength = lineLength + dist_2pts(
                coordsArray[i][0][0],
                coordsArray[i][0][1],
                coordsArray[i][1][0],
                coordsArray[i][1][1]);
        }
        document.getElementById("lineLength").innerHTML = "L = "+(Math.floor(lineLength)/1000)+" [km]";
    };

    // ===================================================================
    // ヒュベニの公式を使った距離計算
    // 2点間の距離
    function dist_2pts(lon0, lat0, lon1, lat1) {
        lon0 = lon0 * pi / 180;  lat0 = lat0 * pi / 180; // in radian
        lon1 = lon1 * pi / 180;  lat1 = lat1 * pi / 180; // in radian
        var d_lon = lon1 - lon0,
            d_lat = lat1 - lat0,
            ave_lat = (lat1+lat0)/2,
            Wx = Math.sqrt(1-rishin * rishin * Math.sin(ave_lat) * Math.sin(ave_lat)),
            Mx = a_e_2 /Wx/Wx/Wx,
            Nx = long_r /Wx,
            dum = (d_lat * Mx)*(d_lat * Mx) + (d_lon* Nx * Math.cos(ave_lat)) * (d_lon* Nx * Math.cos(ave_lat)); // square of distance
        return Math.sqrt(dum);
    };
    // ===================================================================

    function drawLine(coord) {

        beginEndPoints.push(coord);

        if (beginEndPoints.length < 2) {
            return;
        }

        coordsArray.push(beginEndPoints);
        lineStrings.setCoordinates(coordsArray);
        vectorFeature = new ol.Feature(lineStrings.transform('EPSG:4326', 'EPSG:3857'));

        if (beginEndPoints.length == 2) {
            var vectorSource = new ol.source.Vector({
                features: [vectorFeature]
            });
            lineVector = new ol.layer.Vector({
    	        source: vectorSource,
	        style: new ol.style.Style({
	            stroke: new ol.style.Stroke({color: '#0000ff', width: 2}),
	        })
            });
            map.addLayer(lineVector);
        }
        beginEndPoints = [];
        beginEndPoints.push(coordsArray[coordsArray.length-1][1]);
    };
};
