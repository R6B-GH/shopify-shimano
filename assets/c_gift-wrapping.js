/**
 * c_gift-wrapping.js
 * カートのギフトラッピング選択。選んだ種類のラッピング商品を数量1でカートに入れ、他の種類は外す。
 * ラッピング以外の商品が無くなった場合・数量が1以外になった場合も自動で整える。
 */
(() => {
  if (customElements.get('c-gift-wrapping')) return;

  const root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';

  class CGiftWrapping extends HTMLElement {
    connectedCallback() {
      this.current = this.dataset.current || '';
      this.onChange = (event) => {
        if (event.target.matches('input[type="radio"]')) this.select(event.target.value);
      };
      this.addEventListener('change', this.onChange);
      this.normalize();
    }

    disconnectedCallback() {
      this.removeEventListener('change', this.onChange);
    }

    // ラッピングのみ残った／数量が2以上 → 自動補正
    normalize() {
      const otherCount = parseInt(this.dataset.otherCount, 10) || 0;
      const qty = parseInt(this.dataset.currentQty, 10) || 0;
      if (!this.current) return;
      if (otherCount === 0) this.update({ [this.current]: 0 });
      else if (qty !== 1) this.update({ [this.current]: 1 });
    }

    select(variantId) {
      if (variantId === this.current) return;
      const updates = {};
      if (this.current) updates[this.current] = 0;
      if (variantId) updates[variantId] = 1;
      this.update(updates);
    }

    async update(updates) {
      this.setAttribute('aria-busy', 'true');
      this.querySelectorAll('input').forEach((input) => { input.disabled = true; });
      try {
        const res = await fetch(`${root}cart/update.js`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ updates }),
        });
        const cart = await res.json();
        // カートページは再読み込み、ドロワーは Focal のカート再描画イベントで更新
        if (this.classList.contains('c_gift-wrapping--page')) {
          window.location.reload();
          return;
        }
        document.documentElement.dispatchEvent(new CustomEvent('cart:updated', { bubbles: true, detail: { cart } }));
        document.documentElement.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true, detail: { cart } }));
      } catch (e) {
        this.querySelectorAll('input').forEach((input) => { input.disabled = false; });
        this.removeAttribute('aria-busy');
      }
    }
  }

  customElements.define('c-gift-wrapping', CGiftWrapping);
})();
