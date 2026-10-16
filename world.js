import {T,buildModel} from './models.js';
import {reportRenderFailure} from './render-diagnostics.js';
const GAP=24;
export class World{
 constructor(canvas,{paused=false,onSelect}={}){
  this.canvas=canvas;this.paused=paused;this.progress=0;this.target=0;this.models=new Map();this.onSelect=onSelect;this.available=false;this.reading=false;this.explosion=0;this.explosionTarget=0;this.scan=false;this.time=0;this.pointer={x:0,y:0};this.frames=0;
  try{this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});}catch(e){this.fail(e,'initialization');this.ready=Promise.resolve();return;}
  this.available=true;this.scene=new T.Scene();this.scene.background=new T.Color('#141717');this.scene.fog=new T.Fog('#141717',17,46);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.0;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
  this.camera=new T.PerspectiveCamera(36,1,.1,110);this.scene.add(new T.HemisphereLight('#e5e6df','#292d2a',1.35));
  this.key=new T.DirectionalLight('#fff2dd',3.8);this.key.position.set(-3,9,6);this.key.castShadow=true;this.key.shadow.mapSize.set(2048,2048);Object.assign(this.key.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.1,far:35});this.key.shadow.bias=-.0004;this.key.shadow.normalBias=.025;this.scene.add(this.key,this.key.target);
  this.fill=new T.DirectionalLight('#cddce2',1.1);this.fill.position.set(6,3,-5);this.scene.add(this.fill,this.fill.target);
  this.rim=new T.DirectionalLight('#e5e3db',1.8);this.rim.position.set(-5,4,-4);this.scene.add(this.rim,this.rim.target);
  const floor=new T.Mesh(new T.PlaneGeometry(300,80),new T.MeshStandardMaterial({color:'#262c28',roughness:.86,metalness:.1}));floor.rotation.x=-Math.PI/2;floor.position.set(108,-.27,0);floor.receiveShadow=true;this.scene.add(floor);
  this.makeEnvironment();this.ensure(0);this.ensure(1);this.resize();addEventListener('resize',()=>this.resize());
  this.raycaster=new T.Raycaster();addEventListener('pointerup',e=>{if(!e.target.closest('button,a,input,select,dialog,.copy'))this.pick(e);});
  addEventListener('pointermove',e=>{this.pointer.x=e.clientX/innerWidth-.5;this.pointer.y=e.clientY/innerHeight-.5;},{passive:true});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.fail(new Error(e.statusMessage||'WebGL rendering context lost.'),'context lost');});
  canvas.addEventListener('webglcontextrestored',()=>{this.available=true;document.body.classList.remove('no-gpu');try{this.renderer.render(this.scene,this.camera);document.getElementById('stage').classList.add('live');}catch(error){this.fail(error,'context restoration');}});
  this.last=performance.now();this.animate=this.animate.bind(this);this.ready=Promise.resolve();requestAnimationFrame(this.animate);
 }
 fail(error,phase){this.available=false;this.error=reportRenderFailure(error,phase);document.getElementById('stage')?.classList.remove('live');document.body.classList.add('no-gpu');}
 makeEnvironment(){
  // Large neutral softboxes give each metal its own readable reflection.
  const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');x.fillStyle='#666c69';x.fillRect(0,0,1024,512);x.fillStyle='#d9dfd9';x.fillRect(0,0,1024,160);x.fillStyle='#f4f1e8';x.fillRect(160,160,110,200);x.fillRect(650,150,50,210);x.fillStyle='#171c1a';x.fillRect(0,350,1024,162);const t=new T.CanvasTexture(c);t.mapping=T.EquirectangularReflectionMapping;t.colorSpace=T.SRGBColorSpace;const p=new T.PMREMGenerator(this.renderer);this.scene.environment=p.fromEquirectangular(t).texture;t.dispose();p.dispose();
 }
 ensure(i){if(i<0||i>9||this.models.has(i))return this.models.get(i);const m=buildModel(i);m.position.x=i*GAP;this.scene.add(m);this.models.set(i,m);return m;}
 setProgress(p,reading){this.target=p;this.reading=reading;for(const i of [Math.floor(p)-1,Math.floor(p),Math.ceil(p),Math.ceil(p)+1])this.ensure(i);if(this.paused)this.progress=p;}
 setPaused(v){this.paused=v;if(v)this.progress=this.target;}
 explode(v){this.explosionTarget=v?1:0;if(this.paused)this.explosion=this.explosionTarget;}
 route(v){this.ensure(2)?.userData.route(v);}
 test(v){this.ensure(3)?.userData.test(v);}
 weld(v){this.scan=v;}
 filter(r){this.ensure(6)?.userData.filter(r);}
 policy(p){this.ensure(7)?.userData.policy(p);}
 morph(m){this.ensure(9)?.userData.morph(m);}
 resize(){const w=innerWidth,h=innerHeight;this.mobile=w<650;this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,this.mobile?1.4:1.7));this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.fov=this.mobile?43:36;this.camera.clearViewOffset();this.camera.setViewOffset(w,h,this.mobile?0:-w*.155,this.mobile?h*.19:0,w,h);this.camera.updateProjectionMatrix();}
 pick(e){if(Math.round(this.target)!==1||!this.available||document.querySelector('dialog[open]'))return;const r=this.canvas.getBoundingClientRect();this.raycaster.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),this.camera);if(this.raycaster.intersectObject(this.ensure(1),true).length)this.onSelect?.();}
 animate(now){requestAnimationFrame(this.animate);const dt=Math.min(.05,(now-this.last)/1000);this.last=now;if(!this.available||document.hidden||this.reading)return;
  if(!this.paused){this.time+=dt;this.progress+=(this.target-this.progress)*(1-Math.exp(-dt*7));this.explosion+=(this.explosionTarget-this.explosion)*(1-Math.exp(-dt*5));}
  else{this.progress=this.target;this.explosion=this.explosionTarget;}
  const p=this.progress,c=p*GAP;const px=this.paused?0:this.pointer.x*.16,py=this.paused?0:this.pointer.y*.1;
  this.camera.position.set(c+(this.mobile?7.2:6.7)+px,this.mobile?6.3:5.7+py,this.mobile?10.5:8.8);this.camera.lookAt(c,.9,0);
  this.key.position.x=c-3;this.key.target.position.set(c,0,0);this.fill.position.x=c+6;this.fill.target.position.set(c,1,0);this.rim.position.x=c-5;this.rim.target.position.set(c,1,0);
  for(const[i,m]of this.models){m.visible=Math.abs(p-i)<1.7;if(i===0){m.userData.explode(.64);m.rotation.y=this.paused?0:Math.sin(this.time*.13)*.035;}if(i===1)m.userData.explode(this.explosion);if(i===4&&this.scan&&!this.paused)m.userData.carriage.position.x=Math.sin(this.time*.8)*1.05;if(i===9&&!this.paused)m.rotation.y=Math.sin(this.time*.18)*.12;}
  try{this.renderer.render(this.scene,this.camera);if(this.frames++===1)document.getElementById('stage').classList.add('live');}catch(error){this.fail(error,'frame render');}
 }
}
