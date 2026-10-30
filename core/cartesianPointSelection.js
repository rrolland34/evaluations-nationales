// core/cartesianPointSelection.js

export function displayCartesianPoint({
  svg,
  point,
  width,
  height,
  range,
  padding,
  name = null,
  color = "currentColor",
  replace = true
}) {

  const {
    xMin,
    xMax,
    yMin,
    yMax
  } = range;

  const plotWidth =
    width -
    padding.left -
    padding.right;

  const plotHeight =
    height -
    padding.top -
    padding.bottom;

  const svgX =
    padding.left +
    (
      point.x -
      xMin
    ) /
    (
      xMax -
      xMin
    ) *
    plotWidth;

  const svgY =
    padding.top +
    (
      yMax -
      point.y
    ) /
    (
      yMax -
      yMin
    ) *
    plotHeight;


  /*
   * On supprime l'ancien
   * point sélectionné.
   */

  if (replace) {
    svg
      .querySelector(
        ".selected-cartesian-point"
      )
      ?.remove();
  }


  /*
   * Création du nouveau
   * marqueur.
   */

  const namespace =
    "http://www.w3.org/2000/svg";

  const group =
    document.createElementNS(
      namespace,
      "g"
    );

  group.classList.add(
    "selected-cartesian-point"
  );

  group.dataset.x =
    point.x;

  group.dataset.y =
    point.y;

  group.style.cursor =
    "pointer";

  group.setAttribute(
    "stroke",
    color
  );

  group.setAttribute(
    "stroke-width",
    "3"
  );


  const markerSize = 10;

  const line1 =
    document.createElementNS(
      namespace,
      "line"
    );

  line1.setAttribute(
    "x1",
    svgX - markerSize / 2
  );

  line1.setAttribute(
    "y1",
    svgY - markerSize / 2
  );

  line1.setAttribute(
    "x2",
    svgX + markerSize / 2
  );

  line1.setAttribute(
    "y2",
    svgY + markerSize / 2
  );


  const line2 =
    document.createElementNS(
      namespace,
      "line"
    );

  line2.setAttribute(
    "x1",
    svgX - markerSize / 2
  );

  line2.setAttribute(
    "y1",
    svgY + markerSize / 2
  );

  line2.setAttribute(
    "x2",
    svgX + markerSize / 2
  );

  line2.setAttribute(
    "y2",
    svgY - markerSize / 2
  );


  const label =
    document.createElementNS(
      namespace,
      "text"
    );

  if (name) {
    label.setAttribute(
      "x",
      svgX + 10
    );

    label.setAttribute(
      "y",
      svgY - 10
    );

    label.setAttribute(
      "font-size",
      "14"
    );

    label.setAttribute(
      "fill",
      color
    );

    label.setAttribute(
      "stroke",
      "none"
    );

    label.textContent =
      name;
  }

  group.appendChild(
    line1
  );

  group.appendChild(
    line2
  );

  if (name) {
    group.appendChild(
      label
    );
  }

  svg.appendChild(
    group
  );
}

export function displayCartesianPoints({
  svg,
  points,
  width,
  height,
  range,
  padding,
  color = "currentColor"
}) {
  if (
    !svg ||
    !Array.isArray(points)
  ) {
    return;
  }

  points.forEach(
    point => {
      displayCartesianPoint({
        svg,
        point,
        width,
        height,
        range,
        padding,

        name:
          point.name ?? null,

        color,

        replace:
          false
      });
    }
  );
}

export function enableCartesianPointSelection({
  svg,

  width,
  height,

  range,

  padding,

  name=null,

  onSelect
}) {

  if (!svg) {
    return;
  }

  svg.addEventListener(
    "click",
    event => {

      const rect =
        svg.getBoundingClientRect();

      /*
       * Position du clic dans
       * le SVG affiché.
       */

      const clickX =
        event.clientX -
        rect.left;

      const clickY =
        event.clientY -
        rect.top;

      /*
       * Conversion vers les coordonnées
       * internes du SVG.
       */

      const svgX =
        clickX *
        width /
        rect.width;

      const svgY =
        clickY *
        height /
        rect.height;

      /*
       * Dimensions de la zone
       * réellement quadrillée.
       */

      const plotWidth =
        width -
        padding.left -
        padding.right;

      const plotHeight =
        height -
        padding.top -
        padding.bottom;

      /*
       * On ignore les clics
       * hors du quadrillage.
       */

      if (
        svgX < padding.left ||
        svgX >
          padding.left +
          plotWidth ||
        svgY < padding.top ||
        svgY >
          padding.top +
          plotHeight
      ) {
        return;
      }

      /*
       * Coordonnées mathématiques
       * correspondant au clic.
       */

      const x =
        range.xMin +
        (
          svgX -
          padding.left
        ) /
        plotWidth *
        (
          range.xMax -
          range.xMin
        );

      const y =
        range.yMax -
        (
          svgY -
          padding.top
        ) /
        plotHeight *
        (
          range.yMax -
          range.yMin
        );

      /*
       * Accrochage à l'intersection
       * entière la plus proche.
       */

      const selectedPoint = {
        x: Math.round(x),
        y: Math.round(y)
      };

      displayCartesianPoint({
        svg,

        point:
          selectedPoint,

        width,
        height,

        range,
        padding,

        name
      });

      onSelect?.(
        selectedPoint
      );
    }
  );
}

export function enableCartesianQCMPointSelection({
  svg,
  onSelect
}) {
  if (!svg) {
    return;
  }

  svg.addEventListener(
    "click",
    event => {
      const pointElement =
        event.target.closest(
          ".selected-cartesian-point"
        );

      if (!pointElement) {
        return;
      }

      svg
        .querySelectorAll(
          ".selected-cartesian-point"
        )
        .forEach(
          element => {
            element.setAttribute(
              "stroke",
              "currentColor"
            );

            const label =
              element.querySelector(
                "text"
              );

            if (label) {
              label.setAttribute(
                "fill",
                "currentColor"
              );
            }
          }
        );

      pointElement.setAttribute(
        "stroke",
        "blue"
      );

      const selectedLabel =
        pointElement.querySelector(
          "text"
        );

      if (selectedLabel) {
        selectedLabel.setAttribute(
          "fill",
          "blue"
        );
      }

      const selectedPoint = {
        x:
          Number(
            pointElement.dataset.x
          ),

        y:
          Number(
            pointElement.dataset.y
          )
      };

      console.log(
        "Point QCM sélectionné :",
        selectedPoint
      );

      onSelect?.(
        selectedPoint
      );
    }
  );
}

export function highlightCartesianQCMPoints({
  svg,
  selectedPoint,
  correctPoint
}) {
  if (!svg) {
    return;
  }

  const pointElements =
    svg.querySelectorAll(
      ".selected-cartesian-point"
    );

  pointElements.forEach(
    element => {
      const x =
        Number(
          element.dataset.x
        );

      const y =
        Number(
          element.dataset.y
        );

      const isSelected =
        selectedPoint !== null &&
        x === selectedPoint.x &&
        y === selectedPoint.y;

      const isCorrect =
        x === correctPoint.x &&
        y === correctPoint.y;

      let color =
        "currentColor";

      if (isCorrect) {
        color =
          "green";
      } else if (
        isSelected
      ) {
        color =
          "red";
      }

      element.setAttribute(
        "stroke",
        color
      );

      const label =
        element.querySelector(
          "text"
        );

      if (label) {
        label.setAttribute(
          "fill",
          color
        );
      }
    }
  );
}