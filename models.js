import * as T from './assets/three.module.min.js';
import {simulate} from './policies.js';

// Original, explanatory geometry. No employer CAD or friend-portfolio assets.
const metal=(color,roughness=.34,metalness=.8)=>new T.MeshStandardMaterial({color,roughness,metalness});
const M={aluminum:metal('#a4a7a7',.34),edge:metal('#d1d0c9',.25),dark:metal('#242a2b',.43),steel:metal('#727b7c',.3),copper:metal('#b77743',.26),pcb:metal('#173f33',.65,.1),gold:metal('#b09b63',.4),black:metal('#161a1a',.65,.1),rubber:metal('#242827',.84,0),paper:metal('#b2a38c',.95,0),wood:metal('#756650',.86,0),white:metal('#d2d1c5',.76,0),orange:metal('#9c4e30',.55,.3),blue:metal('#46565e',.65,.4),green:metal('#657b64',.8,.05)};
const boxGeo=new T.BoxGeometry(1,1,1), cylCache=new Map();
function mesh(geo,mat,p,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;p.add(m);return m;}
function box(p,w,h,d,mat,x=0,y=0,z=0){const m=mesh(boxGeo,mat,p,x,y,z);m.scale.set(w,h,d);return m;}
function cyl(p,r,h,mat,x=0,y=0,z=0,r2=r,n=32){const key=[r,r2,h,n].join(',');if(!cylCache.has(key))cylCache.set(key,new T.CylinderGeometry(r,r2,h,n));return mesh(cylCache.get(key),mat,p,x,y,z);}
function roundBox(p,w,h,d,r,mat,x=0,y=0,z=0){const s=new T.Shape(),a=-w/2,b=-h/2;s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+h-r);s.quadraticCurveTo(a+w,b+h,a+w-r,b+h);s.lineTo(a+r,b+h);s.quadraticCurveTo(a,b+h,a,b+h-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);const g=new T.ExtrudeGeometry(s,{depth:Math.max(.005,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r*.5,bevelSegments:3,steps:1,curveSegments:6});g.translate(0,0,-d/2+r);return mesh(g,mat,p,x,y,z);}
function tube(p,points,r,mat){const curve=new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a)));return mesh(new T.TubeGeometry(curve,Math.min(900,Math.max(32,points.length*2)),r,8,false),mat,p);}
function bolt(p,x,y,z,r=.045){cyl(p,r,.04,M.edge,x,y,z,r,6);cyl(p,r*.46,.044,M.dark,x,y+.022,z,r*.46,6);}
function pedestal(p,w=5,d=4){box(p,w,.16,d,M.dark,0,-.16,0);box(p,w-.08,.025,d-.08,M.black,0,-.06,0);}
function labelPlane(p,w,h,x,y,z,rotation=0){const b=box(p,w,.004,h,M.black,x,y,z);b.rotation.y=rotation; for(let i=0;i<5;i++)box(p,w*(i===0?.65:.8),.005,.008,M.white,x-w*.06,y+.006,z-h*.3+i*h*.13);return b;}
export function makeInverter(exploded=0){
 const g=new T.Group();g.name='Conceptual microinverter assembly';
 const base=new T.Group(),board=new T.Group(),cover=new T.Group();g.add(base,board,cover);
 // Horizontal tray, separate perimeter, gasket, flanges and captive fasteners.
 roundBox(base,3.3,4.15,.17,.07,M.aluminum).rotation.x=-Math.PI/2;
 for(const x of [-1.57,1.57])roundBox(base,.14,4.03,.35,.035,M.edge,x,.16,0).rotation.x=-Math.PI/2;
 for(const z of [-1.98,1.98])roundBox(base,3.1,.14,.35,.035,M.edge,0,.16,z).rotation.x=-Math.PI/2;
 for(const x of [-1.76,1.76])for(const z of [-1.45,1.45]){box(base,.4,.12,.38,M.aluminum,x,.02,z);bolt(base,x,.11,z,.085);}
 for(const x of [-1.49,1.49])for(const z of [-1.9,-.95,0,.95,1.9])bolt(base,x,.36,z,.05);
 for(let i=0;i<18;i++){const fin=roundBox(base,.05,3.9,.29,.016,M.steel,-1.32+i*.156,-.22,0);fin.rotation.x=-Math.PI/2;}
 for(const x of [-1.48,1.48])box(base,.025,.02,3.75,M.rubber,x,.35,0);
 for(const z of [-1.85,1.85])box(base,2.96,.02,.025,M.rubber,0,.35,z);
 // PCB on real standoffs.
 roundBox(board,2.85,3.67,.05,.035,M.pcb,0,.31,0).rotation.x=-Math.PI/2;
 for(const x of [-1.25,1.25])for(const z of [-1.6,1.6]){cyl(board,.055,.24,M.gold,x,.25,z);bolt(board,x,.36,z,.045);}
 // Component keep-outs, traces, test pads and surface-mounted passives.
 let seed=19;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 for(let i=0;i<105;i++){const x=(rnd()-.5)*2.4,z=(rnd()-.5)*3.1;box(board,.025+rnd()*.1,.025,.025+rnd()*.06,i%4?M.black:M.white,x,.36,z);}
 for(let i=0;i<25;i++){const x=-1.25+i*.1;box(board,.008,.003,1.3,M.gold,x,.345,-.8);}
 const coils=[];
 for(const z of [-.75,.7]){
  const cg=new T.Group();cg.position.set(-.38,.48,z);board.add(cg);coils.push(cg);
  const core=mesh(new T.TorusGeometry(.32,.125,12,48),M.black,cg);core.rotation.x=Math.PI/2;
  // Individual copper turns wrap around the toroidal core.
  const pts=[];for(let k=0;k<=550;k++){const a=k/550*Math.PI*2,b=a*31,R=.32+.137*Math.cos(b);pts.push([R*Math.cos(a),.137*Math.sin(b),R*Math.sin(a)]);}
  tube(cg,pts,.018,M.copper);
 }
 const power=new T.Group();board.add(power);
 for(const x of [-1.1,1.1])for(const z of [-1.05,-.35,.35,1.05]){
  box(power,.24,.24,.34,M.black,x,.5,z);box(power,.25,.02,.25,M.edge,x,.63,z);bolt(power,x,.65,z,.035);
  for(let n=0;n<3;n++)box(power,.018,.08,.13,M.edge,x+(n-1)*.065,.39,z+.19);
 }
 const caps=new T.Group();board.add(caps);
 for(const z of [-1.2,-.4,.4,1.2]){roundBox(caps,.42,.53,.32,.025,M.white,.43,.56,z);for(let i=0;i<3;i++)box(caps,.22,.002,.008,M.steel,.43,.834,z-.07+i*.045);}
 const chip=new T.Group();chip.position.set(.12,.38,1.45);board.add(chip);box(chip,.45,.08,.42,M.black);for(let i=0;i<12;i++){box(chip,.025,.025,.07,M.edge,-.2+i*.036,.01,.24);box(chip,.025,.025,.07,M.edge,-.2+i*.036,.01,-.24);}
 for(const z of [-.9,0,.9]){cyl(board,.11,.25,M.aluminum,.88,.47,z);box(board,.12,.007,.016,M.dark,.88,.6,z);}
 // External cables with strain relief and connector grip ridges.
 for(const [i,x]of[-1,-.4,.4,1].entries()){
  const z=-2.05;const conn=cyl(base,.1,.38,M.black,x,.12,z-.13);conn.rotation.x=Math.PI/2;
  for(let n=0;n<5;n++){const c=cyl(base,.115,.025,M.rubber,x,.12,z-.05-n*.055);c.rotation.x=Math.PI/2;}
  tube(base,[[x,.12,-2.32],[x+.08,.12,-2.65],[x+.3,.07,-2.9],[x+.5,.11,-3.0]],.046,M.rubber);
 }
 roundBox(cover,3.19,4.02,.16,.07,M.aluminum,0,.55,0).rotation.x=-Math.PI/2;
 for(let i=0;i<19;i++){const f=roundBox(cover,.055,3.78,.18,.014,M.steel,-1.39+i*.154,.69,0);f.rotation.x=-Math.PI/2;}
 roundBox(cover,.78,1.25,.028,.02,M.dark,.0,.81,.0).rotation.x=-Math.PI/2;
 labelPlane(cover,.64,.48,0,.834,0);
 g.rotation.y=-.24;
 g.userData.parts={base,board,cover,power,coils,caps,chip};
 g.userData.explode=v=>{cover.position.set(.25*v,2.4*v,.2*v);cover.rotation.z=-.13*v;board.position.y=.55*v;};
 g.userData.explode(exploded);
 return g;
}
function warehouse(){const g=new T.Group();pedestal(g,6.7,5.4);
 for(let row=0;row<3;row++){const x=-2.3+row*2.2;
  for(const side of [-.53,.53])for(const z of [-1.9,0,1.9]){box(g,.055,2.6,.06,M.blue,x+side,1.3,z);for(let i=0;i<13;i++)box(g,.014,.025,.066,M.dark,x+side, .2+i*.18,z);}
  for(let level=0;level<3;level++){const y=.2+level*.84;
   for(const side of [-.53,.53])box(g,.07,.09,4,M.orange,x+side,y,0);
   for(const z of [-1.86,-.65,.65,1.86])box(g,1.09,.05,.065,M.steel,x,y,z);
   for(let n=0;n<5;n++){const z=-1.55+n*.77;for(let s=0;s<4;s++)box(g,.98,.035,.09,M.wood,x,y+.07,z-.25+s*.16);
    const h=.4+(n%3)*.11;box(g,.88,h,.6,M.paper,x,y+.1+h/2,z);box(g,.03,h+.003,.602,M.wood,x,y+.1+h/2,z);box(g,.19,.1,.003,M.white,x+.19,y+.23,z+.303);for(let k=0;k<6;k++)box(g,.008,.07,.004,M.black,x+.13+k*.022,y+.23,z+.306);
   }
  }
 }
 const route=new T.Group();g.add(route);
 function setRoute(opt){route.clear();const p=opt?[[-1.18,.025,2.4],[-1.18,.025,-1.5],[1.15,.025,-1.5],[1.15,.025,2.4]]:[[-1.18,.025,2.4],[-1.18,.025,-2.3],[1.15,.025,-2.3],[1.15,.025,2.4],[-1.18,.025,2.4],[-1.18,.025,0],[1.15,.025,0]];tube(route,p,.025,M.copper);}
 setRoute(false);g.userData.route=setRoute;g.rotation.y=-.15;return g;}
function vessel(){const g=new T.Group();pedestal(g,5.6,4);
 const tank=new T.Group();tank.position.y=1.6;tank.rotation.z=Math.PI/2;g.add(tank);
 cyl(tank,.87,3.1,M.aluminum);for(const y of [-1.52,1.52]){const cap=mesh(new T.SphereGeometry(.87,48,24,0,Math.PI*2,0,Math.PI/2),M.aluminum,tank,0,y,0);cap.scale.y=.35;cap.rotation.z=y<0?Math.PI:0;}
 for(const y of [-1.45,1.45]){cyl(tank,.91,.08,M.steel,0,y,0);for(let i=0;i<16;i++){let a=i/16*Math.PI*2;bolt(tank,.85*Math.cos(a),y+.05,.85*Math.sin(a),.033);}}
 for(const x of [-1.04,1.04]){box(g,.33,.9,1.25,M.dark,x,.45,0);box(g,.7,.08,1.58,M.steel,x,.06,0);for(const z of [-.64,.64])bolt(g,x,.13,z,.06);}
 cyl(g,.16,.6,M.steel,.5,2.65,0);cyl(g,.28,.08,M.edge,.5,2.94,0);for(let i=0;i<8;i++)bolt(g,.5+.22*Math.cos(i*Math.PI/4),3.0,.22*Math.sin(i*Math.PI/4),.035);
 tube(g,[[-1.5,1.7,.65],[-2,1.7,.9],[-2,.4,.9],[-2.1,.2,1.4]],.045,M.steel);
 const dial=cyl(g,.22,.07,M.white,-2,1.75,.9);dial.rotation.x=Math.PI/2;
 const needle=box(g,.012,.16,.01,M.orange,-2,1.8,.95);needle.rotation.z=-.8;needle.userData.dynamic=true;
 g.userData.test=v=>{needle.rotation.z=v?.8:-.8;};return g;}
function welding(){const g=new T.Group();pedestal(g,5.5,4.5);
 for(const x of [-1.55,1.55])for(const z of [-1.15,1.15]){box(g,.12,1.1,.12,M.steel,x,.55,z);cyl(g,.12,.1,M.rubber,x,.1,z).rotation.z=Math.PI/2;}
 box(g,3.5,.17,2.7,M.steel,0,1.15,0);for(let i=0;i<11;i++)for(let j=0;j<7;j++)cyl(g,.025,.014,M.black,-1.5+i*.3,1.24,-.9+j*.3);
 const plate=box(g,2.35,.12,1.5,M.aluminum,0,1.3,0);box(g,2.35,.02,.025,M.dark,0,1.37,0);
 for(const x of [-1.4,1.4]){box(g,.09,1.1,.1,M.dark,x,1.81,-.9);box(g,.25,.08,.32,M.black,x,1.4,-.9);}
 box(g,3.0,.12,.17,M.aluminum,0,2.3,-.9);
 const carriage=new T.Group();g.add(carriage);box(carriage,.43,.3,.4,M.dark,0,2.11,-.9);tube(carriage,[[0,2,-.8],[0,1.8,-.7],[0,1.65,-.2]],.055,M.steel);box(carriage,.32,.25,.28,M.black,.28,1.88,-.52);
 cyl(carriage,.08,.12,M.edge,.28,1.76,-.46).rotation.x=Math.PI/2;
 box(carriage,.012,.005,1.35,M.copper,0,1.371,.0);
 tube(g,[[1.4,2.3,-.8],[1.4,2.8,-.7],[0,2.8,-.7],[0,2.2,-.85]],.027,M.rubber);
 const computer=box(g,.6,.42,.13,M.dark,2,1.7,-.7);box(g,.5,.33,.01,M.blue,2,1.7,-.62);
 g.userData.carriage=carriage;return g;}
function exchanger(){const g=new T.Group();pedestal(g,5.2,3.7);
 roundBox(g,3.7,2.6,.85,.1,M.dark,0,1.4,0);
 for(let i=0;i<63;i++){box(g,3.25,.019,.64,i===36?M.copper:M.aluminum,0,.3+i*.035,.47);for(let j=0;j<8;j++)box(g,.012,.019,.065,M.edge,-1.4+j*.4,.3+i*.035,.82);}
 for(const x of [-1.83,1.83]){roundBox(g,.3,2.75,.89,.09,M.steel,x,1.4,0);for(let i=0;i<9;i++)bolt(g,x,.15,.0,.03);}
 for(const x of [-1.8,1.8]){const c=cyl(g,.15,.6,M.steel,x,2.6,.4);c.rotation.z=Math.PI/2;}
 const defect=box(g,.4,.08,.03,M.orange,.8,1.56,.84);g.userData.defect=defect;g.rotation.y=-.18;return g;}
function network(){const g=new T.Group();pedestal(g,5.8,4.8);const nodes=[];
 const locations=[[-2,1,-1.5],[-1,1.45,-1.65],[.1,.9,-1.7],[1.2,1.3,-1.3],[2,1,-.4],[-1.9,.7,-.1],[-.8,1.7,-.2],[.5,1.1,0],[1.6,1.7,.7],[-1.4,.9,1.4],[-.2,1.4,1.65],[1,1,1.8]];
 locations.forEach((p,i)=>{const node=new T.Group();node.position.set(...p);g.add(node);cyl(node,.11,p[1],M.steel,0,-p[1]/2,0);box(node,.4,.17,.35,M.edge,0,.06,0);for(let k=0;k<4;k++)box(node,.035,.12,.32,M.dark,-.14+k*.09,.2,0);node.userData.region=['West','North','East','South'][i%4];nodes.push(node);});
 const lines=new T.Group();g.add(lines);for(let i=0;i<12;i++){const a=locations[i],b=locations[(i+3)%12];tube(lines,[[...a],[ (a[0]+b[0])/2,Math.max(a[1],b[1])+.5,(a[2]+b[2])/2],[...b]],.008,M.copper);}
 g.userData.filter=r=>nodes.forEach(n=>{n.visible=r==='All'||n.userData.region===r;});return g;}
function inventory(){const g=new T.Group();pedestal(g,6,4);
 const bars=[];for(let i=0;i<12;i++){const b=roundBox(g,.25,1,.34,.025,M.aluminum,-2.4+i*.44,.5,0);b.userData.dynamic=true;bars.push(b);box(g,.028,.015,2.8,M.steel,-2.4+i*.44,0,0);}
 for(let i=0;i<4;i++)box(g,5.3,.018,.015,M.steel,0,i*.6,0);
 g.userData.policy=p=>{const r=simulate(p);r.rows.forEach((row,i)=>{let h=.1+row.ending/100;bars[i].scale.y=h;bars[i].position.y=h/2;});};g.userData.policy('POQ');return g;}
function books(){const g=new T.Group();pedestal(g,4.7,3.4);
 for(let i=0;i<7;i++){const b=new T.Group();b.position.set(-.12+i*.01,.15+i*.17,0);b.rotation.y=i*.05;g.add(b);roundBox(b,2.45,1.8,.14,.025,i%3===0?M.orange:M.dark).rotation.x=-Math.PI/2;box(b,2.36,.115,1.69,M.paper,0,0,0);for(let n=0;n<5;n++)box(b,2.37,.003,1.7,M.white,0,-.04+n*.02,0);}
 const tall=new T.Group();g.add(tall);tall.position.set(1.8,1.15,-.25);tall.rotation.z=-.12;box(tall,.35,2.3,1.7,M.dark);box(tall,.28,2.15,1.62,M.paper);box(tall,.37,.05,1.71,M.orange,0,.7,0);return g;}
function contact(){const g=new T.Group();const points=[];for(let i=0;i<780;i++){const a=i*2.3999632,y=1-2*(i+.5)/780,r=Math.sqrt(1-y*y);points.push([Math.cos(a)*r*1.65,y*1.65+1.9,Math.sin(a)*r*1.65]);}
 const geo=new T.SphereGeometry(.018,6,4);const dots=new T.InstancedMesh(geo,M.edge,780);const d=new T.Object3D();g.add(dots);
 const apply=mode=>points.forEach((p,i)=>{let[x,y,z]=p;if(mode==='email'){const t=i/780;let side=Math.floor(t*4),s=t*4-side;x=side%2===0?(s-.5)*3.6:(side===1?1.8:-1.8);y=side%2===1?(.5-s)*2.1+1.9:(side===0?2.95:.85);z=Math.sin(i)*.08;if(i>520){const k=(i-520)/260;x=(k-.5)*3.6;y=1.3+Math.abs(k-.5)*3.1;}}
  if(mode==='linkedin'){const k=i%3;x=(i%26)/26*2.3-1.15;y=Math.floor(i/26)/30*2.5+.6;z=Math.sin(i)*.06;if(k===0)x=-1.2;}
  d.position.set(x,y,z);d.updateMatrix();dots.setMatrixAt(i,d.matrix);});apply('core');g.userData.morph=m=>{apply(m);dots.instanceMatrix.needsUpdate=true;};return g;}
// Merge static meshes by material within each local group. Animated parent
// groups, instanced dots and explicitly dynamic meshes retain their transforms.
function batch(group){
 for(const child of [...group.children])if(child.isGroup)batch(child);
 const sets=new Map();for(const m of group.children){if(!m.isMesh||m.isInstancedMesh||m.userData.dynamic)continue;const key=m.material;if(!sets.has(key))sets.set(key,[]);sets.get(key).push(m);}
 for(const[material,meshes]of sets){if(meshes.length<2)continue;const positions=[],normals=[];
  for(const m of meshes){m.updateMatrix();const p=m.geometry.attributes.position,n=m.geometry.attributes.normal,idx=m.geometry.index,nm=new T.Matrix3().getNormalMatrix(m.matrix);for(let k=0;k<(idx?idx.count:p.count);k++){const j=idx?idx.getX(k):k;positions.push(...new T.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrix).toArray());normals.push(...new T.Vector3().fromBufferAttribute(n,j).applyMatrix3(nm).normalize().toArray());}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));const merged=new T.Mesh(geo,material);merged.castShadow=true;merged.receiveShadow=true;meshes.forEach(m=>group.remove(m));group.add(merged);
 }
}
export function buildModel(index){let g;
 if(index<2){g=new T.Group();pedestal(g,5.5,5.9);const inverter=makeInverter(index===0?.64:0);inverter.position.y=.43;g.add(inverter);g.userData.inverter=inverter;g.userData.explode=inverter.userData.explode;}
 else g=[null,null,warehouse,vessel,welding,exchanger,network,inventory,books,contact][index]();
 g.name=['Origin','Generac','USC DC','Vindeep','L&T','Banco','Workbench','Inventory','Foundation','Contact'][index];
 batch(g);return g;
}
export {T};
