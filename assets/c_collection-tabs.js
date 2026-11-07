/**
 * c_collection-tabs.js
 * カスタム:商品一覧タブ のタブ切り替え。
 * - タブクリックで対応パネルを表示
 * - VIEW MORE（PCヘッダー/SPフッター）のリンク先を表示中のコレクションに更新
 * - 左右キーでのタブ移動（WAI-ARIA Tabs パターン）
 */
(() => {
  if (customElements.get('c-collection-tabs')) return;

  class CCollectionTabs extends HTMLElement {
    connectedCallback() {
      this.tabs = Array.from(this.querySelectorAll('[role="tab"][data-tab-target]'));
      this.panels = Array.from(this.querySelectorAll('[data-panel-id]'));
      this.links = Array.from(this.querySelectorAll('[data-section-link]'));
      if (this.tabs.length === 0) return;

      this.onClick = (event) => {
        const tab = event.target.closest('[data-tab-target]');
        if (tab) this.select(tab.dataset.tabTarget, false);
      };

      this.onKeydown = (event) => {
        const index = this.tabs.indexOf(document.activeElement);
        if (index === -1) return;
        let next = null;
        if (event.key === 'ArrowRight') next = (index + 1) % this.tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + this.tabs.length) % this.tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = this.tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        this.select(this.tabs[next].dataset.tabTarget, true);
      };

      this.addEventListener('click', this.onClick);
      this.addEventListener('keydown', this.onKeydown);

      // テーマエディタでブロックを選択したときに該当タブを表示
      this.onBlockSelect = (event) => {
        const panel = this.panels.find((p) => p.dataset.panelId === event.detail.blockId);
        if (panel) this.select(panel.dataset.panelId, false);
      };
      document.addEventListener('shopify:block:select', this.onBlockSelect);

      this.tabs.forEach((tab) => {
        tab.setAttribute('tabindex', tab.classList.contains('is-active') ? '0' : '-1');
      });
    }

    disconnectedCallback() {
      this.removeEventListener('click', this.onClick);
      this.removeEventListener('keydown', this.onKeydown);
      document.removeEventListener('shopify:block:select', this.onBlockSelect);
    }

    select(blockId, focus) {
      this.tabs.forEach((tab) => {
        const active = tab.dataset.tabTarget === blockId;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.setAttribute('tabindex', active ? '0' : '-1');
        if (active && focus) tab.focus();
      });

      let link = '';
      this.panels.forEach((panel) => {
        const active = panel.dataset.panelId === blockId;
        panel.hidden = !active;
        if (active) {
          link = panel.dataset.panelLink || '';
          panel.querySelectorAll('.c_collection-tabs__list, .product-list__inner').forEach((list) => {
            list.scrollLeft = 0;
          });
          panel.querySelector('.prev-next-button--prev')?.setAttribute('disabled', '');
          panel.querySelector('.prev-next-button--next')?.removeAttribute('disabled');
        }
      });

      if (link) {
        this.links.forEach((anchor) => anchor.setAttribute('href', link));
      }
    }
  }

  customElements.define('c-collection-tabs', CCollectionTabs);
})();
