require('jquery');
var tpl = require('./artTemplate.js');

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
		$.post(url,form).done(function(back){
			back = back?back:false;
			var html = tpl.compile(Dom.tpl_guys)({list:back});
			Dom.guys.html(html);
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
			id: $(this).data('uid'),
			content: $(this).siblings('textarea').val()
		};
		console.log(arg)
		$.post('/home/gouda/send',arg).done(function (data){
			var tip = ['没有找到联系方式，你的请求已经提交给系统',
						'勾搭成功~\\(≧▽≦)/~',
						'勾搭失败╮(╯▽╰)╭',
						'系统故障了╮(╯▽╰)╭'];
			if(data != null){
				Dlg.hide();
				alert(tip[data]);
			}
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
	highSlct: $('#searchbar select[name=highschool]'),
	dgreSclt: $('#searchbar select[name=degree]'),
	gradSlct: $('#searchbar select[name=graduation]'),
	guys: $('#result'),
	tpl_high:'{{each list as e}}<option value="{{e.id}}">{{e.name}}</option>{{/each}}\
			{{if !list}}<option>获取数据失败</option>{{/if}}',
	h_dgre:'<option value="3">专科</option>\
			<option value="0">本科</option>\
			<option value="1">硕士</option>\
			<option value="2">博士</option>\
			<option value="4">其他</option>',
	tpl_guys:'{{each list as e}}<li id="{{e.id}}">\
			<span class="ord">{{e.order}}</span>\
			<span class="name">{{e.name}}</span>\
			<span class="higscl">{{e.highschool}}</span>\
			<span class="grad">{{e.graduation}}届</span>\
			<span class="class">{{e.class}}班</span>\
			<span class="maj">{{e.major}}</span>\
			<span class="colge">{{e.college}}</span>\
			<span class="degree">{{["本科","硕士","博士","专科","其他"][e.degree]}}</span>\
			<span class="contact" data-name="{{e.name}}" data-uid="{{e.id}}">联系</span></li>{{/each}}\
			{{if !list}}<div style="text-align:center;">\
			<span style="font-size:20px;color:#777">没找到 ╮(╯▽╰)╭</span>\
			</div>{{/if}}'
};