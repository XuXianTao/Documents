(function () {
	var gIDAllSite = 'UA-xxx-x'
	var gIDSite = ''
	var gID2country = {
		'UA-148165813-2': ['en'],
		'UA-148165813-3': ['us'],
		'UA-148165813-4': ['jp', 'au', 'th'],
		'UA-148165813-5': ['uk', 'es', 'de', 'pt', 'bg', 'ro'],
	}
	var locationMatch = location.pathname.match(/^\/([^\/]+)\//)
	var rootSite
	if (locationMatch) {
		rootSite = locationMatch[1]
	}
	
	for (var id in gID2country) {
		if (gID2country[id].indexOf(rootSite) > -1) {
			gIDSite = id
			break
		}
	}
	window.dataLayer = window.dataLayer || [];
	function gtag(){dataLayer.push(arguments);}

	// 添加GA代码
	function addGTagScript(id) {
		var scriptTag = document.createElement('script')
		scriptTag.async = true
		scriptTag.src = 'https://www.googletagmanager.com/gtag/js?id=' + id
		document.body.appendChild(scriptTag)
		gtag('config', id, {'anonymize_ip': true});
	}
	(function () {
		if (location.host === 'www.tapo.com') {
			addGTagScript(gIDAllSite)
			addGTagScript(gIDSite)
		}
	})()
	gtag('js', new Date());

	// 事件追踪
  function eventTracking(name, href, type) {
		var evAction =  type === undefined ? 'click' : type
    var opt = {
      'event_category': name,
      'event_label': href,
      'transport_type': 'beacon'
    };
		gtag('event', evAction, opt)
  }
  (function (w) {
    w.jQuery && $(document).on("click", ".ga-click", function () {
      var self = $(this)[0];
      var _name = self.getAttribute("data-ga") || self.getAttribute("data-vars-event-category") || 'Unknown';
      var _href = self.getAttribute("href") || self.getAttribute("data-vars-event-label") || 'No Link';
      eventTracking(_name, _href);
    });
  })(window);
})()