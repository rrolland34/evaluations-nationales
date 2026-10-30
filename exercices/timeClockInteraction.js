export function validateClockTime(value, hours, minutes, afternoon) {
  const match = String(value).trim().match(/^(\d{1,2})\s*h\s*(\d{1,2})\s*(?:min|mn)?$/i);
  if (!match) return { valid: false };
  const h = Number(match[1]), m = Number(match[2]);
  return { valid: h >= (afternoon ? 12 : 0) && h <= (afternoon ? 23 : 11) && m <= 59 && h === hours && m === minutes };
}

export const circularDistance = (a,b) => Math.abs(((a-b)%360+540)%360-180);
export function validateClockHands(state, hours, minutes) {
  const relative = ((state.hours - (hours % 12)*30) % 360 + 360) % 360;
  const hourValid = minutes === 0 ? circularDistance(relative,0)<=5
    : minutes === 30 ? circularDistance(relative,15)<=5
    : minutes < 30 ? relative <= 15 : relative >= 15 && relative <= 30;
  return {valid: state.hoursMoved === true && state.minutesMoved === true && hourValid && circularDistance(state.minutes,minutes*6)<=3};
}

export function initializeClockHands(svg, state, onChange = () => {}) {
  let dragging = null;
  state.hours = 0; state.minutes = 0; state.hoursMoved = false; state.minutesMoved = false;
  onChange(state);
  const doc = svg.ownerDocument;
  const update = kind => {
    const angle=state[kind]*Math.PI/180, length=kind==='hours'?65:90;
    for(const line of svg.querySelectorAll(`[data-control="${kind}"]`)) {
      line.setAttribute('x2',110+length*Math.sin(angle)); line.setAttribute('y2',110-length*Math.cos(angle));
    }
  };
  for(const kind of ['hours','minutes']) {
    for(const hit of [true,false]) {
      const line=doc.createElementNS('http://www.w3.org/2000/svg','line');
      for(const [key,value] of Object.entries({'data-control':kind,x1:110,y1:110,stroke:hit?'transparent':'black','stroke-width':hit?18:kind==='hours'?4:2.5}))line.setAttribute(key,value);
      line.style.cursor='grab';
      line.addEventListener('mousedown',event=>{if(event.button!==0)return;event.preventDefault();dragging=kind;});
      svg.appendChild(line);
    }
    update(kind);
  }
  const move = event => {
    if(!dragging)return;
    const point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;
    const local=point.matrixTransform(svg.getScreenCTM().inverse());
    state[dragging]=(Math.atan2(local.x-110,110-local.y)*180/Math.PI+360)%360;
    state[`${dragging}Moved`]=true; update(dragging); onChange(state);
  };
  const release=()=>{dragging=null;};
  doc.addEventListener('mousemove',move);doc.addEventListener('mouseup',release);
  return ()=>{doc.removeEventListener('mousemove',move);doc.removeEventListener('mouseup',release);};
}
