var CallesMundiales;

;(function(global, document, $,ko){

    "use strict";

    //Fix strange bug using jquery2 and bootstra3
    HTMLDivElement.prototype.remove = function(){};

    CallesMundiales = global.CallesMundiales = global.CallesMundiales || {};

	CallesMundiales.$slider = $('#slider');

    CallesMundiales.initialized = false;

    CallesMundiales.norm = usig.NormalizadorDirecciones.init({
        onReady: function(){
            if(!CallesMundiales.initialized){
                CallesMundiales.initialized = true;
                CallesMundiales.init();
            }
        }
    });

    CallesMundiales.bindings = {
        mundiales : ko.observableArray([])
    };

    CallesMundiales.data = [
        {anio:1930, sede:"Uruguay"},
        {anio:1934, sede:"Italia"},
        {anio:1938, sede:"Francia"},
        {anio:1950, sede:"Brasil"},
        {anio:1954, sede:"Suiza"},
        {anio:1958, sede:"Suecia"},
        {anio:1962, sede:"Chile"},
        {anio:1966, sede:"Inglaterra"},
        {anio:1970, sede:"México"},
        {anio:1974, sede:"Alemania"},
        {anio:1978, sede:"Argentina"},
        {anio:1982, sede:"España"},
        {anio:1986, sede:"México"},
        {anio:1990, sede:"Italia"},
        {anio:1994, sede:"Estados Unidos"},
        {anio:1998, sede:"Francia"},
        {anio:2002, sede:"Corea"},
        {anio:2002, sede:"Japon"},
        {anio:2006, sede:"Alemania"},
        {anio:2010, sede:"Sudáfrica"},
        {anio:2014, sede:"Brasil"}
    ];

    CallesMundiales.$downBtn = $('#arrow-down');

    CallesMundiales.mapa = $('#miMapa');

    var FilterOption = function(name, id, icon) {
        this.name = name;
        this.id = id;
        this.icon = icon;
    };

    CallesMundiales.init = function () {
        this.createBindings();
        CallesMundiales.mapa = new usig.MapaInteractivo('miMapa', {
            onReady: function() {
                CallesMundiales.getGeocoding();
            }
        });


        ko.applyBindings(CallesMundiales.bindings);
    };

    CallesMundiales.createBindings = function (argument) {
        $.each(CallesMundiales.data,function(i,e){
            e.text = ko.observable('Cargando...');
            e.x = ko.observable();
            e.y = ko.observable();
            e.comuna = ko.observable();
            e.barrio = ko.observable();
            e.normalizada = ko.observable('Cargando...');
            e.map = ko.computed(function() {
                if(this.x()&&this.y()){
                    CallesMundiales.addMarkerToMap(this);
                    return 'http://servicios.usig.buenosaires.gov.ar/LocDir/mapa.phtml?x='+this.x()+'&y='+this.y()+'&w=300&punto=1';
                } else {
                    return '';
                }
            }, e);
            e.linkToMap = ko.computed(function() {
                if(this.x()&&this.y()){
                    CallesMundiales.addMarkerToMap(this);
                    return 'http://mapa.buenosaires.gob.ar/?lat='+this.y()+'&lon='+this.x()+'&zl=7&map=default&ver=2&dir=2111%3A1970::0&modo=marker-menu';
                } else {
                    return '';
                }
            }, e);
            e.loading = ko.observable(true);

            CallesMundiales.bindings.mundiales.push(e);
        });
    };

    CallesMundiales.addMarkerToMap = function(d){
        var iconUrl = 'http://www.piedrabuenanoticias.com.ar/portal/images/MAYO%202012/ball.png',
            iconSize = new OpenLayers.Size(25, 25),
            customMarker = new OpenLayers.Marker(new OpenLayers.LonLat(d.x(),d.y()),new OpenLayers.Icon(iconUrl, iconSize));
        
        var contentHTML = d.normalizada();
        var markerId = CallesMundiales.mapa.addMarker(customMarker, true, contentHTML);
        CallesMundiales.mapa.zoomToMarkers();
    };

    CallesMundiales.getGeocoding = function (argument) {
        var url_geocoder = 'http://ws.usig.buenosaires.gob.ar/geocoder/2.2/geocoding/?callback=?&';
        var url_datos = 'http://ws.usig.buenosaires.gob.ar/datos_utiles/?callback=?&';
        var url_otros = 'http://epok.buenosaires.gob.ar/buscar/?callback=?&start=0&limit=5&tipo=ranking&totalFull=false&';
        
        $.each(CallesMundiales.bindings.mundiales(),function(i,e){

            try {
                var norm = CallesMundiales.norm.normalizar(e.sede + ' ' + e.anio, 10, true);

                var opts = CallesMundiales.norm.buscarDireccion(e.sede + ' ' + norm[0].getAltura(), 10, true);

                e.normalizada(norm[0].getCalle() + ' ' + norm[0].getAltura());

                $.getJSON(url_geocoder+'cod_calle='+opts.match.getCalle().codigo+'&altura='+opts.match.getAltura(), function(d){
                    e.x(d.x);
                    e.y(d.y);
                    e.loading(false);
                });

                $.getJSON(url_datos+'calle='+norm[0].getCalle()+'&altura='+opts.match.getAltura(), function(d){
                    e.barrio(d.barrio);
                    e.comuna(d.comuna.split(' ')[1]);
                    e.loading(false);
                });

                e.text('Este mundial tiene su dirección en las calles de Buenos Aires. =)');

            } catch (error) {
                e.normalizada('No pudo determinarse una dirección.');
                e.text(error.getErrorMessage());
                if(!error.getMatchings){
                    $.getJSON(url_otros+'texto='+e.sede, function(d){
                        var html = 'No se ubicó ninguna calle, pero se encontraron algunos sitios de interés con ese nombre:';
                        html += '<ul>';
                        $.each(d.instancias,function(ix,l){
                            html += '<li>'+l.nombre+' - '+l.clase+'</li>';
                        });
                        html += '</ul>';
                        e.text(html);
                        e.loading(false);
                    });
                } else {
                    e.loading(false);
                }
            }
        });
    }


})(window, document,jQuery,ko);

window.onload = function() {
    var opts = {
        fb:{
            title:'Mapa de calles Mundiales en Buenos Aires',
            text:'Pequeño experimento geográfico-mundialista',
            img: ''
        },
        tw:{
            text:'Mapa de calles Mundiales en Buenos Aires',
            related : 'palamago',
            via: 'palamago',
            ht: 'brasil2014,mundial2014,worldcup,brazil2014'
        },
        shortener:{
            enabled:false
        }
    };

    MiniShare.init(opts); 
}