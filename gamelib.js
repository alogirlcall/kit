var iOS=(navigator.userAgent.indexOf("iPhone;")!=-1||navigator.userAgent.indexOf("iPod;")!=-1||navigator.userAgent.indexOf("iPad;")!=-1);var isFireFox=(navigator.userAgent.indexOf(" Firefox/")!=-1);var GameHandler={game:null,paused:false,canvas:null,width:0,height:0,offsetX:0,offsetY:0,frameCount:0,frameMultipler:1,frameStart:0,maxfps:0,frametime:0,FPSMS:1000/60,GAMEPAD:1000,gamepad:null,audioContext:null,hasAudio:function(){return this.audioContext!==null;},audioComp:null,audioGain:null,sounds:{},soundEnabled:true,KEY:{SHIFT:16,CTRL:17,ESC:27,RIGHT:39,UP:38,LEFT:37,DOWN:40,SPACE:32,A:65,D:68,E:69,G:71,L:76,P:80,R:82,S:83,T:84,W:87,Z:90,OPENBRACKET:219,CLOSEBRACKET:221},init:function(minimumSize,padding)
{var canvas=document.getElementById('canvas');if(!minimumSize)
{canvas.width=this.width;canvas.height=this.height;}
this.canvas=canvas;this.minimumSize=minimumSize;this.padding=padding;if(!iOS)
{window.addEventListener('resize',this.resizeHandler,false);window.addEventListener('scroll',this.resizeHandler,false);}
this.resizeHandler();this.gamepad=(typeof navigator.getGamepads==="function");this.audioContext=typeof AudioContext==="function"?new AudioContext():null;if(this.audioContext)
{this.audioGain=this.audioContext.createGain();this.audioGain.gain.value=0.333;this.audioComp=this.audioContext.createDynamicsCompressor();this.audioGain.connect(this.audioComp);this.audioComp.connect(this.audioContext.destination);}},resizeHandler:function()
{var me=GameHandler;var el=me.canvas,x=0,y=0;do
{y+=el.offsetTop;x+=el.offsetLeft;}while(el=el.offsetParent);me.offsetX=x- window.pageXOffset;me.offsetY=y- window.pageYOffset;if(me.minimumSize)
{var size=window.innerHeight>me.minimumSize+ me.padding?window.innerHeight- me.padding:me.minimumSize;if(me.width!==size)
{me.width=me.height=me.canvas.width=me.canvas.height=size;}}},start:function(game)
{if(game instanceof Game.Main)
{this.game=game;GameHandler.frameStart=Date.now();}
GameHandler.game.frame.call(GameHandler.game);},pause:function()
{if(this.paused)
{this.paused=false;GameHandler.frameStart=Date.now();GameHandler.game.frame.call(GameHandler.game);}
else
{this.paused=true;}},loadSound:function(url,id)
{if(this.hasAudio())
{var request=new XMLHttpRequest();request.open("GET",url,true);request.responseType="arraybuffer";var me=this;request.onload=function(){me.audioContext.decodeAudioData(request.response,function(buffer){me.sounds[id]=buffer;});};request.send();}},playSound:function(id)
{if(this.soundEnabled&&this.hasAudio()&&this.sounds[id])
{var source=this.audioContext.createBufferSource();source.buffer=this.sounds[id];source.connect(this.audioGain);source.start(0);}}};if(typeof Game=="undefined"||!Game)
{var Game={};}
Game.worldToScreen=function worldToScreen(vector,world,radiusx,radiusy)
{radiusx=(radiusx?radiusx:0);radiusy=(radiusy?radiusy:radiusx);var screenvec=null,viewx=vector.x- world.viewx,viewy=vector.y- world.viewy;if(viewx<world.viewsize+ radiusx&&viewy<world.viewsize+ radiusy&&viewx>-radiusx&&viewy>-radiusy)
{screenvec=new Vector(viewx,viewy).scale(world.scale);}
return screenvec;};(function()
{Game.Main=function()
{var me=this;document.onkeydown=function(event)
{var keyCode=event.keyCode;if(me.sceneIndex!==-1)
{if(me.scenes[me.sceneIndex].onKeyDownHandler(keyCode))
{event.preventDefault();event.stopPropagation();}}
else
{if(keyCode===GameHandler.KEY.SPACE)
{event.preventDefault();event.stopPropagation();}}};document.onkeyup=function(event)
{var keyCode=event.keyCode;if(me.sceneIndex!==-1)
{if(me.scenes[me.sceneIndex].onKeyUpHandler(keyCode))
{event.preventDefault();event.stopPropagation();}}
else
{if(keyCode===GameHandler.KEY.SPACE)
{event.preventDefault();event.stopPropagation();}}};var buttonPressed=function buttonPressed(e,pressed)
{if(me.sceneIndex!==-1)
{if(pressed)
{me.scenes[me.sceneIndex].onKeyDownHandler(GameHandler.GAMEPAD+ e.button);}
else
{me.scenes[me.sceneIndex].onKeyUpHandler(GameHandler.GAMEPAD+ e.button);}}};};Game.Main.prototype={scenes:[],startScene:null,endScene:null,currentScene:null,sceneIndex:-1,interval:null,frame:function frame()
{var frameStart=Date.now();GameHandler.resizeHandler();if(GameHandler.gamepad&&this.sceneIndex!==-1)
{for(var i=0,pad;i<navigator.getGamepads().length;i++)
{if(pad=navigator.getGamepads()[i])
{for(var b=0;b<pad.buttons.length;b++)
{if(pad.buttons[b].pressed)
{this.scenes[this.sceneIndex].onKeyDownHandler(GameHandler.GAMEPAD+ b);}}
for(var a=0;a<pad.axes.length;a++)
{this.scenes[this.sceneIndex].onAxisHandler(a,pad.axes[a]);}
break;}}}
var currentScene=this.currentScene;if(currentScene===null)
{this.sceneIndex=0;currentScene=this.scenes[0];currentScene.onInitScene();}
else if(this.isGameOver())
{this.sceneIndex=-1;currentScene=this.endScene;currentScene.onInitScene();}
if((!currentScene.interval||currentScene.interval.complete)&&currentScene.isComplete())
{this.sceneIndex++;if(this.sceneIndex<this.scenes.length)
{currentScene=this.scenes[this.sceneIndex];}
else
{this.sceneIndex=0;currentScene=this.scenes[0];}
currentScene.onInitScene();}
var ctx=GameHandler.canvas.getContext('2d');currentScene.world.scale=GameHandler.width/currentScene.world.viewsize;if(!currentScene.interval||currentScene.interval.complete)
{currentScene.onBeforeRenderScene();currentScene.onRenderScene(ctx);}
else
{this.onRenderGame(ctx);if(currentScene.interval)
{currentScene.interval.intervalRenderer.call(currentScene,currentScene.interval,ctx);}}
this.currentScene=currentScene;GameHandler.frameCount++;var frameInterval=frameStart- GameHandler.frameStart;if(frameInterval===0)frameInterval=1;if(DEBUG)
{if(GameHandler.frameCount%16===0)GameHandler.maxfps=~~(1000/frameInterval);}
GameHandler.frametime=Date.now()- frameStart;GameHandler.frameMultipler=frameInterval/GameHandler.FPSMS;GameHandler.frameStart=frameStart;var frameOffset=~~(GameHandler.FPSMS- GameHandler.frametime);if(!GameHandler.paused)requestAnimFrame(GameHandler.start,frameOffset);},onRenderGame:function onRenderGame(ctx)
{},isGameOver:function isGameOver()
{return false;}};})();(function()
{Game.Scene=function(game,interval)
{this.game=game;this.interval=interval;};Game.Scene.prototype={game:null,interval:null,world:{size:1500,viewx:0,viewy:0,viewsize:1000,scale:1000/1500},onInitScene:function onInitScene()
{if(this.interval!==null)
{this.interval.reset();}},onBeforeRenderScene:function onBeforeRenderScene()
{},onRenderScene:function onRenderScene(ctx)
{},onRenderInterval:function onRenderInterval(ctx)
{},onKeyDownHandler:function onKeyDownHandler(keyCode)
{},onKeyUpHandler:function onKeyUpHandler(keyCode)
{},onAxisHandler:function onAxisHandler(axis,delta)
{},isComplete:function isComplete()
{return false;}};})();(function()
{Game.Interval=function(label,intervalRenderer)
{this.label=label;this.intervalRenderer=intervalRenderer;this.framecounter=0;this.complete=false;};Game.Interval.prototype={label:null,intervalRenderer:null,framecounter:0,complete:false,reset:function reset()
{this.framecounter=0;this.complete=false;}};})();(function()
{Game.Actor=function(p,v)
{this.position=p;this.vector=v;return this;};Game.Actor.prototype={position:null,vector:null,alive:true,radius:0,expired:function expired()
{return!(this.alive);},hit:function hit(force)
{this.alive=false;return true;},worldToScreen:function worldToScreen(ctx,world,radius)
{var viewposition=Game.worldToScreen(this.position,world,radius);if(viewposition)
{ctx.translate(viewposition.x,viewposition.y);ctx.scale(world.scale,world.scale);}
return viewposition;},onUpdate:function onUpdate()
{},onRender:function onRender(ctx,world)
{}};})();(function()
{Game.SpriteActor=function(p,v,s)
{Game.SpriteActor.superclass.constructor.call(this,p,v);if(s)this.frameSize=s;return this;};extend(Game.SpriteActor,Game.Actor,{frameSize:64,animImage:null,animLength:0,animForward:true,animSpeed:1.0,animFrame:0,renderSprite:function renderSprite(ctx,x,y,w,cyclic)
{var offset=this.animFrame<<6,fs=this.frameSize;ctx.drawImage(this.animImage,0,offset,fs,fs,x,y,w,w);if(cyclic)
{if(x<0||y<0)
{ctx.drawImage(this.animImage,0,offset,fs,fs,(x<0?(GameHandler.width+ x):x),(y<0?(GameHandler.height+ y):y),w,w);}
if(x+ w>=GameHandler.width||y+ w>=GameHandler.height)
{ctx.drawImage(this.animImage,0,offset,fs,fs,(x+ w>=GameHandler.width?(x- GameHandler.width):x),(y+ w>=GameHandler.height?(y- GameHandler.height):y),w,w);}}
if(this.animForward)
{this.animFrame+=this.animSpeed;if(this.animFrame>=this.animLength)
{this.animFrame=0;}}
else
{this.animFrame-=this.animSpeed;if(this.animFrame<0)
{this.animFrame=this.animLength- 1;}}}});})();(function()
{Game.EffectActor=function(p,v,lifespan)
{Game.EffectActor.superclass.constructor.call(this,p,v);this.lifespan=lifespan;this.effectStart=GameHandler.frameStart;return this;};extend(Game.EffectActor,Game.Actor,{lifespan:0,effectStart:0,expired:function expired()
{return(GameHandler.frameStart- this.effectStart>this.lifespan);},effectValue:function effectValue(val,offset)
{if(!offset)offset=this.lifespan;var rem=this.lifespan-(GameHandler.frameStart- this.effectStart),result=val;if(rem<offset)
{result=(val/offset)*rem;if(result<0)result=0;else if(result>val)result=val;}
return result;}});})();(function()
{Game.Preloader=function()
{this.images=[];return this;};Game.Preloader.prototype={images:null,callback:null,counter:0,addImage:function addImage(img,url)
{var me=this;img.url=url;img.onload=function()
{me.counter++;if(me.counter===me.images.length)
{me.callback.call(me);}};this.images.push(img);},onLoadCallback:function onLoadCallback(fn)
{this.counter=0;this.callback=fn;for(var i=0,j=this.images.length;i<j;i++)
{this.images[i].src=this.images[i].url;}}};})();Game.drawText=function(g,txt,font,x,y,col)
{g.save();if(col)g.strokeStyle=col;g.font=font;g.strokeText(txt,x,y);g.restore();};Game.centerDrawText=function(g,txt,font,y,col)
{g.save();if(col)g.strokeStyle=col;g.font=font;g.strokeText(txt,(GameHandler.width- g.measureText(txt).width)/ 2, y);
g.restore();};Game.fillText=function(g,txt,font,x,y,col)
{g.save();if(col)g.fillStyle=col;g.font=font;g.fillText(txt,x,y);g.restore();};Game.centerFillText=function(g,txt,font,y,col)
{g.save();if(col)g.fillStyle=col;g.font=font;g.fillText(txt,(GameHandler.width- g.measureText(txt).width)/ 2, y);
g.restore();};Game.fontSize=function fontSize(world,size)
{var s=~~(size*world.scale*2);if(s>20)s=20;else if(s<8)s=8;return s;};Game.fontFamily=function fontFamily(world,size,font)
{return Game.fontSize(world,size)+"pt "+(font?font:"Courier New");};(function()
{Game.Prerenderer=function()
{this.images=[];this._renderers=[];return this;};Game.Prerenderer.prototype={images:null,_renderers:null,addRenderer:function addRenderer(fn,id)
{this._renderers[id]=fn;},execute:function execute(fnCallback,fnCompleted)
{var me=this,buffer=document.createElement('canvas'),renderKeys=Object.keys(this._renderers),renderCount=0;var fn=function()
{var id=renderKeys[renderCount++];me.images[id]=me._renderers[id].call(me,buffer);if(fnCallback)
{var percentComplete=~~(100/renderKeys.length)*renderCount;fnCallback.call(me,percentComplete);}
if(renderCount<renderKeys.length)
{setTimeout(function(){fn()},0);}
else if(fnCompleted)
{fnCompleted.call(me);}};fn();}};})();window.requestAnimFrame=(function()
{return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(callback,frameOffset)
{window.setTimeout(callback,frameOffset);};})();