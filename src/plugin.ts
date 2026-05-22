import { setupBarItems } from "./setup_actions";
import { logger } from './utils'

const deletables: Deletable[] = [];

BBPlugin.register('utilake', {
    title: 'Utilake',
    author: 'Lake_A',
    icon: 'icon.png',
    version: '0.0.1',
    description: 'Tool for JP User',
    variant: 'both',
    min_version: '4.10.0',
    has_changelog: false,
    onload() {
        let bar_items = setupBarItems();
        for (let action of bar_items) {
            try {
                deletables.push(action);
                logger(`loading: ${action.name}`);
            } catch (error) {
                logger(`[ERROR] ${error}`)
            }
        }
        logger('Loaded');
    },
    onunload() {
        for (let deletable of deletables) {
            try {
                deletable.delete();
                logger(`unloading: ${(deletable as Action).name}`);
            } catch (error) {
                logger(`[ERROR] ${error}`)
            }
        }
        deletables.empty();
        logger('Unloaded');
    }
})
