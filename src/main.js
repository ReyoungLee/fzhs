require('jquery');
require('TravelHogan');

$(function(){
	(window.location.hash.slice(1,2)*1) && Boat.navByUrl();
	Boat.preData();
	Boat.bindEvent();
});
window.CH = window.navigator.userAgent.indexOf('Chrome') > -1;
var Boat = {

	schTimeOut: true,// a client can not post search requests too frequently
	lc: window.location,
	bindEvent: function(){
		window.onhashchange = Boat.navByUrl;
		Dom.schBtn.click(Boat.doSearch);
		Dom.guys.on('click','.contact',Dlg.show);
		Dom.bd.on('click','#dlg .n',Dlg.hide).on('click','#dlg .y',Boat.gouda);
	},
	navByUrl: function(){
		var nav = Boat.lc.hash.slice(1,2);
		var _this = Dom.nav.eq(nav);
		var $target = Dom.main.eq(nav);
		var $others = Dom.main.not($target);
		_this.addClass('crt').siblings().removeClass('crt');
		$others.fadeOut(700);
		$target.css('top','-100%').show(0).css('top','0');
	},
	analysePara: function(){
		var para = Boat.lc.hash.slice(3),
			nav = Boat.lc.hash.slice(1,2);
		if(nav != 1 || !para){
			return;
		}
		var arr = para.split('&'),form = {};
		var temp;
		for(var i = arr.length; i--;){
			temp = arr[i].split('=');
			form[temp[0]] = temp[1];
		}
		Dom.schInpt.each(function(){
			$(this).val(form[this.name]);
		});
		Dom.schSlct.each(function(){
			var name = form[this.name];
			if(!name){
				return;
			}
			$(this).find('option[value='+name+']').attr('selected',true);
		});
		Boat.doSearch();
	},
	preData: function(){
		var url = {
			high : '/home/query/allhighschools'
		};
		var grad ='', year = new Date().getFullYear();
		$.get(url.high).done(function(back){
			back = back?back:false;
			var html = Mustache.to_html(Dom.m_high,{list:back});
			Dom.highSlct.append(html);
			Boat.analysePara();
		});
		for(year; year > 1945; year--){
			grad += '<option value ='+year+'>'+year+'</option>';
		}
		Dom.gradSlct.append(grad);
		Dom.dgreSclt.append(Dom.h_dgre);
	},
	checkForm: function(f){
		if(f.name || f.major || f.college){
			return true;
		}else{
			Dom.schTip.addClass('notice');
			Dom.schBtn.text('请检查输入');
			setTimeout(function(){
				Dom.schTip.removeClass('notice');
				Dom.schBtn.text('搜　索');
			},600);
		}
	},
	doSearch: function(){
		var url = '/home/search/specific',href;
		var iq = Boat.lc.href.indexOf('?');
		var arr = Dom.schFrm.serializeArray(), str = '?';
		var form = {};
		for(var i = arr.length;i--;){
			var v = arr[i].value.replace(/\s+/g,'');
			if(v){
				form[arr[i].name] = v;
				str += arr[i].name + '=' + v + '&';
			}
		}
		if(!Boat.schTimeOut || !Boat.checkForm(form)){
			return;
		}
		$.post(url,form).done(function(back){
			back = back?back:false;
			var html = Mustache.to_html(Dom.m_guys,{list:back});
			Dom.guys.html(html);
		});
		if(iq != -1){
			href = Boat.lc.href.slice(0,iq);
		}
		href += str.slice(0,-1);
		Boat.lc.href = href;
		Boat.schTimeOut = false;
		setTimeout(function(){
			Boat.schTimeOut = true;
		},1000);
	},
	gouda: function(){
		var arg = {};
		$.post('/home/gouda/send',arg).done(function (data){

		});
	}
	
};

var Dlg = {
	exist: false,
	wdw: $('<div id="dlg" style="top:-200px"></div>'),
	msk: $('<div id="dlg-mask" style="display:none"></div>'),
	nm: undefined, 
	uid: undefined,
	show: function(){
		Dlg.exist || Dlg.build();
		Dlg.nm.html($(this).data('name'));
		Dlg.uid.attr('data-uid',$(this).data('uid'));
		Dlg.msk.fadeIn(200);
		Dom.blur.addClass('blur');
		setTimeout(function(){
			Dlg.wdw.css('top','200px');
		},1);
	},
	hide: function(){
		Dlg.wdw.css('top','-400px');
		Dlg.msk.fadeOut(200);
		Dom.blur.removeClass('blur');
	},
	build: function(){
		var cont = $('<h4>发送消息给 <span></span></h4>\
					<textarea placeholder="请留下自己的联系方式"></textarea>\
					<button class="y">勾搭Ta</button>\
					<button class="n">算了</button>');
		Dlg.msk.click(Dlg.hide);
		window.CH || Dlg.wdw.addClass('dlg-pls');
		Dlg.wdw.append(cont);
		Dom.bd.append(Dlg.wdw,Dlg.msk);
		Dlg.nm = Dlg.wdw.find('span');
		Dlg.uid = Dlg.wdw.find('.y');
		Dlg.exist = true;
	}
};

var Dom = {
	bd: $('body'),
	main: $('.main'),
	nav: $('#nav>div'),
	blur: $('.main,#nav,#logo'),
	schBtn: $('#searchbar button'),
	schTip: $('#searchbar span'),
	schFrm: $('#searchbar form'),
	schSlct: $('#searchbar select'),
	schInpt: $('#searchbar input'),
	schNull: '<div style="text-align:center;"><span style="font-size:20px;color:#777">\
			没找到 ╮(╯▽╰)╭</span></div>',
	highSlct: $('#searchbar select[name=highschool]'),
	dgreSclt: $('#searchbar select[name=degree]'),
	gradSlct: $('#searchbar select[name=graduation]'),
	guys: $('#result'),
	m_high:'{{#list}}<option value="{{id}}">{{name}}</option>{{/list}}\
			{{^list}}<option>获取数据失败</option>{{/list}}',
	h_dgre:'<option value="3">专科</option>\
			<option value="0">本科</option>\
			<option value="1">硕士</option>\
			<option value="2">博士</option>\
			<option value="4">其他</option>',
	m_guys:'{{#list}}<li id="{{id}}">\
			<span class="ord">{{order}}</span>\
			<span class="name">{{name}}</span>\
			<span class="higscl">{{high}}</span>\
			<span class="grad">{{grad}}届</span>\
			<span class="class">{{class}}班</span>\
			<span class="maj">{{maj}}</span>\
			<span class="colge">{{college}}</span>\
			<span class="degree">{{degree}}</span>\
			<span class="contact" data-name="{{name}}" data-uid="{{id}}">联系Ta</span></li>{{/list}}\
			{{^list}}<div style="text-align:center;">\
			<span style="font-size:20px;color:#777">没找到 ╮(╯▽╰)╭</span>\
			</div>{{/list}}'
};