// Projection PythonTeX des séries de remédiation : ne pas remplacer par une
// projection isométrique. Les sommets partagés sont calculés une seule fois.
export const CUBOID_PROJECTION = Object.freeze({
  u:Object.freeze([0.4743416490252569,0.15811388300841897]),
  v:Object.freeze([-0.35355339059327373,0.35355339059327373]),
  z:Object.freeze([0,0.5])
});

export function projectCuboidPoint(x,y,z) {
  return [x*CUBOID_PROJECTION.u[0]+y*CUBOID_PROJECTION.v[0],
    -(x*CUBOID_PROJECTION.u[1]+y*CUBOID_PROJECTION.v[1]+z*CUBOID_PROJECTION.z[1])];
}

export function createCuboidGeometry({columns,rows,layers=1}) {
  for(const [name,value] of Object.entries({columns,rows,layers})) {
    if(!Number.isSafeInteger(value)||value<1)throw new RangeError(`${name} doit être un entier strictement positif.`);
  }
  const vertices=new Map();
  const point=(x,y,z)=>{
    const key=`${x},${y},${z}`;
    if(!vertices.has(key))vertices.set(key,projectCuboidPoint(x,y,z));
    return vertices.get(key);
  };
  const faces=[];
  const face=(side,cell,corners)=>faces.push({side,cell,points:corners.map(c=>point(...c))});
  // Même ordre que R1/R9, puis R3/R10, puis R4 : les trois peaux
  // visibles uniquement, sans faces internes ni arêtes arrière.
  for(let x=0;x<columns;x++)for(let layer=0;layer<layers;layer++) {
    face('front',[x,0,layer],[[x,0,-layer],[x+1,0,-layer],[x+1,0,1-layer],[x,0,1-layer]]);
  }
  for(let y=0;y<rows;y++)for(let layer=0;layer<layers;layer++) {
    face('side',[0,y,layer],[[0,y,-layer],[0,y+1,-layer],[0,y+1,1-layer],[0,y,1-layer]]);
  }
  for(let x=0;x<columns;x++)for(let y=0;y<rows;y++) {
    face('top',[x,y,0],[[x,y,1],[x+1,y,1],[x+1,y+1,1],[x,y+1,1]]);
  }
  const points=[...vertices.values()];
  return {columns,rows,layers,cubeCount:columns*rows*layers,faces,
    bounds:{xMin:Math.min(...points.map(p=>p[0])),xMax:Math.max(...points.map(p=>p[0])),
      yMin:Math.min(...points.map(p=>p[1])),yMax:Math.max(...points.map(p=>p[1]))}};
}

export function createCuboidSVG({columns,rows,layers=1,
  colors={},opacities={},stroke='none',strokeWidth=2,
  scale=80,padding=8,maxWidth=640,maxHeight=480,
  label='Pavé droit composé de petits cubes'
}={}) {
  for(const value of [scale,maxWidth,maxHeight])if(!Number.isFinite(value)||value<=0)throw new RangeError('Dimensions d’affichage invalides.');
  for(const value of [padding,strokeWidth])if(!Number.isFinite(value)||value<0)throw new RangeError('Marges ou épaisseur invalides.');
  const palette={front:'red',side:'red',top:'blue',...colors};
  const alpha={front:0.5,side:0.25,top:0.5,...opacities};
  for(const value of Object.values(alpha))if(!Number.isFinite(value)||value<0||value>1)throw new RangeError('Opacité invalide.');
  const geometry=createCuboidGeometry({columns,rows,layers});
  const {bounds}=geometry,margin=padding+(stroke==='none'?0:strokeWidth/2);
  const width=(bounds.xMax-bounds.xMin)*scale+2*margin;
  const height=(bounds.yMax-bounds.yMin)*scale+2*margin;
  const fit=Math.min(1,maxWidth/width,maxHeight/height);
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const polygons=geometry.faces.map(({side,points})=>`<polygon data-face="${side}" points="${points.map(([x,y])=>`${x*scale},${y*scale}`).join(' ')}" fill="${escape(palette[side])}" fill-opacity="${alpha[side]}" stroke="${escape(stroke)}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escape(label)}" data-cube-count="${geometry.cubeCount}" viewBox="${bounds.xMin*scale-margin} ${bounds.yMin*scale-margin} ${width} ${height}" width="${width*fit}" height="${height*fit}" preserveAspectRatio="xMidYMid meet" style="display:block;max-width:100%;height:auto;margin:auto">${polygons}</svg>`;
}
