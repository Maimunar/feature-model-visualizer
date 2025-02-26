// eslint-disable-next-line
export default function () {
  const id = document.getElementById.bind(document);
  const floor = Math.floor.bind(Math);

  const svgatt = function (element, attributes) {
    for (let prop in attributes) element.setAttribute(prop, attributes[prop]);
  };
  const svgel = function (name, attributes) {
    let el = document.createElementNS("http://www.w3.org/2000/svg", name);
    if (attributes != undefined) svgatt(el, attributes);
    return el;
  };

  /* SVG image containing one group with all lines and zero or more groups representing boxes */
  const svg = id("model");
  svg.innerHTML = "";
  const lines = svgel("g");
  svg.appendChild(lines);

  /* Input elements for box editing */
  const CHILD_NORMAL = "C",
    CHILD_MANDATORY = "M";
  const PARENT_NORMAL = "A",
    PARENT_OR = "O";

  const create_box = function (
    description,
    x,
    y,
    childstyle,
    parentstyle,
    callbackOnMove, // (name, parentRelation, childrenRelation, x, y) => void
  ) {
    let box = create_box_element(description, x, y, childstyle, parentstyle);
    box.g.onmousedown = function (ev) {
      box_start_move(box, ev, callbackOnMove);
    };
    box_update_complete(box);
    return box;
  };
  const create_box_element = function (
    description,
    x,
    y,
    childstyle,
    parentstyle,
  ) {
    let g = svgel("g"); /* Logical box group */
    let t = svgel("text"); /* Text field (determines box size) */
    let r = svgel("rect"); /* Bordered box */
    let c = svgel("circle", { r: 7 }); /* Child type indicator (dot) */
    let p = svgel("path"); /* Parent type indicator (arc) */
    t.appendChild(document.createTextNode(description));
    g.appendChild(p);
    g.appendChild(r);
    g.appendChild(t);
    g.appendChild(c);
    svg.appendChild(g);
    return {
      x: x,
      y: y,
      g: g,
      t: t,
      r: r,
      c: c,
      p: p,
      conns: [],
      childstyle: childstyle,
      parentstyle: parentstyle,
    };
  };
  let pad = { x: 8, y: 6 };

  let box_moving = null;
  let box_clickoff = null;
  const box_start_move = (box, ev, callbackOnMove) => {
    if (box_moving != null) return;
    box_moving = box;
    window.addEventListener("mousemove", box_move_step);
    window.addEventListener("mouseup", box_move_stop(callbackOnMove));
    /* Offset in the box to avoid jumping of the box */
    box_clickoff = {
      x: ev.clientX - svg_left - box.x,
      y: ev.clientY - svg_top - box.y,
    };
  };
  const box_move_step = (ev) => {
    if (box_moving == null) return;
    var x = ev.clientX - svg_left,
      y = ev.clientY - svg_top;
    box_moving.x = x - box_clickoff.x;
    box_moving.y = y - box_clickoff.y;
    box_update_complete(box_moving);
  };

  const childStyles = { M: "mandatory", O: "optional", C: "none" };
  const parentStyles = { A: "and", O: "or", X: "xor" };

  const box_move_stop = (callbackOnMove) => () => {
    window.removeEventListener("mousemove", box_move_step);
    window.removeEventListener("mouseup", box_move_stop);
    if (box_moving) {
      const { x, y, childstyle, parentstyle } = box_moving;
      const name = box_moving.t.firstChild.data;
      const childrenRelation = parentStyles[parentstyle];
      const parentRelation = childStyles[childstyle];
      callbackOnMove(name, parentRelation, childrenRelation, x, y);
    }
    box_moving = null;
  };
  const box_update_complete = function (box) {
    /* The bounding box does not work for empty
     * text elements... ugly workaround */
    let empty_text = false;
    if (box.t.firstChild.textContent == "") {
      box.t.firstChild.textContent = ".";
      empty_text = true;
    }
    /* Update text first, it determines the box position */
    let tbb = box.t.getBBox();
    svgatt(box.t, {
      x: box.x - floor(tbb.width / 2),
      y: box.y - floor(tbb.height / 4),
    });
    /* Update the surrounding box/border. */
    tbb = box.t.getBBox();
    svgatt(box.r, {
      x: tbb.x - pad.x,
      y: tbb.y - pad.y,
      width: tbb.width + pad.x * 2,
      height: tbb.height + pad.y * 2,
    });
    /* Restore empty text box */
    if (empty_text) {
      box.t.firstChild.textContent = "";
    }
    /* Update connected lines */
    box_update_visual(box);
    for (let i in box.conns) {
      let conn = box.conns[i];
      box_update_visual(box == conn.box1 ? conn.box2 : conn.box1);
    }
  };
  let parent_arc_r = 30;
  const box_update_visual = function (box) {
    let bb = box.r.getBBox();
    let has_parents = false,
      num_children = 0;
    let min_angle = Math.PI,
      max_angle = -Math.PI;
    for (let i in box.conns) {
      let conn = box.conns[i];
      let parent_box, child_box, pbb, cbb;
      if (conn.box1.y < conn.box2.y) {
        parent_box = conn.box1;
        child_box = conn.box2;
      } else {
        parent_box = conn.box2;
        child_box = conn.box1;
      }
      pbb = parent_box.r.getBBox();
      cbb = child_box.r.getBBox();
      let px = floor(pbb.x + pbb.width / 2),
        py = pbb.y + pbb.height + 0.5;
      let cx = floor(cbb.x + cbb.width / 2),
        cy = cbb.y - 0.5;
      svgatt(conn.ln, { x1: px, y1: py, x2: cx, y2: cy });
      if (box == parent_box) {
        let angle = Math.atan2(cx - px, cy - py);
        if (angle < min_angle) min_angle = angle;
        if (angle > max_angle) max_angle = angle;
        ++num_children;
      } else {
        has_parents = true;
      }
    }
    if (box.childstyle != CHILD_NORMAL && has_parents) {
      box.c.style.fill = box.childstyle == CHILD_MANDATORY ? "#888" : "#fff";
      svgatt(box.c, {
        visibility: "visible",
        cx: floor(bb.x + bb.width / 2),
        cy: bb.y - 0.5,
      });
    } else {
      svgatt(box.c, { visibility: "hidden" });
    }
    if (box.parentstyle != PARENT_NORMAL && num_children >= 2) {
      box.p.style.fill = box.parentstyle == PARENT_OR ? null : "none";
      let sx = floor(bb.x + bb.width / 2),
        sy = bb.y + bb.height + 0.5; /* Center bottom */
      let lx = sx + parent_arc_r * Math.sin(max_angle),
        ly = sy + parent_arc_r * Math.cos(max_angle); /* Left starting point */
      let rx = sx + parent_arc_r * Math.sin(min_angle),
        ry = sy + parent_arc_r * Math.cos(min_angle); /* Right ending point */
      let draw =
        "M " +
        sx +
        " " +
        sy +
        " L " +
        lx +
        " " +
        ly +
        " A " +
        parent_arc_r +
        " " +
        parent_arc_r +
        " 0 0 1 " +
        rx +
        " " +
        ry +
        " Z";
      svgatt(box.p, { visibility: "visible", d: draw });
    } else {
      svgatt(box.p, { visibility: "hidden" });
    }
  };
  const box_connect_toggle = function (box_a, box_b) {
    /* Delete if they are already connected */
    let removed_connection = false;
    for (let i in box_a.conns) {
      let conn = box_a.conns[i];
      if (conn.box1 == box_b || conn.box2 == box_b) {
        if (conn.ln != null) {
          lines.removeChild(conn.ln);
          conn.ln = null;
        }
        box_a.conns.splice(i, 1);
        removed_connection = true;
        break;
      }
    }
    for (let i in box_b.conns) {
      let conn = box_b.conns[i];
      if (conn.box1 == box_a || conn.box2 == box_a) {
        if (conn.ln != null) {
          lines.removeChild(conn.ln);
          conn.ln = null;
        }
        box_b.conns.splice(i, 1);
        removed_connection = true;
        break;
      }
    }
    if (!removed_connection) {
      let ln = svgel("line");
      lines.appendChild(ln);
      let conn = { ln: ln, box1: box_a, box2: box_b };
      box_a.conns.push(conn);
      box_b.conns.push(conn);
    }
    box_update_visual(box_a);
    box_update_visual(box_b);
  };

  /* Update SVG size so that it fills the entire screen */
  let svg_top, svg_left;
  const update_svg_pos = function () {
    let bb = svg.getBoundingClientRect();
    svg_top = bb.top;
    svg_left = bb.left;
  };
  const fit_screen_size = function () {
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", window.outerHeight + "px");
    update_svg_pos();
  };
  window.addEventListener("resize", fit_screen_size);

  /* SVG subelements can't cancel default action... need to disable it for entire SVG */
  svg.oncontextmenu = function (ev) {
    ev.preventDefault();
  };

  /* Let's go ! */
  fit_screen_size();
  return {
    create_box,
    box_connect_toggle,
  };
}
