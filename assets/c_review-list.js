/**
 * c_review-list.js
 * カスタム:お客様のレビュー
 * Judge.me がショップメタフィールド（judgeme.featured_carousel）に書き出したレビューHTMLを読み取り、
 * デザインのカード（星・タイトル・本文・投稿者/日付・商品画像）に組み直して表示する。
 */
(() => {
  if (customElements.get('c-review-list')) return;

  const text = (root, selector) => {
    const el = root.querySelector(selector);
    return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
  };

  // Judge.me の日付（MM/DD/YYYY）→ YYYY.MM.DD
  const formatDate = (value) => {
    const m = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!m) return value;
    return `${m[3]}.${m[1].padStart(2, '0')}.${m[2].padStart(2, '0')}`;
  };

  class CReviewList extends HTMLElement {
    connectedCallback() {
      const source = this.querySelector('template[data-review-source]');
      const cardTemplate = this.querySelector('template[data-review-card]');
      const list = this.querySelector('[data-review-list]');
      if (!source || !cardTemplate || !list) return;

      const limit = parseInt(this.dataset.limit, 10) || 3;
      const showProduct = this.dataset.showProduct === 'true';
      const items = Array.from(source.content.querySelectorAll('.jdgm-carousel-item')).slice(0, limit);

      items.forEach((item) => {
        const card = cardTemplate.content.cloneNode(true);
        const rating = item.querySelectorAll('.jdgm-carousel-item__review-rating .jdgm--on').length;

        const stars = card.querySelector('[data-review-stars]');
        stars.setAttribute('aria-label', `5段階中${rating}`);
        for (let i = 1; i <= 5; i += 1) {
          const star = document.createElement('span');
          star.className = `c_review-list__star${i <= rating ? ' is-filled' : ''}`;
          star.setAttribute('aria-hidden', 'true');
          star.textContent = '★';
          stars.appendChild(star);
        }

        const title = text(item, '.jdgm-carousel-item__review-title');
        const titleEl = card.querySelector('[data-review-title]');
        if (title) titleEl.textContent = title;
        else titleEl.remove();

        card.querySelector('[data-review-body]').textContent = text(item, '.jdgm-carousel-item__review-body');

        const name = text(item, '.jdgm-carousel-item__reviewer-name');
        const date = formatDate(text(item, '.jdgm-carousel-item__timestamp'));
        card.querySelector('[data-review-meta]').textContent = [name, date].filter(Boolean).join(' / ');

        const productLink = item.querySelector('.jdgm-carousel-item__product a[href], a.jdgm-carousel-item__product');
        const productImage = item.querySelector('.jdgm-carousel-item__product-image');
        const productTitle = text(item, '.jdgm-carousel-item__product-title') || (productImage ? productImage.getAttribute('alt') || '' : '');
        const productEl = card.querySelector('[data-review-product]');
        if (showProduct && (productLink || productImage)) {
          if (productLink) productEl.setAttribute('href', productLink.getAttribute('href').split('?')[0]);
          const img = card.querySelector('[data-review-product-image]');
          const src = productImage ? productImage.getAttribute('data-src') || productImage.getAttribute('src') : '';
          // Judge.me のサムネイル（ファイル名に _70x70 が付いた縮小版）を元画像の幅240pxで読み込み直す
          if (src) {
            const url = new URL(src, window.location.origin);
            url.pathname = url.pathname.replace(/_\d+x\d*(?=\.[a-z]+$)/i, '');
            url.searchParams.set('width', '240');
            img.setAttribute('src', url.toString());
          }
          else img.parentElement.remove();
          card.querySelector('[data-review-product-title]').textContent = productTitle;
          // Judge.me のデータには商品URLが無いため、商品名からストアの商品ページを検索してリンクする
          if (!productLink && productTitle) this.linkProduct(productEl, productTitle);
          productEl.hidden = false;
        } else {
          productEl.remove();
        }

        list.appendChild(card);
      });
    }
  }

  CReviewList.prototype.linkProduct = async function linkProduct(anchor, title) {
    try {
      const root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
      const params = new URLSearchParams({ q: title, 'resources[type]': 'product', 'resources[limit]': '1' });
      const res = await fetch(`${root}search/suggest.json?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      const product = data.resources && data.resources.results && data.resources.results.products && data.resources.results.products[0];
      if (product && product.url) anchor.setAttribute('href', product.url.split('?')[0]);
    } catch (e) {
      // リンクが取れなくても表示はそのまま
    }
  };

  customElements.define('c-review-list', CReviewList);
})();
