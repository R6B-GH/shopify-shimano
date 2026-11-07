/**
 * c_splide.js
 * Splide を使うカスタムセクション共通のマウント処理。
 *
 * 使い方:
 *   <c-splide class="splide" data-options='{"perPage":4}'>
 *     <div class="splide__track"><ul class="splide__list">...</ul></div>
 *   </c-splide>
 *
 * - data-options : Splide オプション(JSON)
 * - data-min-slides : この枚数未満ならマウントしない（任意）
 * テーマエディタでの再描画にも対応（disconnect 時に destroy）。
 */
(() => {
  if (customElements.get('c-splide')) return;

  class CSplide extends HTMLElement {
    connectedCallback() {
      if (this.splide || typeof window.Splide === 'undefined') return;

      let options = {};
      try {
        options = JSON.parse(this.dataset.options || '{}');
      } catch (error) {
        console.warn('[c-splide] options の JSON が不正です', error);
      }

      const slides = this.querySelectorAll('.splide__slide');
      const minSlides = Number(this.dataset.minSlides || 0);
      if (slides.length === 0 || slides.length < minSlides) {
        this.classList.add('is-static');
        return;
      }

      this.splide = new window.Splide(this, options);
      this.dispatchEvent(new CustomEvent('c-splide:init', { detail: { splide: this.splide } }));
      this.splide.mount();
    }

    disconnectedCallback() {
      if (this.splide) {
        this.splide.destroy(true);
        this.splide = null;
      }
    }
  }

  customElements.define('c-splide', CSplide);
})();
