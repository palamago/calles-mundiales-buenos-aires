var MiniShare;

;(function(global, document, $, gapi){

    "use strict";

    MiniShare = global.MiniShare = global.MiniShare || {};

    MiniShare.$twitterButton = $('.minishare-tw');
    MiniShare.$facebookButton = $('.minishare-fb');
    MiniShare.$googleButton = $('.minishare-gp');
    MiniShare.$mailButton = $('.minishare-mail');

    MiniShare.getCurrentLocation = function(type){
        return window.location.href;
    }

    MiniShare.options = {
        fb:{
            title:'Take a look!',
            text:'Take a look in my awesome site!',
            img: ''
        },
        tw:{
            text:'Take a look in my awesome site!',
            related : '',
            ht: '',
            via:''
        },
        em:{
            subject:'Take a look!',
            body:'Take a look in my awesome site!'
        },
        shortener:{
                enabled:false,
                google_api_key:undefined
            },
        getUrl: MiniShare.getCurrentLocation
    };

    MiniShare.init = function(opts){
        $.extend(MiniShare.options,opts);
        MiniShare.$twitterButton.on('click',MiniShare.shareTwitter);
        MiniShare.$facebookButton.on('click',MiniShare.shareFacebook);
        MiniShare.$googleButton.on('click',MiniShare.shareGoogle);
        MiniShare.$mailButton.on('click',MiniShare.shareMail);

        if(MiniShare.options.shortener.enabled && gapi){
            //Get your own Browser API Key from  https://code.google.com/apis/console/
            gapi.client.setApiKey(MiniShare.options.shortener.google_api_key);
            gapi.client.load('urlshortener', 'v1',function(){
                //console.log('cargo');
            });
        }
    }

    MiniShare.openWindow = function(url,title){
        var width  = 575,
            height = 400,
            left   = ($(window).width()  - width)  / 2,
            top    = ($(window).height() - height) / 2,
            opts   = 'status=1' +
                     ',width='  + width  +
                     ',height=' + height +
                     ',top='    + top    +
                     ',left='   + left;
        
        window.open(url, title, opts);

        return false;
    }

    MiniShare.getUrl =  function(type,callback){
        var url = MiniShare.options.getUrl(type);
        if(MiniShare.options.shortener.enabled){
            MiniShare.shortUrl(url,function(shortUrl){
                callback(shortUrl);
            });
        }else{
            callback(url);            
        }
    }

    MiniShare.shortUrl =  function(url,callback){
        var longUrl = url;
        var request = gapi.client.urlshortener.url.insert({
            'resource': {
              'longUrl': longUrl
            }
        });
        request.execute(function(response){
            if(response.id != null) {
                callback(response.id);
            } else {
                alert("Error al compartir, por favor intente más tarde.");
                if(console)
                    console.error(response.error);
            }
        });
    }

    MiniShare.shareTwitter = function(e){
        e.preventDefault();
        var qObj = {
            'text': MiniShare.options.tw.text,
            'related': MiniShare.options.tw.related,
            'hashtags': MiniShare.options.tw.ht,
            'url': '',
            'via': MiniShare.options.tw.via
        };

        function cb(url){
            qObj.url = url;
            var qs = $.param(qObj);
            MiniShare.openWindow("https://twitter.com/intent/tweet?"+qs,'Twitter');
        }

        MiniShare.getUrl('twitter',cb);

        return false;
    }

    MiniShare.shareFacebook = function(e){
        e.preventDefault();

        var qObj = {
            'u' : ''
        }

        function cb(url){
            qObj.u = url;
            var qs = $.param(qObj);
            MiniShare.openWindow("http://www.facebook.com/sharer/sharer.php?"+qs,'Facebook');            
        }

        MiniShare.getUrl('facebook',cb);

        return false;
    }

    MiniShare.shareGoogle = function(e){
        e.preventDefault();

        var qObj = {
            'url' : MiniShare.options.getUrl('google+')
        }

        function cb(url){
            qObj.url = url;
            var qs = $.param(qObj);
            MiniShare.openWindow("https://plus.google.com/share?"+qs,'Google+');            
        }

        MiniShare.getUrl('google+',cb);

        return false;
    }

    MiniShare.shareMail = function(e){

        var qObj = {
            'subject': MiniShare.options.em.subject,
            'body': MiniShare.options.em.body
        };

        function cb(url){
            qObj.body += ' - ' + url;
            var qs = $.param(qObj).replace(/\+/g,' ');
            var href = "mailto:?" + qs;
            window.location = href;
        }

        MiniShare.getUrl('email',cb);

        return false;
    }


})(window, document,jQuery, gapi);