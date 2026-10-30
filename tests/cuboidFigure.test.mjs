import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CUBOID_PROJECTION,projectCuboidPoint,createCuboidGeometry,createCuboidSVG} from '../exercices/figures/cuboidFigure.js';

// Coordonnées extraites en exécutant les fonctions des sources PythonTeX
// fournies le 24/10/2026, avant toute transformation SVG. Aucun moteur JS
// n'intervient dans la fabrication de cette référence indépendante.
const reference=JSON.parse(readFileSync(new URL('./fixtures/cuboidPythonTex.json',import.meta.url),'utf8'));
test('pavés : projection PythonTeX et inversion de l’axe vertical',()=>{
  assert.deepEqual(projectCuboidPoint(1,0,0),[0.4743416490252569,-0.15811388300841897]);
  assert.deepEqual(projectCuboidPoint(0,1,0),[-0.35355339059327373,-0.35355339059327373]);
  assert.deepEqual(projectCuboidPoint(0,0,1),[0,-0.5]);
  assert.ok(Object.isFrozen(CUBOID_PROJECTION.u));
});
test('pavés : comparaison des 221 faces aux coordonnées PythonTeX indépendantes',()=>{
  for(const sample of reference){
    const geometry=createCuboidGeometry(sample);assert.equal(geometry.faces.length,sample.faces.length,sample.name);
    for(let i=0;i<sample.faces.length;i++)for(let j=0;j<4;j++){
      const expected=sample.faces[i].points[j],actual=geometry.faces[i].points[j];
      assert.ok(Math.abs(actual[0]-expected[0])<1e-12,`${sample.name} face ${i} x`);
      assert.ok(Math.abs(actual[1]+expected[1])<1e-12,`${sample.name} face ${i} y`);
    }
    const svg=createCuboidSVG(sample),polygons=[...svg.matchAll(/<polygon[^>]+fill="([^"]+)" fill-opacity="([^"]+)"/g)];
    assert.deepEqual(polygons.map(p=>[p[1],Number(p[2])]),sample.faces.map(f=>[f.color,f.opacity]));
  }
});
function check(dimensions){
  const {columns:n,rows:m,layers:h}=dimensions,g=createCuboidGeometry(dimensions),svg=createCuboidSVG(dimensions);
  assert.equal(g.cubeCount,n*m*h);assert.equal(g.faces.length,n*h+m*h+n*m);
  assert.deepEqual(g.faces.map(f=>f.side),[...Array(n*h).fill('front'),...Array(m*h).fill('side'),...Array(n*m).fill('top')]);
  const vertices=new Map();
  for(const face of g.faces){
    assert.equal(face.points.length,4);
    const [a,b,c,d]=face.points;assert.ok(Math.abs((b[0]-a[0])*(d[1]-a[1])-(b[1]-a[1])*(d[0]-a[0]))>0);
    assert.ok(Math.abs(a[0]+c[0]-b[0]-d[0])<1e-12);assert.ok(Math.abs(a[1]+c[1]-b[1]-d[1])<1e-12);
    for(const p of face.points){const key=JSON.stringify(p);if(vertices.has(key))assert.equal(p,vertices.get(key));vertices.set(key,p);}
  }
  assert.doesNotMatch(svg,/NaN|undefined|Infinity/);assert.match(svg,/stroke="none"/);
  assert.equal((svg.match(/<polygon/g)||[]).length,g.faces.length);
  const [x,y,width,height]=svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  for(const face of g.faces)for(const [px,py] of face.points){assert.ok(px*80>x&&px*80<x+width);assert.ok(py*80>y&&py*80<y+height);}
  assert.equal(new Set(g.faces.map(f=>f.cell.join(',')+f.side)).size,g.faces.length);
}
test('pavés : 24 configurations de Q1, dimensions a+1 et b+1',()=>{
  for(let a=3;a<=6;a++)for(let b=1;b<=6;b++)check({columns:a+1,rows:b+1,layers:1});
  // D1 direct coupe ce sommet à y=2,1 ; le QCM monte à 2,6.
  // L'auto-cadrage doit préserver la figure entière dans les deux cas.
  const {bounds}=createCuboidGeometry({columns:7,rows:2,layers:1});
  assert.ok(-bounds.yMin>2.1&&-bounds.yMin<2.6);
});
test('pavés : 27 configurations directes et quatre configurations QCM de Q5',()=>{
  let direct=0,qcm=0;
  for(let a=3;a<=5;a++)for(let b=1;b<=3;b++)for(let c=1;c<=3;c++){check({columns:a+1,rows:b+1,layers:c+1});direct++;if(a<=4&&b<=2&&c<=2&&b!==c)qcm++;}
  assert.equal(direct,27);assert.equal(qcm,4);check({columns:1,rows:1,layers:1});
});
test('pavés : arêtes communes et côtés extérieurs partagent exactement les mêmes sommets',()=>{
  const {faces}=createCuboidGeometry({columns:5,rows:3,layers:3});
  const front=faces.filter(f=>f.side==='front'),side=faces.filter(f=>f.side==='side'),top=faces.filter(f=>f.side==='top');
  assert.equal(front[0].points[0],side[0].points[0]);assert.equal(front[0].points[3],side[0].points[3]);
  assert.equal(front[0].points[3],top[0].points[0]);assert.equal(front[0].points[2],top[0].points[1]);
  assert.equal(top[0].points[1],top[3].points[0]);assert.equal(top[0].points[2],top[3].points[3]);
  assert.equal(front[0].points[0],front[1].points[3]);
});
test('pavés : options de couleur, opacité, contour, cadrage et échappement',()=>{
  const svg=createCuboidSVG({columns:7,rows:7,layers:4,colors:{top:'#123456'},opacities:{side:0.1},stroke:'black',strokeWidth:4,maxWidth:100,maxHeight:90,label:'<cube "test">'});
  assert.match(svg,/fill="#123456"/);assert.match(svg,/fill-opacity="0.1"/);assert.match(svg,/aria-label="&lt;cube &quot;test&quot;&gt;"/);
  const width=Number(svg.match(/ width="([^"]+)"/)[1]),height=Number(svg.match(/ height="([^"]+)"/)[1]);
  assert.ok(width<=100&&height<=90);assert.match(svg,/max-width:100%;height:auto/);
  for(const columns of [0,-1,1.5,NaN,Infinity])assert.throws(()=>createCuboidSVG({columns,rows:2}),RangeError);
  for(const options of [{opacities:{top:2}},{scale:0},{padding:-1},{strokeWidth:NaN},{maxWidth:0}])assert.throws(()=>createCuboidSVG({columns:2,rows:2,...options}),RangeError);
});
