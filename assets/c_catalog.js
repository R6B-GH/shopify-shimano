class CatalogGridSwitch extends HTMLElement {
  connectedCallback() {
    const mode = document.documentElement.dataset.catalogGrid || 'standard';
    this.select(mode);
    this.onclick = (event) => {
      const button = event.target.closest('[data-grid-mode]');
      if (button) this.select(button.dataset.gridMode);
    };
  }

  select(mode) {
    document.documentElement.dataset.catalogGrid = mode;
    for (const button of this.querySelectorAll('[data-grid-mode]')) {
      button.setAttribute('aria-pressed', String(button.dataset.gridMode === mode));
    }
  }
}

if (!customElements.get('catalog-grid-switch')) {
  customElements.define('catalog-grid-switch', CatalogGridSwitch);
}

if (document.body.dataset.pageType === 'product' && document.documentElement.lang.startsWith('ja')) {
  const modal = '.jdgm-write-review-modal';
  const japaneseLabels = {
    'Close review form': 'レビュー投稿を閉じる',
    'Review form pages': 'レビュー投稿フォーム',
    'Rating': '評価',
    'Privacy and Terms': 'プライバシーと利用規約',
    'Review form navigation': 'レビュー投稿の操作',
    'Previous step': '戻る',
    'Next step': '次へ',
    'Submit review': 'レビューを送信'
  };

  function translateReviewLabels(root) {
    const elements = [...root.querySelectorAll('[aria-label]')];
    if (root.hasAttribute('aria-label')) elements.push(root);
    for (const element of elements) {
      const label = element.getAttribute('aria-label');
      const stars = /^([1-5]) stars?$/.exec(label);
      const translation = stars ? '星' + stars[1] + 'つ' : japaneseLabels[label];
      if (translation) element.setAttribute('aria-label', translation);
    }
  }

  document.querySelectorAll(modal).forEach(translateReviewLabels);
  new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.closest(modal)) translateReviewLabels(node);
        else node.querySelectorAll(modal).forEach(translateReviewLabels);
      }
    }
  }).observe(document.body, {childList: true, subtree: true});
}
