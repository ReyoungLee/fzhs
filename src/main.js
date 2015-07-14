require('jquery');
require('TravelHogan');

$(function(){
	if(window.location.hash.substring(1,2)*1)Boat.navByUrl();
	Boat.preData();
	Boat.bindEvent();
});

var Boat = {
	schTimeOut: true,// a client can not post search requests too frequently
	bindEvent: function(){
		Dom.navBtn.click(Boat.changeUrl);
		Dom.schBtn.click(Boat.doSearch);
		window.onhashchange = Boat.navByUrl;
	},
	changeUrl: function(){
		var lc = window.location;
		lc.href = lc.pathname + '#' + $(this).index();
	},
	navByUrl: function(){
		var nav = window.location.hash.substring(1,2) ;
		var _this = Dom.nav.eq(nav);
		var $target = Dom.main.eq(nav);
		var $others = Dom.main.not($target);
		_this.addClass('crt').siblings().removeClass('crt');
		$others.fadeOut(800);
		$target.css('top','-100%').show(0).css('top','0');
	},
	preData: function(){
		var url = {
			high : '/Home/Query/allhighschools'
		};
		var grad ='', year = new Date().getFullYear();
		$.get(url.high).done(function(back){
			back = back?back:false;
			var html = Mustache.to_html(Dom.m_high,{list:back});
			Dom.highSlct.append(html);
		});
		for(year; year > 1945; year--){
			grad += '<option>'+year+'</option>';
		}
		Dom.gradSlct.append(grad);
		Dom.dgreSclt.append(Dom.h_dgre);
	},
	doSearch: function(){
		var url = '/Home/Search/specific';
		var lc = window.location , iq = lc.href.indexOf('?');
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
			lc.href = lc.href.substring(0,iq);
		}
		lc.href += str;
		Boat.schTimeOut = false;
		setTimeout(function(){
			Boat.schTimeOut = true;
		},1000);
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
	}
};
var Dom = {
	main: $('.main'),
	nav: $('#nav>div'),
	navBtn: $('#nav>div:not(.link)'),
	schBtn: $('#searchbar button'),
	schTip: $('#searchbar span'),
	schFrm: $('#searchbar form'),
	schNull: '<div style="text-align:center;"><span style="font-size:20px;color:#777">没找到 ╮(╯▽╰)╭</span></div>',
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
			<span class="touch">联系ta</span></li>{{/list}}\
			{{^list}}<div style="text-align:center;">\
			<span style="font-size:20px;color:#777">没找到 ╮(╯▽╰)╭</span>\
			</div>{{/list}}'
};
