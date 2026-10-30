// exercices/figures/angleCoding.js


function getAngleArcPath(
  vertex,
  point1,
  point2,
  radius
) {
  const angle1 =
    Math.atan2(
      point1.y - vertex.y,
      point1.x - vertex.x
    );

  const angle2 =
    Math.atan2(
      point2.y - vertex.y,
      point2.x - vertex.x
    );

  const startX =
    vertex.x +
    radius *
    Math.cos(angle1);

  const startY =
    vertex.y +
    radius *
    Math.sin(angle1);

  const endX =
    vertex.x +
    radius *
    Math.cos(angle2);

  const endY =
    vertex.y +
    radius *
    Math.sin(angle2);

  let delta =
    angle2 -
    angle1;

  while (delta < 0) {
    delta +=
      2 * Math.PI;
  }

  while (
    delta >=
    2 * Math.PI
  ) {
    delta -=
      2 * Math.PI;
  }

  const sweepFlag =
    delta <= Math.PI
      ? 1
      : 0;

  return `
    M ${startX} ${startY}
    A ${radius} ${radius}
      0 0 ${sweepFlag}
      ${endX} ${endY}
  `;
}

function createAngleTicks({
  vertex,
  point1,
  point2,
  radius,
  tickCount = 1,
  tickLength = 8,
  tickSpacing = 6
}) {
  const angle1 =
    Math.atan2(
      point1.y - vertex.y,
      point1.x - vertex.x
    );

  const angle2 =
    Math.atan2(
      point2.y - vertex.y,
      point2.x - vertex.x
    );

  /*
   * On détermine le plus petit angle
   * entre les deux côtés.
   */

  let delta =
    angle2 - angle1;

  while (delta <= -Math.PI) {
    delta +=
      2 * Math.PI;
  }

  while (delta > Math.PI) {
    delta -=
      2 * Math.PI;
  }

  const bisectorAngle =
    angle1 +
    delta / 2;

  /*
   * Les traits sont répartis
   * autour de la bissectrice.
   */

  const startOffset =
    -(
      tickCount - 1
    ) *
    tickSpacing /
    2;

  let ticks = "";

  for (
    let index = 0;
    index < tickCount;
    index++
  ) {
    const tangentialOffset =
      startOffset +
      index *
      tickSpacing;

    /*
     * Point situé sur l'arc
     * au niveau de la bissectrice.
     */

    const centerX =
      vertex.x +
      radius *
      Math.cos(
        bisectorAngle
      ) +
      tangentialOffset *
      (
        -Math.sin(
          bisectorAngle
        )
      );

    const centerY =
      vertex.y +
      radius *
      Math.sin(
        bisectorAngle
      ) +
      tangentialOffset *
      Math.cos(
        bisectorAngle
      );

    /*
     * Le petit trait est radial.
     */

    const halfLength =
      tickLength / 2;

    const startX =
      centerX -
      halfLength *
      Math.cos(
        bisectorAngle
      );

    const startY =
      centerY -
      halfLength *
      Math.sin(
        bisectorAngle
      );

    const endX =
      centerX +
      halfLength *
      Math.cos(
        bisectorAngle
      );

    const endY =
      centerY +
      halfLength *
      Math.sin(
        bisectorAngle
      );

    ticks += `
      <line
        x1="${startX}"
        y1="${startY}"
        x2="${endX}"
        y2="${endY}"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      />
    `;
  }

  return ticks;
}

export function createAngleCoding({
  vertex,
  point1,
  point2,

  radius = 30,

  style = "multiple-arcs",

  arcCount = 1,
  arcSpacing = 8,

  tickCount = 1,
  tickLength = 8,
  tickSpacing = 6
} = {}) {

  if (
    !vertex ||
    !point1 ||
    !point2
  ) {
    return "";
  }


  if (
    style === "multiple-arcs"
  ) {
    let paths = "";

    for (
      let index = 0;
      index < arcCount;
      index++
    ) {
      const currentRadius =
        radius +
        index *
        arcSpacing;

      const path =
        getAngleArcPath(
          vertex,
          point1,
          point2,
          currentRadius
        );

      paths += `
        <path
          d="${path}"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        />
      `;
    }

    return paths;
  }


  if (
    style === "arc-with-ticks"
  ) {
    const path =
      getAngleArcPath(
        vertex,
        point1,
        point2,
        radius
      );

    const ticks =
      createAngleTicks({
        vertex,
        point1,
        point2,
        radius,
        tickCount,
        tickLength,
        tickSpacing
      });

    return `
      <path
        d="${path}"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      />

      ${ticks}
    `;
  }


  return "";
}

export function getAngleLabelPosition({
  vertex,
  point1,
  point2,
  radius,
  arcCount = 1,
  arcSpacing = 8,
  label,
  labelOffset = 18
}) {
  const angle1 =
    Math.atan2(
      point1.y - vertex.y,
      point1.x - vertex.x
    );

  const angle2 =
    Math.atan2(
      point2.y - vertex.y,
      point2.x - vertex.x
    );

  let delta =
    angle2 - angle1;

  while (delta <= -Math.PI) {
    delta +=
      2 * Math.PI;
  }

  while (delta > Math.PI) {
    delta -=
      2 * Math.PI;
  }

  const bisectorAngle =
    angle1 +
    delta / 2;

  const angleSize =
    Math.abs(
      delta
    );

  const outerRadius =
    radius +
    Math.max(
      0,
      arcCount - 1
    ) *
    arcSpacing;

  const angleFactor =
    Math.max(
      1,
      (Math.PI / 3) /
      angleSize
    );

  const labelFactor =
    Math.max(
      1,
      label.length / 1.7
    );

  const labelRadius =
    outerRadius +
    labelOffset *
    angleFactor *
    labelFactor;

  return {
    x:
      vertex.x +
      labelRadius *
      Math.cos(
        bisectorAngle
      ),

    y:
      vertex.y +
      labelRadius *
      Math.sin(
        bisectorAngle
      )
  };
}