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
