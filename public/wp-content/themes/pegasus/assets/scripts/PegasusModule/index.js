import { loadCheck, visibleCheck, mediaCheck, idleCheck, eventCheck } from './strategies';
import blocks from '../block-imports/modules';

export const FrameworkAdaptor = {
    Adaptors: {},
    use(name, adaptor) {
        switch(name?.toLowerCase()) {
            case 'alpine':
                this.Adaptors['alpine'] = adaptor;
                break;
            default:
                break;
        }
    },
    getAdaptor(adaptor) {
        return this.Adaptors[adaptor?.toLowerCase()];
    }
}

export class PegasusModule extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const framework = this.hasAttribute('x-data') ? 'alpine' : this.getAttribute('framework') ?? null;
        const module = this.getAttribute('module') ?? '';
        const moduleLoader = typeof blocks === 'object' ? blocks[module] : null;
        
        if (!moduleLoader) {
            throw new Error(`${module} is not a component!`)
        }

        //loading strategies
        if (this.getAttribute('client:load')) {
            loadCheck();
        }
        if (this.hasAttribute('client:idle')) {
            await idleCheck();
        }
        if (this.hasAttribute('client:visible')) {
            await visibleCheck({ element: this });
        }
        if (this.getAttribute('client:media')) {
            await mediaCheck({ query: this.getAttribute('client:media') });
        }
        if (this.getAttribute('client:event')) {
            await eventCheck({ event: this.getAttribute('client:event') });
        }

        if (framework) {
            FrameworkAdaptor.getAdaptor(framework).loadModule(this, moduleLoader);
        } else {
            (await moduleLoader()).default();
        }
    }
}
