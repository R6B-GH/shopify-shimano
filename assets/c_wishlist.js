let wishlistSdk;
let refreshFrame;
const wishlistSelector = 'wishlist-action [data-swaction]';

function refreshWishlistButtons() {
  if (!wishlistSdk?.initializeActionButtons || refreshFrame) return;
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = null;
    const pending = document.querySelectorAll(wishlistSelector + '[hidden]');
    if (!pending.length) return;
    wishlistSdk.initializeActionButtons('body', wishlistSelector + '[hidden]');
    for (const button of pending) {
      button.previousElementSibling.hidden = true;
      button.hidden = false;
    }
  });
}

window.SwymCallbacks = window.SwymCallbacks || [];
window.SwymCallbacks.push((sdk) => {
  wishlistSdk = sdk;
  refreshWishlistButtons();
});

if (!customElements.get('wishlist-action')) {
  customElements.define('wishlist-action', class extends HTMLElement {
    connectedCallback() {
      refreshWishlistButtons();
    }
  });
}
