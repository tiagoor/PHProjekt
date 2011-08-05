/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


dojo._hasResource["dojox.dtl.tag.logic"]||(dojo._hasResource["dojox.dtl.tag.logic"]=!0,dojo.provide("dojox.dtl.tag.logic"),dojo.require("dojox.dtl._base"),function(){var i=dojox.dtl,g=i.tag.logic;g.IfNode=dojo.extend(function(a,b,d,c){this.bools=a;this.trues=b;this.falses=d;this.type=c},{render:function(a,b){var d,c,e;if(this.type=="or"){for(d=0;c=this.bools[d];d++)if(e=c[0],c=c[1],(c=c.resolve(a))&&!e||e&&!c)return this.falses&&(b=this.falses.unrender(a,b)),this.trues?this.trues.render(a,b,this):
b;this.trues&&(b=this.trues.unrender(a,b));return this.falses?this.falses.render(a,b,this):b}else{for(d=0;c=this.bools[d];d++)if(e=c[0],c=c[1],c=c.resolve(a),c==e)return this.trues&&(b=this.trues.unrender(a,b)),this.falses?this.falses.render(a,b,this):b;this.falses&&(b=this.falses.unrender(a,b));return this.trues?this.trues.render(a,b,this):b}},unrender:function(a,b){b=this.trues?this.trues.unrender(a,b):b;return b=this.falses?this.falses.unrender(a,b):b},clone:function(a){var b=this.trues?this.trues.clone(a):
null,a=this.falses?this.falses.clone(a):null;return new this.constructor(this.bools,b,a,this.type)}});g.IfEqualNode=dojo.extend(function(a,b,d,c,e){this.var1=new i._Filter(a);this.var2=new i._Filter(b);this.trues=d;this.falses=c;this.negate=e},{render:function(a,b){var d=this.var1.resolve(a),c=this.var2.resolve(a),d=typeof d!="undefined"?d:"",c=typeof d!="undefined"?c:"";if(this.negate&&d!=c||!this.negate&&d==c)return this.falses&&(b=this.falses.unrender(a,b,this)),this.trues?this.trues.render(a,
b,this):b;this.trues&&(b=this.trues.unrender(a,b,this));return this.falses?this.falses.render(a,b,this):b},unrender:function(a,b){return g.IfNode.prototype.unrender.call(this,a,b)},clone:function(a){var b=this.trues?this.trues.clone(a):null,a=this.falses?this.falses.clone(a):null;return new this.constructor(this.var1.getExpression(),this.var2.getExpression(),b,a,this.negate)}});g.ForNode=dojo.extend(function(a,b,d,c){this.assign=a;this.loop=new i._Filter(b);this.reversed=d;this.nodelist=c;this.pool=
[]},{render:function(a,b){var d,c,e,h=!1,f=this.assign;for(e=0;e<f.length;e++)if(typeof a[f[e]]!="undefined"){h=!0;a=a.push();break}!h&&a.forloop&&(h=!0,a=a.push());e=this.loop.resolve(a)||[];for(d=e.length;d<this.pool.length;d++)this.pool[d].unrender(a,b,this);this.reversed&&(e=e.slice(0).reverse());var g=[];if(dojo.isObject(e)&&!dojo.isArrayLike(e))for(c in e)g.push(e[c]);else g=e;var j=a.forloop={parentloop:a.get("forloop",{})};for(d=c=0;d<g.length;d++){var i=g[d];j.counter0=c;j.counter=c+1;j.revcounter0=
g.length-c-1;j.revcounter=g.length-c;j.first=!c;j.last=c==g.length-1;if(f.length>1&&dojo.isArrayLike(i)){h||(h=!0,a=a.push());var l={};for(e=0;e<i.length&&e<f.length;e++)l[f[e]]=i[e];dojo.mixin(a,l)}else a[f[0]]=i;c+1>this.pool.length&&this.pool.push(this.nodelist.clone(b));b=this.pool[c++].render(a,b,this)}delete a.forloop;if(h)a.pop();else for(e=0;e<f.length;e++)delete a[f[e]];return b},unrender:function(a,b){for(var d=0,c;c=this.pool[d];d++)b=c.unrender(a,b);return b},clone:function(a){return new this.constructor(this.assign,
this.loop.getExpression(),this.reversed,this.nodelist.clone(a))}});dojo.mixin(g,{if_:function(a,b){var d,c,e,h=[],f=b.contents.split();f.shift();b=f.join(" ");f=b.split(" and ");if(f.length==1)e="or",f=b.split(" or ");else{e="and";for(d=0;d<f.length;d++)if(f[d].indexOf(" or ")!=-1)throw Error("'if' tags can't mix 'and' and 'or'");}for(d=0;c=f[d];d++){var k=!1;c.indexOf("not ")==0&&(c=c.slice(4),k=!0);h.push([k,new i._Filter(c)])}d=a.parse(["else","endif"]);c=!1;b=a.next_token();b.contents=="else"&&
(c=a.parse(["endif"]),a.next_token());return new g.IfNode(h,d,c,e)},_ifequal:function(a,b,d){var c=b.split_contents();if(c.length!=3)throw Error(c[0]+" takes two arguments");var e="end"+c[0],h=a.parse(["else",e]),f=!1,b=a.next_token();b.contents=="else"&&(f=a.parse([e]),a.next_token());return new g.IfEqualNode(c[1],c[2],h,f,d)},ifequal:function(a,b){return g._ifequal(a,b)},ifnotequal:function(a,b){return g._ifequal(a,b,!0)},for_:function(a,b){var d=b.contents.split();if(d.length<4)throw Error("'for' statements should have at least four words: "+
b.contents);var c=d[d.length-1]=="reversed",e=c?-3:-2;if(d[d.length+e]!="in")throw Error("'for' tag received an invalid argument: "+b.contents);for(var h=d.slice(1,e).join(" ").split(/ *, */),f=0;f<h.length;f++)if(!h[f]||h[f].indexOf(" ")!=-1)throw Error("'for' tag received an invalid argument: "+b.contents);f=a.parse(["endfor"]);a.next_token();return new g.ForNode(h,d[d.length+e+1],c,f)}})}());