require('jquery');
require('TravelHogan');

$(function(){
	if(window.location.hash.substring(1,2)*1)Boat.navByUrl();
	Boat.preData();
	Boat.bindEvent();
});

var Boat = {
	currentNav: 0,
	bindEvent: function(){
		Dom.navBtn.click(Boat.changeUrl);
		Dom.schBtn.click(Boat.doSearch);
		window.onhashchange = Boat.navByUrl;
	},
	changeUrl: function(){
		var lct = window.location;
		lct.href = lct.pathname + '#' + $(this).index();
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
		$.get(url.high).done(function(back){
			var html;
			if(back){
				html = Hogan.compile(Dom.m_high).render({list:back});
			}else{
				html = '<option value="-1">获取数据失败</option>';
			}
			Dom.highSlct.append(html);
		});
		Dom.dlpmSlct.append(Dom.h_dplm);
	},
	doSearch: function(){
		var url = '/Home/Search/specific';
		var arr = Dom.schFrm.serializeArray();
		var formData = {} , hasVal = false;
		for(var i = arr.length;i--;){
			if(arr[i].value && arr[i].value != -1){
				formData[arr[i].name] = arr[i].value;
				hasVal = true;
			}
		}
		if(hasVal){
			$.post(url,formData).done(function(back){
				
			});
		}
		console.log(formData)
	}
};
var Dom = {
	main: $('.main'),
	nav: $('#nav>div'),
	navBtn: $('#nav>div:not(.link)'),
	schBtn: $('#searchbar button'),
	schFrm: $('#searchbar form'),
	highSlct: $('#searchbar select[name=high]'),
	m_high: '{{#list}}<option value="{{id}}">{{name}}</option>{{/list}}',
	dlpmSlct: $('#searchbar select[name=diploma]'),
	h_dplm:'<option value="3">专科</option>\
			<option value="0">本科</option>\
			<option value="1">硕士</option>\
			<option value="2">博士</option>\
			<option value="4">其他</option>',
	m_result:'{{#list}}<li id="{{}}">\
			<span class="ord">{{1}}</span>\
			<span class="name">{{泛舟湖上}}</span>\
			<span class="higscl">{{野寨中学}}</span>\
			<span class="grad">{{11届}}</span>\
			<span class="class">{{理复11班}}</span>\
			<span class="maj">{{通信工程}}</span>\
			<span class="colge">{{上海大学}}</span>\
			<span class="diploma">{{本科}}</span>\
			<span class="touch">联系ta</span></li>{{/list}}'
};
