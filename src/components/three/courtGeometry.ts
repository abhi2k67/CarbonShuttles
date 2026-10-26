import * as THREE from "three";

// Official BWF Badminton Court Dimensions (in meters / 3D units)
export const COURT_DIMENSIONS = {
  length: 13.4,
  widthDoubles: 6.1,
  widthSingles: 5.18,
  shortServiceDistance: 1.98, // from net
  doublesLongServiceDistance: 0.76, // from back boundary line
  singlesSideMargin: 0.46, // each side: (6.1 - 5.18) / 2
  netHeightPosts: 1.55,
  netHeightCenter: 1.524,
  lineWidth: 0.04, // 40mm official BWF line width
};

/**
 * Creates procedural canvas texture for a complete BWF badminton court with accurate line markings.
 * Using a high-resolution canvas texture ensures crisp line rendering with zero z-fighting.
 */
export function createBadmintonCourtTexture(options?: {
  highlightServiceBox?: "right" | "left" | null;
  servingSide?: "near" | "far" | null; // near = teamA (z > 0), far = teamB (z < 0)
  highlightColor?: string;
  isDoubles?: boolean;
}): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const W = canvas.width;
  const H = canvas.height;

  // Scale factors
  const scaleX = (W * 0.85) / COURT_DIMENSIONS.widthDoubles;
  const scaleY = (H * 0.9) / COURT_DIMENSIONS.length;
  const centerX = W / 2;
  const centerY = H / 2;

  // Background Arena Surround (Dark Slate / Blue Mat Surround)
  ctx.fillStyle = "#0c1524";
  ctx.fillRect(0, 0, W, H);

  // Badminton Synthetic Green Mat
  const matW = COURT_DIMENSIONS.widthDoubles * scaleX;
  const matH = COURT_DIMENSIONS.length * scaleY;
  const matX = centerX - matW / 2;
  const matY = centerY - matH / 2;

  // Subtle mat gradient
  const matGrad = ctx.createLinearGradient(matX, matY, matX + matW, matY + matH);
  matGrad.addColorStop(0, "#0e5a3c");
  matGrad.addColorStop(0.5, "#106c47");
  matGrad.addColorStop(1, "#0d5537");
  ctx.fillStyle = matGrad;
  ctx.fillRect(matX, matY, matW, matH);

  // Coordinate helper: converts meters (relative to court center) to canvas pixels
  const toX = (xMeters: number) => centerX + xMeters * scaleX;
  const toY = (yMeters: number) => centerY + yMeters * scaleY;

  const halfL = COURT_DIMENSIONS.length / 2;
  const halfWD = COURT_DIMENSIONS.widthDoubles / 2;
  const halfWS = COURT_DIMENSIONS.widthSingles / 2;
  const shortDist = COURT_DIMENSIONS.shortServiceDistance;
  const dblLongDist = halfL - COURT_DIMENSIONS.doublesLongServiceDistance;

  // Highlight service box if requested (Umpire Tactical View)
  if (options?.highlightServiceBox && options?.servingSide) {
    const isNear = options.servingSide === "near";
    const isRight = options.highlightServiceBox === "right";
    const highlightColor = options.highlightColor || "rgba(16, 185, 129, 0.4)";

    ctx.fillStyle = highlightColor;

    // Service box boundaries:
    // Near side: y from 0 to halfL (server). Far side: y from -halfL to 0 (receiver).
    const yStart = isNear ? toY(shortDist) : toY(-halfL);
    const yEnd = isNear ? toY(options.isDoubles ? dblLongDist : halfL) : toY(-shortDist);

    // Right service box is on server's right side (x > 0 for near side, x < 0 for far side cross-court)
    let xStart = 0;
    let xEnd = 0;

    if (isNear) {
      xStart = isRight ? toX(0) : toX(options.isDoubles ? -halfWD : -halfWS);
      xEnd = isRight ? toX(options.isDoubles ? halfWD : halfWS) : toX(0);
    } else {
      // Cross-court receiver box
      xStart = isRight ? toX(options.isDoubles ? -halfWD : -halfWS) : toX(0);
      xEnd = isRight ? toX(0) : toX(options.isDoubles ? halfWD : halfWS);
    }

    ctx.fillRect(
      Math.min(xStart, xEnd),
      Math.min(yStart, yEnd),
      Math.abs(xEnd - xStart),
      Math.abs(yEnd - yStart)
    );
  }

  // Draw White BWF Lines
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(2, COURT_DIMENSIONS.lineWidth * scaleX);
  ctx.lineCap = "square";

  // 1. Outer Boundary Lines (Doubles Sidelines & Back Lines)
  ctx.strokeRect(toX(-halfWD), toY(-halfL), matW, matH);

  // 2. Singles Sidelines
  ctx.beginPath();
  ctx.moveTo(toX(-halfWS), toY(-halfL));
  ctx.lineTo(toX(-halfWS), toY(halfL));
  ctx.moveTo(toX(halfWS), toY(-halfL));
  ctx.lineTo(toX(halfWS), toY(halfL));
  ctx.stroke();

  // 3. Center Line (from short service line to back line on both sides)
  ctx.beginPath();
  // Near side
  ctx.moveTo(toX(0), toY(shortDist));
  ctx.lineTo(toX(0), toY(halfL));
  // Far side
  ctx.moveTo(toX(0), toY(-shortDist));
  ctx.lineTo(toX(0), toY(-halfL));
  ctx.stroke();

  // 4. Short Service Lines (1.98m from net)
  ctx.beginPath();
  ctx.moveTo(toX(-halfWD), toY(shortDist));
  ctx.lineTo(toX(halfWD), toY(shortDist));
  ctx.moveTo(toX(-halfWD), toY(-shortDist));
  ctx.lineTo(toX(halfWD), toY(-shortDist));
  ctx.stroke();

  // 5. Doubles Long Service Lines (0.76m inside back line)
  ctx.beginPath();
  ctx.moveTo(toX(-halfWD), toY(dblLongDist));
  ctx.lineTo(toX(halfWD), toY(dblLongDist));
  ctx.moveTo(toX(-halfWD), toY(-dblLongDist));
  ctx.lineTo(toX(halfWD), toY(-dblLongDist));
  ctx.stroke();

  // 6. Net Center Line indicator
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(toX(-halfWD - 0.2), toY(0));
  ctx.lineTo(toX(halfWD + 0.2), toY(0));
  ctx.stroke();
  ctx.setLineDash([]);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

/**
 * Creates a realistic 3D Badminton Net model (posts, top white tape, crosshatch mesh, umpire chair).
 */
export function createBadmintonNetGroup(): THREE.Group {
  const netGroup = new THREE.Group();

  const width = COURT_DIMENSIONS.widthDoubles + 0.4;
  const height = 0.76; // Net depth (from 1.55m down to ~0.79m)
  const topY = COURT_DIMENSIONS.netHeightPosts;

  // 1. Semi-transparent Crosshatch Net Mesh
  const netMeshGeo = new THREE.PlaneGeometry(width, height, 16, 8);
  const netMeshMat = new THREE.MeshStandardMaterial({
    color: 0x8a4b2a, // Official cord brown/burgundy
    roughness: 0.8,
    transparent: true,
    opacity: 0.72,
    wireframe: true,
    side: THREE.DoubleSide,
  });
  const netMesh = new THREE.Mesh(netMeshGeo, netMeshMat);
  netMesh.position.set(0, topY - height / 2, 0);
  netGroup.add(netMesh);

  // 2. White Top Tape (75mm white tape folded over cord)
  const tapeGeo = new THREE.BoxGeometry(width, 0.075, 0.04);
  const tapeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.1,
  });
  const tapeMesh = new THREE.Mesh(tapeGeo, tapeMat);
  tapeMesh.position.set(0, topY, 0);
  netGroup.add(tapeMesh);

  // 3. Bottom Tape
  const bottomTapeGeo = new THREE.BoxGeometry(width, 0.03, 0.02);
  const bottomTape = new THREE.Mesh(bottomTapeGeo, tapeMat);
  bottomTape.position.set(0, topY - height, 0);
  netGroup.add(bottomTape);

  // 4. Vertical Metal Net Posts (Red/Dark Metallic)
  const postGeo = new THREE.CylinderGeometry(0.04, 0.04, topY + 0.1, 16);
  const postMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.2,
  });

  const postLeft = new THREE.Mesh(postGeo, postMat);
  postLeft.position.set(-width / 2, topY / 2, 0);
  netGroup.add(postLeft);

  const postRight = new THREE.Mesh(postGeo, postMat);
  postRight.position.set(width / 2, topY / 2, 0);
  netGroup.add(postRight);

  // 5. Stylized Umpire High Chair next to postLeft
  const chairGroup = new THREE.Group();
  chairGroup.position.set(-width / 2 - 0.7, 0, 0);

  // Legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
  const chairHeight = 1.6;
  const legGeo = new THREE.CylinderGeometry(0.02, 0.02, chairHeight, 8);
  [-0.25, 0.25].forEach((x) => {
    [-0.25, 0.25].forEach((z) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, chairHeight / 2, z);
      chairGroup.add(leg);
    });
  });

  // Seat
  const seatGeo = new THREE.BoxGeometry(0.6, 0.06, 0.6);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
  const seat = new THREE.Mesh(seatGeo, seatMat);
  seat.position.set(0, chairHeight, 0);
  chairGroup.add(seat);

  // Backrest
  const backGeo = new THREE.BoxGeometry(0.6, 0.4, 0.04);
  const back = new THREE.Mesh(backGeo, seatMat);
  back.position.set(0, chairHeight + 0.22, -0.28);
  chairGroup.add(back);

  netGroup.add(chairGroup);

  return netGroup;
}

/**
 * Creates a procedural 3D Badminton Shuttlecock model.
 * Cork base: hemisphere / dome.
 * Feather skirt: flared cone of 16 overlapping white feathers with thread bands.
 */
export function createShuttlecockModel(scale = 1): THREE.Group {
  const shuttle = new THREE.Group();

  // 1. Cork Base (Rounded white leather covered cork)
  const corkGeo = new THREE.SphereGeometry(0.12 * scale, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const corkMat = new THREE.MeshStandardMaterial({
    color: 0xfafafa,
    roughness: 0.35,
    metalness: 0.05,
  });
  const cork = new THREE.Mesh(corkGeo, corkMat);
  cork.rotation.x = Math.PI; // Round dome pointing down
  cork.position.set(0, 0, 0);
  shuttle.add(cork);

  // 2. Feather Skirt (Flared cone)
  const skirtHeight = 0.32 * scale;
  const skirtGeo = new THREE.CylinderGeometry(
    0.28 * scale, // top radius (flared feathers)
    0.12 * scale, // bottom radius (attached to cork)
    skirtHeight,
    24,
    1,
    true // open ended
  );
  const featherMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.7,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.94,
  });
  const skirt = new THREE.Mesh(skirtGeo, featherMat);
  skirt.position.set(0, skirtHeight / 2, 0);
  shuttle.add(skirt);

  // 3. Two Thin Thread Ribbons around feathers
  const ribbonGeo = new THREE.TorusGeometry(0.18 * scale, 0.008 * scale, 8, 24);
  const ribbonMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
  const ribbon1 = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbon1.rotation.x = Math.PI / 2;
  ribbon1.position.set(0, skirtHeight * 0.4, 0);
  shuttle.add(ribbon1);

  const ribbonGeo2 = new THREE.TorusGeometry(0.23 * scale, 0.008 * scale, 8, 24);
  const ribbon2 = new THREE.Mesh(ribbonGeo2, ribbonMat);
  ribbon2.rotation.x = Math.PI / 2;
  ribbon2.position.set(0, skirtHeight * 0.75, 0);
  shuttle.add(ribbon2);

  return shuttle;
}

/**
 * Creates a procedural 3D Championship Trophy Cup with handles, stem, and pedestal.
 */
export function createTrophyModel(scale = 1): THREE.Group {
  const trophy = new THREE.Group();

  // Rich Gold PBR Material
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffb703,
    metalness: 0.92,
    roughness: 0.18,
  });

  // Dark Polished Marble Base Material
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.2,
    roughness: 0.3,
  });

  // Base tier 1 (Square block)
  const base1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.7 * scale, 0.2 * scale, 0.7 * scale),
    baseMat
  );
  base1.position.set(0, 0.1 * scale, 0);
  trophy.add(base1);

  // Base tier 2 (Cylinder spacer)
  const base2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3 * scale, 0.35 * scale, 0.15 * scale, 24),
    goldMat
  );
  base2.position.set(0, 0.275 * scale, 0);
  trophy.add(base2);

  // Stem (Slender fluted column)
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12 * scale, 0.16 * scale, 0.5 * scale, 24),
    goldMat
  );
  stem.position.set(0, 0.6 * scale, 0);
  trophy.add(stem);

  // Cup Bowl (Lathe/Sphere profile)
  const cupGeo = new THREE.CylinderGeometry(0.48 * scale, 0.18 * scale, 0.65 * scale, 32);
  const cup = new THREE.Mesh(cupGeo, goldMat);
  cup.position.set(0, 1.15 * scale, 0);
  trophy.add(cup);

  // Cup Lip Rim (Torus)
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.48 * scale, 0.03 * scale, 12, 32),
    goldMat
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 1.475 * scale, 0);
  trophy.add(rim);

  // Handles (Two curved toruses on sides)
  const handleGeo = new THREE.TorusGeometry(0.22 * scale, 0.035 * scale, 12, 24, Math.PI * 1.3);
  const handleLeft = new THREE.Mesh(handleGeo, goldMat);
  handleLeft.position.set(-0.48 * scale, 1.15 * scale, 0);
  handleLeft.rotation.z = Math.PI / 2 - 0.2;
  trophy.add(handleLeft);

  const handleRight = new THREE.Mesh(handleGeo, goldMat);
  handleRight.position.set(0.48 * scale, 1.15 * scale, 0);
  handleRight.rotation.z = -Math.PI / 2 + 0.2;
  handleRight.rotation.y = Math.PI;
  trophy.add(handleRight);

  // Top Badminton Shuttlecock Topper on the cup!
  const miniShuttle = createShuttlecockModel(scale * 0.6);
  miniShuttle.position.set(0, 1.48 * scale, 0);
  miniShuttle.rotation.z = Math.PI; // point downwards into cup
  trophy.add(miniShuttle);

  return trophy;
}

/**
 * Creates custom GLSL shader material for animated energy pulse (used on Match Point / Deuce courts).
 */
export function createMatchPointShaderMaterial(color = 0xff003c): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      baseColor: { value: new THREE.Color(color) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 baseColor;
      varying vec2 vUv;
      void main() {
        // Edge distance glow
        float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
        float intensity = smoothstep(0.12, 0.0, edge);
        float pulse = 0.65 + 0.35 * sin(time * 5.0);
        gl_FragColor = vec4(baseColor * (1.2 + pulse), intensity * pulse * 0.85);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });
}
