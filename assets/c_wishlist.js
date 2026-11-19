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

window.SwymCallbacks.push((sdk) => {
  const page = document.querySelector('[data-wishlist-page]');
  if (!page || !sdk.fetchLists) return;
  const message = page.querySelector('[role="status"]');
  const grid = page.querySelector('ul');
  sdk.fetchLists({
    callbackFn(lists) {
      const items = new Map();
      for (const list of lists || []) {
        for (const item of list.listcontents || []) items.set(item.epi || item.du, item);
      }
      for (const item of items.values()) {
        if (!item.du) continue;
        const url = new URL(item.du, location.origin);
        if (!url.pathname.includes('/products/')) continue;
        const row = document.createElement('li');
        const link = document.createElement('a');
        link.href = location.origin + url.pathname;
        if (item.epi) link.search = new URLSearchParams({variant: item.epi});
        if (item.iu && /^(https:)?\/\//.test(item.iu)) {
          const image = document.createElement('img');
          image.src = item.iu;
          image.alt = '';
          image.loading = 'lazy';
          link.append(image);
        }
        link.append(document.createTextNode(item.dt || '商品を見る'));
        row.append(link);
        grid.append(row);
      }
      message.textContent = grid.children.length ? grid.children.length + '件のお気に入り' : 'お気に入りに登録した商品はありません。';
    }
  });
});
