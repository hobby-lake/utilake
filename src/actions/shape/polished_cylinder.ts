import {logger, Plane} from '../../utils'

export const M_CYLINDER = new Action('make_cylinder', {
    name: '円を配置',
    icon: 'fa-star',
    click() {
        // ---- 目に見えない動作 ----
        logger(`${this.name} was used`)
        

        // ---- 目に見える動作 ----
        Blockbench.textPrompt(
            'パラメータ', 
            '設置平面:XY/セグメント:16/内径:1/外径:2', 
            set_cube_like_sphere
        )
    }
})

// 入力が不適でも初期値を入れる。→ 例外処理面倒くさい
function set_cube_like_sphere(text:string) {
    const raw_parameters = text.split('/');
    let axis_plane:Plane;
    let segment:number = 16;
    let size_infrate:number = 1;
    let inner_diameter:number = 1;
    let outer_diameter:number = 2;

    if (
        text.includes('設置平面:') == false ||
        text.includes('セグメント:') == false ||
        text.includes('内径:') == false ||
        text.includes('外径:') == false
    ) {
        Blockbench.showQuickMessage('無効な入力です。[:]の次は半角数字を入力してください', 5);
        logger('[ERROR] Unsupported input')
        return
    }

    raw_parameters.forEach(parameter => {
        if (parameter.includes('設置平面:')) {
            switch (parameter.replace('設置平面:', '')) {
                case 'XZ':
                case 'ZX':
                    axis_plane = Plane.XZ;
                    break;
                case 'YZ':
                case 'ZY':
                    axis_plane = Plane.YZ;
                    break;
                default:
                    axis_plane = Plane.XY;
                    break;
            }
            logger(`${axis_plane}`);
        } else if (parameter.includes('セグメント:')) {
            segment = Number(parameter.replace(/[^0-9.-]/g, ""));
            logger(`${segment}`);
        } else if (parameter.includes('内径:')) {
            inner_diameter = Number(parameter.replace(/[^0-9.-]/g, ""));
            logger(`${inner_diameter}`);
        } else if (parameter.includes('外径:')) {
            outer_diameter = Number(parameter.replace(/[^0-9.-]/g, ""));
            logger(`${outer_diameter}`);
        }
    });

    if (outer_diameter < inner_diameter) {
        Blockbench.showQuickMessage('外径は内径よりも大きくしてください', 5);
        logger('[ERROR] Outer diameter must bigger than Inner one')
        return
    }
    
    logger(`Segment: ${segment}`);
    logger(`Inner diameter: ${inner_diameter}`);
    logger(`Outer diameter: ${outer_diameter}`);

    let cube_group:Cube[] = [];

    // Cubeの幅・高さ
    let cube_width: number = 2 * outer_diameter * Math.sin(Math.degToRad(180 / segment));
    let cube_height: number = (outer_diameter - inner_diameter) * Math.cos(Math.degToRad(180 / segment));

    let master_vertice: [number, number, number] = [ 0, inner_diameter + ((outer_diameter - inner_diameter) / 2), 0 ];
    let master_from: [number, number, number] = [ master_vertice[0] - (cube_width / 2), master_vertice[1] + (cube_height / 2), 0 ];
    let master_to: [number, number, number] = [ master_vertice[0] + (cube_width / 2), master_vertice[1] - (cube_height / 2), 0 ];

    // 接点中心のCubeの作成と初期化
    Undo.initEdit({elements: []});
    for (let cube_index = 0; cube_index < segment; cube_index++){
        // XY平面基準の頂点を導出
        let from: [number, number, number];
        let to: [number, number, number];

        let angle: [number, number, number] = [ 0, 0, 0 ];

        //以下のts-ignoreはロジックとして例外があり得ないので使用
        //@ts-ignore
        switch (axis_plane) {
            case Plane.XY:
                from = master_from;
                to = master_from;
                angle = [360/segment*cube_index, 0, 0]
                break;
            case Plane.XZ:
                from = [master_from[0], master_from[2], master_from[1]];
                to = [master_to[0], master_to[2], master_to[1]];
                angle = [0, 0, 360/segment*cube_index]
                break;
            case Plane.YZ:
                from = [master_from[2], master_from[0], master_from[1]];
                to = [master_to[2], master_to[0], master_to[1]];
                angle = [0, 360/segment*cube_index, 0]
                break;
        }

        cube_group.push(
            new Cube({
                name: `seg_${cube_index + 1}`,
                //@ts-ignore
                from: from,
                //@ts-ignore
                to: to,
                rotation: angle,
                inflate: size_infrate,
                color: 0,
                origin: [ 0, 0, 0 ],
                box_uv: false,
                visibility: true,
                
            }).init()
        )
        logger(`[GEN] c_seg_${cube_index + 1}`)
    };

    Undo.finishEdit('make_cylinder', {elements: cube_group})
}