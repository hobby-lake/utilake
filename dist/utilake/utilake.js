(() => {
  // src/utils/logger.ts
  function logger(content) {
    let out_content = `[UTILAKE] ${content}`;
    console.log(out_content);
  }

  // src/utils/coordinate.ts
  function origin_to_fromto(origin, size_x, size_y, size_z) {
    let from = [origin[0] - size_z / 2, origin[1] - size_y / 2, origin[2] - size_z / 2];
    let to = [origin[0] + size_x / 2, origin[1] + size_y / 2, origin[2] + size_z / 2];
    return [from, to];
  }

  // src/actions/shape/cylinder.ts
  var M_CYLINDER = new Action("make_cylinder_xy", {
    name: "\u5186\u72B6\u306BCube\u3092\u914D\u7F6E(XY\u5E73\u9762)",
    icon: "fa-star",
    click() {
      logger(`${this.name} was used`);
      Blockbench.textPrompt(
        "\u30D1\u30E9\u30E1\u30FC\u30BF",
        "\u30BB\u30B0\u30E1\u30F3\u30C8:16/\u30B5\u30A4\u30BA\u500D\u7387:0.01/\u5185\u5F84:0.25",
        set_cube_like_sphere
      );
    }
  });
  function set_cube_like_sphere(text) {
    const raw_parameters = text.split("/");
    let segment = 16;
    let size_infrate = 0.01;
    let inner_diameter = 0.25;
    if (text.includes("\u30BB\u30B0\u30E1\u30F3\u30C8:") == false || text.includes("\u30B5\u30A4\u30BA\u500D\u7387:") == false || text.includes("\u5185\u5F84:") == false) {
      Blockbench.showQuickMessage("\u7121\u52B9\u306A\u5165\u529B\u3067\u3059\u3002[:]\u306E\u6B21\u306F\u534A\u89D2\u6570\u5B57\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044", 5);
      logger("[ERROR] Unsupported input");
      return;
    }
    Undo.initEdit({ elements: [] });
    raw_parameters.forEach((parameter) => {
      if (parameter.includes("\u30BB\u30B0\u30E1\u30F3\u30C8:")) {
        segment = Number(parameter.replace(/[^0-9.-]/g, ""));
        logger(`${segment}`);
      } else if (parameter.includes("\u30B5\u30A4\u30BA\u500D\u7387:")) {
        size_infrate = Number(parameter.replace(/[^0-9.-]/g, ""));
        logger(`${size_infrate}`);
      } else if (parameter.includes("\u5185\u5F84:")) {
        inner_diameter = Number(parameter.replace(/[^0-9.-]/g, ""));
        logger(`${inner_diameter}`);
      }
    });
    logger(`${segment}`);
    logger(`${size_infrate}`);
    logger(`${inner_diameter}`);
    const center_point = [0, 0, 0];
    let cube_group = [];
    let cube_o_coordinates = [];
    for (let seg = 0; seg < segment; seg++) {
      try {
        let deg_theta = 360 / segment * seg;
        let rad_theta = Math.degToRad(deg_theta);
        cube_o_coordinates.push([Math.cos(rad_theta) * inner_diameter, Math.sin(rad_theta) * inner_diameter, 0]);
        logger(`[CALC] seg-${seg + 1} :${cube_o_coordinates[seg]}`);
      } catch (error) {
        logger(`[ERROR] at seg-${seg + 1}`);
      }
    }
    let cube_index = 0;
    cube_o_coordinates.forEach((coordinates) => {
      let from_to = origin_to_fromto(coordinates, 0, 0.01 * segment, 0);
      cube_group.push(
        new Cube({
          name: `seg_${cube_index + 1}`,
          from: from_to[0],
          to: from_to[1],
          rotation: [0, 0, 360 / segment * cube_index],
          inflate: size_infrate,
          color: 0,
          origin: coordinates,
          box_uv: false,
          visibility: true
        }).init()
      );
      logger(`[GEN] c_seg_${cube_index + 1} -> ${coordinates}`);
      cube_index++;
    });
    Undo.finishEdit("make_cylinder_xy", { elements: cube_group });
  }

  // src/setup_actions.ts
  function setupBarItems() {
    let make_cylinder = M_CYLINDER;
    const actions = [];
    let test_action = new Action("my_test_action", {
      name: "[TEST] Say hello to blockbench",
      icon: "help",
      click() {
        logger(`[ACT] ${this.name}`);
        Blockbench.showQuickMessage("Hello Blockbench!");
      }
    });
    actions.push(test_action, make_cylinder);
    return actions;
  }

  // src/plugin.ts
  var deletables = [];
  BBPlugin.register("utilake", {
    title: "Utilake",
    author: "Lake_A",
    icon: "icon.png",
    version: "0.0.1",
    description: "Tool for JP User",
    variant: "both",
    min_version: "4.10.0",
    has_changelog: false,
    onload() {
      let bar_items = setupBarItems();
      for (let action of bar_items) {
        try {
          deletables.push(action);
          logger(`loading: ${action.name}`);
        } catch (error) {
          logger(`[ERROR] ${error}`);
        }
      }
      logger("Loaded");
    },
    onunload() {
      for (let deletable of deletables) {
        try {
          deletable.delete();
          logger(`unloading: ${deletable.name}`);
        } catch (error) {
          logger(`[ERROR] ${error}`);
        }
      }
      deletables.empty();
      logger("Unloaded");
    }
  });
})();
