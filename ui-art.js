export const UI_ICON_NAMES=['pause','restart','sound','mute','fullscreen','back','gear','lock','confirm','cancel','shuffle','backup','trash','pencil','clock','hand','drag','music','versus','trophy','star','idea','book','rocket','info','solo','teams','ranking','flag','check','error','next','warning','home','play','search'];
const aliases={settings:'gear','sound-on':'sound','sound-off':'mute',touch:'hand',raffle:'shuffle',correct:'check',wrong:'error',lightbulb:'idea',start:'play'};
export function uiIcon(name,extra=''){
 const id=aliases[name]||name,index=UI_ICON_NAMES.indexOf(id);if(index<0)throw Error('Ícone não cadastrado: '+name);
 return `<span class="ui-image-icon ${extra}" data-ui-icon="${id}" style="--icon-x:${index%6*20}%;--icon-y:${Math.floor(index/6)*20}%" aria-hidden="true"></span>`;
}
export function appendUiIcon(el,name){const template=el.ownerDocument.createElement('template');template.innerHTML=uiIcon(name);el.prepend(template.content.firstElementChild);return el}
