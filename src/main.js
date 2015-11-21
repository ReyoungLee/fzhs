require('jquery');
var tpl = require('./artTemplate.js');
var tpl_guy = require('./guy.string');

$(function(){
	(window.location.hash.slice(1,2)*1) && Boat.navByUrl();
	Boat.preData();
	Boat.bindEvent();
	// dlg.build();
});
window.CH = window.navigator.userAgent.indexOf('Chrome') > -1;
var Boat = {

	schTimeOut: true,// a client can not post search requests too frequently
	lc: window.location,
	bindEvent: function(){
		window.onhashchange = Boat.navByUrl;
		Dom.schBtn.click(Boat.doSearch);
		Dom.guys.on('click','.contact',dlg.show);
		Dom.bd.on('click','#dlg .n',dlg.hide).on('click','#dlg .y',Boat.gouda);
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
			var html = tpl.compile(Dom.tpl_high)({list:back});
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
		var url = '/home/search/specific';
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

		Dom.loading.fadeIn(111);
		$.post(url,form).done(function(back){
			back = back ? back : false;
			var html = tpl.compile(Dom.tpl_guys)({list:back});
			Dom.loading.delay(200).fadeOut(222);
			Dom.guys.html(html).hide(0).fadeIn(666);
		}).fail(function () {
			Dom.loading.fadeOut(222, function () {
				alert('你的网络挂了');
			});
		});

		iq == -1 && (iq = Boat.lc.href.length);

		Boat.lc.href = Boat.lc.href.slice(0,iq) + str.slice(0,-1);
		Boat.schTimeOut = false;
		setTimeout(function(){
			Boat.schTimeOut = true;
		},1000);
	},
	gouda: function(){
		var arg = {
			id: this.dataset.uid,
			content: Dom.gdCon.val()
		},
		tip = ['没有找到联系方式，你的请求已经提交给系统',
				'勾搭成功~\\(≧▽≦)/~',
				'勾搭失败╮(╯▽╰)╭',
				'系统故障了╮(╯▽╰)╭',
				'一天只能勾搭30次。。。你的机会用完了',
				'一分钟只能勾搭一次~不要急',
				'一天只能勾搭同一个人3次~'];
		if(arg.content.replace(/\s/g, '') == ''){
			dlg.alert();
			return;
		}
		dlg.ldg.show();
		$.post('/home/gouda/sendd',arg).done(function (data){
			if(data != null){
				dlg.hide();
				alert(tip[data]);
			}
		});
	}
};

var dlg = {
	exist: false,
	wdw: $('<div id="dlg" style="top:-200px"></div>'),
	msk: $('<div id="dlg-mask" style="display:none"></div>'),
	ldg: $('<div class="sending"></div>'),
	nm: undefined, 
	uid: undefined,
	show: function(){
		dlg.exist || dlg.build();
		dlg.nm.html($(this).data('name'));
		dlg.uid.attr('data-uid',$(this).data('uid'));
		dlg.msk.fadeIn(200);
		Dom.blur.addClass('blur');
		setTimeout(function(){
			dlg.wdw.css('top','200px');
		},1);
	},
	hide: function(){
		dlg.wdw.css('top','-400px');
		dlg.msk.fadeOut(200);
		dlg.ldg.hide();
		Dom.blur.removeClass('blur');
	},
	build: function(){
		var cont = $('<h4>发送消息给 <span></span></h4>\
<textarea placeholder="请留下自己的联系方式" id="gd-content"></textarea>\
<button class="y">勾搭Ta</button>\
<button class="n">算了</button>');
		dlg.msk.click(dlg.hide);
		window.CH || dlg.wdw.addClass('dlg-pls');
		dlg.wdw.append(cont).append(dlg.ldg);
		Dom.bd.append(dlg.wdw,dlg.msk);
		dlg.nm = dlg.wdw.find('span');
		dlg.uid = dlg.wdw.find('.y');
		dlg.exist = true;
		Dom.gdCon = $('#gd-content');
	},
	alert: function() {
		var ta = Dom.gdCon;
		ta.addClass('alert');
		setTimeout(function() {
			ta.removeClass('alert');
		},555);
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
	highSlct: $('#searchbar select[name=highschool]'),
	dgreSclt: $('#searchbar select[name=degree]'),
	gradSlct: $('#searchbar select[name=graduation]'),
	loading: $('#loading'),
	guys: $('#result'),
	tpl_high:'{{each list as e}}<option value="{{e.id}}">{{e.name}}</option>{{/each}}{{if !list}}<option>获取数据失败</option>{{/if}}',
	h_dgre: '<option value="3">专科</option><option value="0">本科</option><option value="1">硕士</option><option value="2">博士</option><option value="4">其他</option>',
	tpl_guys: tpl_guy
};