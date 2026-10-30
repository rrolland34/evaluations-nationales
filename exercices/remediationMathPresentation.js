// Présentation uniquement : ne jamais appliquer cette fonction aux réponses attendues.
const math = expression => `\\(${expression}\\)`;
const text = value => value.replace(/[{}%&#_$]/g, character=>'\\'+character);
export function remediationMathPresentation(html) {
  return String(html).split(/(\\\([\s\S]*?\\\)|<strong>[\s\S]*?<\/strong>|<[^>]+>)/g).filter(Boolean).map(part=>{
    if(part.startsWith('\\('))return part;
    if(part.startsWith('<strong>'))return math(`\\mathbf{\\text{${text(part.slice(8,-9))}}}`);
    if(/^<p>$/i.test(part))return '<br>';
    if(/^<\/p>$/i.test(part))return '';
    if(part.startsWith('<'))return part;
    // Les mots restent sur une même ligne de base MathJax ; le navigateur peut
    // couper entre eux, et après un trait d’union sans ajouter d’espace.
    return part.split(/(\s+|(?<=-))/u).filter(Boolean).map(word=>/^\s+$/.test(word)?word:math(`\\text{${text(word)}}`)+(word.endsWith('-')?'<wbr>':'')).join('');
  }).join('');
}
