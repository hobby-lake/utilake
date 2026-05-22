import { logger } from './utils';
import { M_DCYLINDER, M_CYLINDER } from './actions/shape';

export function setupBarItems(): BarItem[] {

    let make_dot_cylinder = M_DCYLINDER;
    let make_cylinder = M_CYLINDER;

    const actions: BarItem[] = [];

    let test_action = new Action('my_test_action', {
        name: '[TEST] Say hello to blockbench',
        icon: 'help',
        click() {
            logger(`[ACT] ${this.name}`)
            Blockbench.showQuickMessage('Hello Blockbench!');
        }
    })
    
    actions.push(test_action, make_dot_cylinder, make_cylinder);
    return actions;
}