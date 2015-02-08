window.onload = function() {
// ===================================================================
    var map = null,      // 全体の地図用の変数
        baseLayer = null,   // 地理院地図用の変数
        source = null,
        lineColor = '#ff0000', // red
        center_lon = 135.100303888, // 中心の経度（須磨浦公園）
        center_lat = 34.637674639, // 中心の緯度（須磨浦公園）
        initZoom = 10, // ズームの初期値
        minZoom  = 6,   // ズームの最小値（最も広い範囲）
        maxZoom  = 17,  // ズームの最大値（最も狭い範囲）
        initPrecision = 8, // 座標表示の小数点以下の桁数の初期値
        vector = null,
        view = new ol.View({projection: "EPSG:3857", maxZoom: maxZoom, minZoom: minZoom}),
        interactionDraw = null,
        latlons = document.getElementById('latlons');
// ===================================================================

    // 中心の指定。viewに対して指定。transformを忘れない事。
    view.setCenter(ol.proj.transform([center_lon, center_lat], "EPSG:4326", "EPSG:3857"));
    view.setZoom(initZoom);

    baseLayer = new ol.layer.Tile({
        opacity: 1.0,
	source: new ol.source.XYZ({
        attributions: [new ol.Attribution({ html: "<a href='http://portal.cyberjapan.jp/help/termsofuse.html' target='_blank'>国土地理院</a>" })],
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

    // 地図変数(map変数)の定義。地理院地図を表示するように指定している
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

    // ol.interaction.Drawの追加
    interactionDraw = new ol.interaction.Draw({
        features: featureOverlay.getFeatures(),
        type:'LineString'
    });
    map.addInteraction(interactionDraw);

    document.getElementById('clearAllLines').onclick = function() {
        latlons.value = '';
        // 線をクリア
        featureOverlay.getFeatures().clear();
    };

    document.getElementById('getLinedataFromText').onclick = function() {
        // データをクリア
        featureOverlay.getFeatures().clear();

        // テキストデータから座標配列へ入れる
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
                // メルカトル座標系に変換してから代入
                transformed = ol.proj.transform([beginLatlon, endLatlon], "EPSG:4326", "EPSG:3857");
                coordArray.push(transformed);
            }
        }
        // 新しい経路の作成
        var geometry = new ol.geom.LineString(coordArray);
        // featureOverlayに線のデータを追加
        featureOverlay.addFeature(new ol.Feature({geometry: geometry}));
    }

    document.getElementById('displayPoints').onclick = function() {
            // arrayではなく、ol.Collectionなので注意必要
        var features = featureOverlay.getFeatures(),
            length = features.getLength(),
            transform = ol.proj.transform;

        latlons.value = "";
        for (var i = 0; i < length ; i++) {
            // geometryが具体的に描画された図形を表す変数
            // 「geometry」の中にはLineString という形式のデータが入っている
            var geometry = (features.getArray())[i].getGeometry();

            // geometryに「getCoordinate()」という関数を作用させると，「点の配列」（coordArray）が得られる。
            // coordArray は，経度と緯度を要素に持つ「座標（ol.Coordinate）」タイプのデータの配列
            var coordArray = geometry.getCoordinates();
            var l = coordArray.length;
            for (var j = 0; j < l; j++) {
                latlons.value += transform(coordArray[j],"EPSG:3857", "EPSG:4326").toString() + "\n"; 
            }
            latlons.value += '\n';
        }
    };
};
