export class AlpineAdaptor {
  Alpine = null;
  constructor(Alpine) {
    this.Alpine = Alpine;
    
    const modules = document.querySelectorAll('pegasus-module[x-data]');
    
    for (let module of modules) {
      this.setupModule(module);
    }
  }
  setupModule(module) {
    module.setAttribute('x-ignore', '');
  }
  activate(element) {
    this.Alpine.destroyTree(element);

    element.removeAttribute('x-ignore');
    element._x_ignore = false;

    if (this.parentCheck(element, el => el.hasAttribute('x-ignore'))) return;

    this.Alpine.initTree(element);
  }
  parentCheck(element, callback) {
    if (!element || element.nodeName === 'HTML') return false;

    if (callback(element)) return element;

    return this.parentCheck(element.parentElement, callback);
  }
  async loadModule(element, moduleLoader) {
    const dataName = element.getAttribute('x-data').split('(')[0];
    const module = (await moduleLoader()).default;

    this.Alpine.data(dataName, module);

    this.activate(element);
  }
  observerMutations() {
    const observer = new MutationObserver(entries => {
      for (const entry of entries) {
        if (!entry.addedNodes) continue;
        for (const node of entry.addedNodes) {
          // only process element nodes
          if (node.nodeType !== 1) continue;

          if (node.hasAttribute('pegasus-module[x-data]')) {
            this.setupModule(node);
          }

          // check all descendants
          const childModules = node.querySelectorAll('pegasus-module[x-data]');
          childModules.forEach(el => this.setupModule(el));
        }
      }
    });
    observer.observe(document, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }
}
