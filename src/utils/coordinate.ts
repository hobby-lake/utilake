export function origin_to_fromto(
    origin:[number, number, number],
    size_x:number, 
    size_y:number, 
    size_z:number
): [[ number, number, number ],[ number, number, number ]] {
    let from:[ number, number, number ] = [ origin[0] - (size_z/2), origin[1] - (size_y/2), origin[2] - (size_z/2) ];
    let to:[ number, number, number ] = [ origin[0] + (size_x/2), origin[1] + (size_y/2), origin[2] + (size_z/2) ];

    return [from, to];
}