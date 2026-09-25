// Resolve o ícone de uma era/gerador: usa imagem se ela existir e carregar
// com sucesso, senão cai pro emoji. Isso é o único lugar que precisa mudar
// quando o jogo evoluir de emoji pra arte de verdade.

const IMAGE_BASE = "assets/images/";
const failedImages = new Set();

/**
 * @param {{emoji: string, image?: string}} entity - era ou gerador do src/data.js
 * @returns {string} HTML pronto pra inserir (uma tag <img> ou o emoji puro)
 */
export function resolveIconHTML(entity, opts) {
  var size = (opts && opts.size) || 24;
  if (entity.image && !failedImages.has(entity.image)) {
    var src = IMAGE_BASE + entity.image;
    return '<img src="' + src + '" alt="" width="' + size + '" height="' + size +
      '" style="object-fit:contain;display:block" ' +
      'onerror="this.parentElement && this.parentElement.dispatchEvent(new CustomEvent(\'icon-fallback\',{bubbles:true,detail:\'' + entity.image + '\'}))">';
  }
  return '<span class="emoji-icon" style="font-size:' + Math.round(size * 0.8) + 'px;line-height:1">' + entity.emoji + '</span>';
}

// Marca uma imagem como quebrada pra sempre cair no emoji dali pra frente
// nesta sessão (evita re-tentar a mesma imagem inexistente em todo render).
export function markImageFailed(path) {
  failedImages.add(path);
}

// Escuta falhas de <img> delegadas via evento customizado e re-renderiza
// (o chamador passa a função de render a rodar depois de marcar a falha).
export function installIconFallback(rootEl, onFallback) {
  rootEl.addEventListener("icon-fallback", function (e) {
    markImageFailed(e.detail);
    if (onFallback) onFallback();
  });
}
