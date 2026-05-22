import {logger, origin_to_fromto} from '../../utils'

/// 固定内径の円上にCubeを配置する機能を実装
/// 各Cubeのサイズは固定する
export const M_CYLINDER = new Action('make_cylinder_xy', {
    name: '円状にCubeを配置(XY平面)',
    icon: 'fa-star',
    click() {
        // ---- 目に見えない動作 ----
        logger(`${this.name} was used`)
        

        // ---- 目に見える動作 ----
        Blockbench.textPrompt(
            'パラメータ', 
            'セグメント:16/サイズ倍率:0.01/内径:0.25', 
            set_cube_like_sphere
        )
    }
})

// 入力が不適でも初期値を入れる。→ 例外処理面倒くさい
function set_cube_like_sphere(text:string) {
    const raw_parameters = text.split('/');
    let segment:number = 16;
    let size_infrate:number = 0.01
    let inner_diameter:number = 0.25;

    if (
        text.includes('セグメント:') == false ||
        text.includes('サイズ倍率:') == false ||
        text.includes('内径:') == false
    ) {
        Blockbench.showQuickMessage('無効な入力です。[:]の次は半角数字を入力してください', 5);
        logger('[ERROR] Unsupported input')
        return
    }
    Undo.initEdit({elements: []});

    raw_parameters.forEach(parameter => {
        if (parameter.includes('セグメント:')) {
            segment = Number(parameter.replace(/[^0-9.-]/g, ""));
            logger(`${segment}`);
        } else if (parameter.includes('サイズ倍率:')) {
            size_infrate = Number(parameter.replace(/[^0-9.-]/g, ""));
            logger(`${size_infrate}`);
        } else if (parameter.includes('内径:')) {
            inner_diameter = Number(parameter.replace(/[^0-9.-]/g, ""));
            logger(`${inner_diameter}`);
        }
    });
    
    logger(`${segment}`);
    logger(`${size_infrate}`);
    logger(`${inner_diameter}`);
    
    const center_point = [ 0, 0, 0 ];
    let cube_group:Cube[] = [];

    // Cube位置の導出と格納
    let cube_o_coordinates:[number, number, number][] = [];
    for (let seg = 0; seg < segment; seg++) {
        try {
            let deg_theta = (360 / segment) * seg;
            let rad_theta = Math.degToRad(deg_theta);
            cube_o_coordinates.push([Math.cos(rad_theta)*inner_diameter, Math.sin(rad_theta)*inner_diameter, 0])
            logger(`[CALC] seg-${seg + 1} :${cube_o_coordinates[seg]}`)
        } catch (error) {
            logger(`[ERROR] at seg-${seg + 1}`)
        }
        
    }

    // Cube構造体の作成と初期化
    let cube_index = 0; // = segment index
    cube_o_coordinates.forEach(coordinates => {
        let from_to = origin_to_fromto(coordinates, 0, 0.01 * segment, 0);
        cube_group.push(
            new Cube({
                name: `seg_${cube_index + 1}`,
                from: from_to[0],
                to: from_to[1],
                rotation: [ 0, 0, (360 / segment) * cube_index ],
                inflate: size_infrate,
                color: 0,
                origin: coordinates,
                box_uv: false,
                visibility: true,
            }).init()
        )
        logger(`[GEN] c_seg_${cube_index + 1} -> ${coordinates}`)
        cube_index++;
    });

    Undo.finishEdit('make_cylinder_xy', {elements: cube_group})
}