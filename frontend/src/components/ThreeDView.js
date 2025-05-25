import React, { useRef, useState, useEffect } from "react";
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, useTexture, GizmoHelper, GizmoViewcube, Edges, Environment } from "@react-three/drei";
import { CSG } from 'three-csg-ts';
import DxfParser from 'dxf-parser';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Color palette for volumes
const VOLUME_COLORS = [
  '#4A6FA5', // blue
  '#E07A5F', // red
  '#81B29A', // green
  '#F2CC8F', // yellow
  '#A5A58D', // olive
  '#B5838D', // pink
  '#6D6875', // purple
  '#F28482', // coral
  '#FFD166', // gold
  '#43AA8B', // teal
];

// --- Space type color mapping (should match App.js) ---
const SPACE_TYPE_COLORS = {
  Unspecified: '#b0b0b0',
  Basement: '#6D6875',
  Residential: '#81B29A',
  Commercial: '#E07A5F',
  Parking: '#FFD166',
  Roof: '#43AA8B',
};

function ExtrudedShape({ boundary, height, onFaceSelect, selectedFace, onPushPull, hoveredFace, setHoveredFace, controls, position = [0, 0, 0], color = '#4A6FA5', onVolumeSelect, isVolumeSelected }) {
  const meshRef = useRef();
  // Generate geometry with vertex colors
  const [geometry, setGeometry] = useState(null);
  // Mapping from triangle faceIndex to logical face index
  const faceMapRef = useRef({}); // { triangleFaceIndex: logicalFaceIndex }
  const logicalFaceCountRef = useRef({ top: 0, bottom: 0, sides: 0 });

  React.useEffect(() => {
    const shape = new THREE.Shape();
    if (boundary.length > 0) {
      shape.moveTo(boundary[0][0], boundary[0][1]);
      for (let i = 1; i < boundary.length; i++) {
        shape.lineTo(boundary[i][0], boundary[i][1]);
      }
      shape.lineTo(boundary[0][0], boundary[0][1]);
    }
    const extrudeSettings = {
      steps: 1,
      depth: height || 1,
      bevelEnabled: false,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // --- Logical face mapping ---
    const n = boundary.length;
    const facesPerCap = n - 2; // triangles in cap
    const faceMap = {}; // triangleFaceIndex -> logicalFaceIndex
    let triIdx = 0;
    // Top cap: logicalFaceIndex = 0
    for (let i = 0; i < facesPerCap; i++, triIdx++) {
      faceMap[triIdx] = 0; // 0 = top
    }
    // Bottom cap: logicalFaceIndex = 1
    for (let i = 0; i < facesPerCap; i++, triIdx++) {
      faceMap[triIdx] = 1; // 1 = bottom
    }
    // Sides: logicalFaceIndex = 2 + sideIdx
    for (let side = 0; side < n; side++) {
      faceMap[triIdx] = 2 + side;
      triIdx++;
      faceMap[triIdx] = 2 + side;
      triIdx++;
    }
    faceMapRef.current = faceMap;
    logicalFaceCountRef.current = { top: 0, bottom: 1, sides: n };
    // --- Visual debug: color each logical face differently ---
    const faceColors = [
      [1, 0, 0],    // top: red
      [0, 1, 0],    // bottom: green
      [0, 0, 1],    // side 1: blue
      [1, 1, 0],    // side 2: yellow
      [1, 0, 1],    // side 3: magenta
      [0, 1, 1],    // side 4: cyan
      [0.5, 0.5, 0.5], // side 5: gray
      [1, 0.5, 0],  // side 6: orange
      [0.5, 0, 1],  // side 7: purple
      [0, 0.5, 1],  // side 8: teal
    ];
    const faceCount = geom.index ? geom.index.count / 3 : geom.attributes.position.count / 3;
    const colorArr = [];
    for (let tri = 0; tri < faceCount; tri++) {
      const logicalIdx = faceMap[tri] ?? 0;
      const color = faceColors[logicalIdx % faceColors.length];
      for (let v = 0; v < 3; v++) {
        colorArr.push(color[0], color[1], color[2]);
      }
    }
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colorArr, 3));
    setGeometry(geom);
  }, [boundary, height]);

  // Helper: get all triangle indices for a logical face
  const getTrianglesForLogicalFace = (logicalFaceIdx) => {
    const triangles = [];
    for (const [triIdx, faceIdx] of Object.entries(faceMapRef.current)) {
      if (faceIdx === logicalFaceIdx) triangles.push(Number(triIdx));
    }
    return triangles;
  };

  // Highlight hovered/selected logical face
  React.useEffect(() => {
    if (!geometry) return;
    // Reset all to base color
    const baseColor = new THREE.Color("#4A6FA5");
    const colorArr = [];
    const faceCount = geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3;
    for (let i = 0; i < faceCount * 3; i++) {
      colorArr.push(baseColor.r, baseColor.g, baseColor.b);
    }
    // Highlight selected or hovered logical face
    let highlightFace = null;
    let highlightColor = null;
    if (typeof selectedFace === 'number' && selectedFace >= 0) {
      highlightFace = selectedFace;
      highlightColor = [0.92, 0.7, 0.03]; // yellow
    } else if (typeof hoveredFace === 'number' && hoveredFace >= 0) {
      highlightFace = hoveredFace;
      highlightColor = [0.98, 0.75, 0.14]; // orange
    }
    if (highlightFace !== null) {
      const triangles = getTrianglesForLogicalFace(highlightFace);
      for (const triIdx of triangles) {
        for (let i = 0; i < 3; i++) {
          const idx = triIdx * 9 + i * 3;
          colorArr[idx] = highlightColor[0];
          colorArr[idx + 1] = highlightColor[1];
          colorArr[idx + 2] = highlightColor[2];
        }
      }
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArr, 3));
    geometry.attributes.color.needsUpdate = true;
  }, [selectedFace, hoveredFace, geometry]);

  // Highlight mesh on hover/selection (by logical face)
  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (!faceMapRef.current) return;
    const triFaceIdx = e.faceIndex;
    const logicalFaceIdx = faceMapRef.current[triFaceIdx];
    if (typeof setHoveredFace === 'function') setHoveredFace(logicalFaceIdx);
  };
  const handlePointerOut = (e) => {
    e.stopPropagation();
    if (typeof setHoveredFace === 'function') setHoveredFace(null);
  };
  // Select logical face on click (persist selection)
  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (!faceMapRef.current) return;
    const triFaceIdx = e.faceIndex;
    const logicalFaceIdx = faceMapRef.current[triFaceIdx];
    if (typeof logicalFaceIdx !== 'number' || logicalFaceIdx < 0) return;
    if (typeof onFaceSelect === 'function') {
      onFaceSelect(logicalFaceIdx, meshRef.current, geometry);
    }
  };

  if (!geometry) return null;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
        onPointerOver={onVolumeSelect ? undefined : handlePointerOver}
        onPointerOut={onVolumeSelect ? undefined : handlePointerOut}
        onPointerDown={onVolumeSelect ? onVolumeSelect : handlePointerDown}
        style={isVolumeSelected ? { outline: '2px solid #805ad5' } : {}}
      >
        <meshStandardMaterial
          color={color}
          opacity={isVolumeSelected ? 1 : 0.85}
          transparent
          attach="material"
        />
        <Edges scale={isVolumeSelected ? 1.03 : 1.01} threshold={15} color={isVolumeSelected ? "#805ad5" : "#222"} />
      </mesh>
    </group>
  );
}

function PlanImagePlane({ imageUrl, scale, offset }) {
  const texture = useTexture(imageUrl);
  // Default size for the plan image plane (can be made adjustable)
  const width = 20 * scale;
  const height = 20 * scale;
  // Place on XY plane at Z=0, with offset
  return (
    <mesh position={[offset[0], offset[1], 0]} rotation={[0, 0, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent opacity={0.7} />
    </mesh>
  );
}

function PreviewRectangle({ start, end }) {
  if (!start || !end) return null;
  const [x1, y1] = start;
  const [x2, y2] = end;
  const boundary = [
    [x1, y1],
    [x2, y1],
    [x2, y2],
    [x1, y2],
  ];
  const shape = new THREE.Shape();
  shape.moveTo(boundary[0][0], boundary[0][1]);
  for (let i = 1; i < boundary.length; i++) {
    shape.lineTo(boundary[i][0], boundary[i][1]);
  }
  shape.lineTo(boundary[0][0], boundary[0][1]);
  // Place on XY plane at Z=0
  return (
    <mesh geometry={new THREE.ShapeGeometry(shape)} position={[0, 0, 0.01]}>
      <meshBasicMaterial color="#4A6FA5" opacity={0.3} transparent />
    </mesh>
  );
}

// Move all R3F hook-using components to top-level
function InteractiveDraw({ onComplete, planImage, pdfScale, pdfOffset, snapToGrid, gridSnapSize }) {
  const { camera, gl } = useThree();
  const [drawing, setDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [cursor, setCursor] = useState(null); // For live marker
  // Convert screen coords to world coords on the X-Y plane (Z=0)
  const getWorldPoint = (x, y) => {
    const mouse = new THREE.Vector2();
    mouse.x = (x / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = -(y / gl.domElement.clientHeight) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const point = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, point);
    let px = point.x, py = point.y;
    if (planImage) {
      px = (px / pdfScale) + pdfOffset[0];
      py = (py / pdfScale) + pdfOffset[1];
    }
    if (snapToGrid) {
      px = Math.round(px / gridSnapSize) * gridSnapSize;
      py = Math.round(py / gridSnapSize) * gridSnapSize;
    }
    return [px, py];
  };
  // Handle mouse click
  const handlePointerDown = (e) => {
    e.stopPropagation();
    const [x, y] = getWorldPoint(e.clientX, e.clientY);
    if (!drawing) {
      setStartPoint([x, y]);
      setEndPoint([x, y]);
      setDrawing(true);
    } else {
      setEndPoint([x, y]);
      setDrawing(false);
      // Rectangle boundary
      const [x1, y1] = startPoint;
      const [x2, y2] = [x, y];
      const boundary = [
        [x1, y1],
        [x2, y1],
        [x2, y2],
        [x1, y2],
      ];
      // Prompt for name and height
      setTimeout(() => {
        const name = prompt("Please enter a name for this shape:");
        const height = parseFloat(prompt("Please enter the height for this shape (in meters):"));
        if (name && height) {
          onComplete({ name, boundary, height });
        }
        setStartPoint(null);
        setEndPoint(null);
      }, 100);
    }
  };
  // Handle mouse move for preview and marker
  const handlePointerMove = (e) => {
    const [x, y] = getWorldPoint(e.clientX, e.clientY);
    if (drawing) setEndPoint([x, y]);
    setCursor([x, y]);
  };
  // Always update marker on move
  useEffect(() => {
    const dom = gl.domElement;
    const move = (e) => {
      const [x, y] = getWorldPoint(e.clientX, e.clientY);
      setCursor([x, y]);
    };
    dom.addEventListener('pointermove', move);
    return () => dom.removeEventListener('pointermove', move);
  }, [gl, camera, planImage, pdfScale, pdfOffset, snapToGrid]);
  // ESC cancels rectangle drawing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDrawing(false);
        setStartPoint(null);
        setEndPoint(null);
        setCursor(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  // Add event listeners to the canvas
  useFrame(() => {
    gl.domElement.style.cursor = drawing ? "crosshair" : "pointer";
  });
  useEffect(() => {
    const dom = gl.domElement;
    dom.addEventListener("pointerdown", handlePointerDown);
    dom.addEventListener("pointermove", handlePointerMove);
    return () => {
      dom.removeEventListener("pointerdown", handlePointerDown);
      dom.removeEventListener("pointermove", handlePointerMove);
    };
    // eslint-disable-next-line
  }, [drawing, startPoint, endPoint]);
  return <>
    <PreviewRectangle start={startPoint} end={endPoint} />
    {cursor && <>
      <mesh position={[cursor[0], cursor[1], 0.55]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#3182ce" />
      </mesh>
      <Html position={[cursor[0], cursor[1], 0.7]} style={{ pointerEvents: 'none', fontSize: 15, background: 'rgba(255,255,255,0.85)', padding: '2px 6px', borderRadius: 4, color: '#222', border: '1px solid #cbd5e1' }}>
        X: {cursor[0].toFixed(2)} m, Y: {cursor[1].toFixed(2)} m
      </Html>
    </>}
  </>;
}

function InteractivePolygonDraw({ onComplete, planImage, pdfScale, pdfOffset, snapToGrid, gridSnapSize, setDrawPolygonMode }) {
  const { camera, gl } = useThree();
  const [points, setPoints] = useState([]);
  const [preview, setPreview] = useState(null);
  const [cursor, setCursor] = useState(null); // For live marker
  // Convert screen coords to world coords on the X-Y plane (Z=0)
  const getWorldPoint = (clientX, clientY) => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    const mouse = new THREE.Vector2(x, y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const point = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, point);
    let px = point.x, py = point.y;
    // If PDF/DXF is present, apply scale/offset
    if (planImage) {
      px = (px / pdfScale) + pdfOffset[0];
      py = (py / pdfScale) + pdfOffset[1];
    }
    // Snap to grid if enabled
    if (snapToGrid) {
      px = Math.round(px / gridSnapSize) * gridSnapSize;
      py = Math.round(py / gridSnapSize) * gridSnapSize;
    }
    return [px, py];
  };
  // Handle click to add point
  const handlePointerDown = (e) => {
    e.stopPropagation();
    const [x, y] = getWorldPoint(e.clientX, e.clientY);
    setPoints((prev) => [...prev, [x, y]]);
  };
  // Handle mouse move for preview and marker
  const handlePointerMove = (e) => {
    if (points.length === 0) return;
    const [x, y] = getWorldPoint(e.clientX, e.clientY);
    setPreview([x, y]);
    setCursor([x, y]);
  };
  // Always update marker on move, even if no points yet
  useEffect(() => {
    const dom = gl.domElement;
    const move = (e) => {
      const [x, y] = getWorldPoint(e.clientX, e.clientY);
      setCursor([x, y]);
    };
    dom.addEventListener('pointermove', move);
    return () => dom.removeEventListener('pointermove', move);
  }, [gl, camera, planImage, pdfScale, pdfOffset, snapToGrid]);
  // Handle double click to finish polygon
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (points.length >= 3) {
      onComplete(points);
      setPoints([]);
      setPreview(null);
      setCursor(null);
    }
  };
  // Handle ESC to cancel drawing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPoints([]);
        setPreview(null);
        setCursor(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  // Add event listeners to the canvas
  useFrame(() => {
    gl.domElement.style.cursor = 'crosshair';
  });
  React.useEffect(() => {
    const dom = gl.domElement;
    dom.addEventListener('pointerdown', handlePointerDown);
    dom.addEventListener('pointermove', handlePointerMove);
    dom.addEventListener('dblclick', handleDoubleClick);
    return () => {
      dom.removeEventListener('pointerdown', handlePointerDown);
      dom.removeEventListener('pointermove', handlePointerMove);
      dom.removeEventListener('dblclick', handleDoubleClick);
    };
    // eslint-disable-next-line
  }, [points]);
  // Render the preview polygon and points
  let polyPoints = points.slice();
  if (preview) polyPoints.push(preview);
  // Draw spheres for each point
  const pointSpheres = polyPoints.map(([x, y], idx) => (
    <mesh key={idx} position={[x, y, 0.5]}>
      <sphereGeometry args={[0.03, 16, 16]} />
      <meshBasicMaterial color="#FFD600" />
    </mesh>
  ));
  // Draw polygon fill and outline if 2+ points
  let fill = null;
  let outline = null;
  if (polyPoints.length >= 2) {
    const shape = new THREE.Shape();
    shape.moveTo(polyPoints[0][0], polyPoints[0][1]);
    for (let i = 1; i < polyPoints.length; i++) {
      shape.lineTo(polyPoints[i][0], polyPoints[i][1]);
    }
    fill = (
      <mesh position={[0, 0, 0.45]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color="#FFD600" opacity={0.25} transparent />
      </mesh>
    );
    // Outline as a line loop
    const flat = polyPoints.flatMap(([x, y]) => [x, y, 0.5]);
    outline = (
      <lineLoop>
        <bufferGeometry>
          <bufferAttribute
            attachObject={['attributes', 'position']}
            count={polyPoints.length}
            array={new Float32Array(flat)}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#FFD600" />
      </lineLoop>
    );
  }
  // Live marker
  const marker = cursor ? (
    <>
      <mesh position={[cursor[0], cursor[1], 0.55]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#3182ce" />
      </mesh>
      <Html position={[cursor[0], cursor[1], 0.7]} style={{ pointerEvents: 'none', fontSize: 15, background: 'rgba(255,255,255,0.85)', padding: '2px 6px', borderRadius: 4, color: '#222', border: '1px solid #cbd5e1' }}>
        X: {cursor[0].toFixed(2)} m, Y: {cursor[1].toFixed(2)} m
      </Html>
    </>
  ) : null;
  return (
    <>
      {fill}
      {outline}
      {pointSpheres}
      {marker}
    </>
  );
}

function CameraContextBridge({ onUpdate }) {
  const { camera, gl } = useThree();
  useEffect(() => {
    onUpdate({ camera, gl });
  }, [camera, gl, onUpdate]);
  return null;
}

// Add StaticGrid at the top level
function StaticGrid({ size = 50, divisions = 50, colorCenterLine = '#666', colorGrid = '#b0b0b0' }) {
  return (
    <gridHelper
      args={[size, divisions, colorCenterLine, colorGrid]}
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]} // XY plane
    />
  );
}

// Add LevelPlanes at the top level
function LevelPlanes({ boundary, height, interval }) {
  if (!interval || interval <= 0) return null;
  const levels = [];
  for (let z = interval; z < height; z += interval) {
    const shape = new THREE.Shape();
    if (boundary.length > 0) {
      shape.moveTo(boundary[0][0], boundary[0][1]);
      for (let i = 1; i < boundary.length; i++) {
        shape.lineTo(boundary[i][0], boundary[i][1]);
      }
      shape.lineTo(boundary[0][0], boundary[0][1]);
    }
    levels.push(
      <mesh key={z} position={[0, 0, z]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color="#3182ce" opacity={0.18} transparent />
      </mesh>
    );
  }
  return <group>{levels}</group>;
}

// Utility: Boolean subtract all core volumes from a main volume
function subtractCoresFromVolume(mainVolume, coreVolumes) {
  // Only subtract cores that overlap in Z, and clip the core mesh to the overlap
  const mainBase = mainVolume.baseZ || 0;
  const mainTop = mainBase + (mainVolume.height || 1);
  // Create main mesh
  const mainShape = new THREE.Shape();
  mainVolume.boundary.forEach(([x, y], i) => {
    if (i === 0) mainShape.moveTo(x, y);
    else mainShape.lineTo(x, y);
  });
  mainShape.lineTo(mainVolume.boundary[0][0], mainVolume.boundary[0][1]);
  const mainGeom = new THREE.ExtrudeGeometry(mainShape, { depth: mainVolume.height, bevelEnabled: false });
  const mainMesh = new THREE.Mesh(mainGeom);
  mainMesh.position.z = mainBase;

  let resultMesh = mainMesh;
  coreVolumes.forEach(core => {
    const coreBase = core.baseZ || 0;
    const coreTop = coreBase + (core.height || 1);
    // Compute overlap in Z
    const overlapStart = Math.max(mainBase, coreBase);
    const overlapEnd = Math.min(mainTop, coreTop);
    const overlapHeight = overlapEnd - overlapStart;
    if (overlapHeight > 0) {
      // Only subtract the overlapping portion of the core
      const coreShape = new THREE.Shape();
      core.boundary.forEach(([x, y], i) => {
        if (i === 0) coreShape.moveTo(x, y);
        else coreShape.lineTo(x, y);
      });
      coreShape.lineTo(core.boundary[0][0], core.boundary[0][1]);
      const coreGeom = new THREE.ExtrudeGeometry(coreShape, { depth: overlapHeight, bevelEnabled: false });
      const coreMesh = new THREE.Mesh(coreGeom);
      coreMesh.position.z = overlapStart;
      resultMesh = CSG.subtract(resultMesh, coreMesh);
    }
  });

  // Set a material for the result
  resultMesh.material = new THREE.MeshStandardMaterial({ color: '#4A6FA5', opacity: 0.85, transparent: true });
  return resultMesh;
}

export default function ThreeDView({ spaces = [], onAddSpace, onUpdateSpaces, planImage, activeTool, setActiveTool, coreVisibility = {} }) {
  const gridSize = 50;
  // Remove local drawPolygonMode, drawRectangleMode, calibrateMode, selectMode, activeTool state
  // Use derived booleans from activeTool
  const drawPolygonMode = activeTool === 'drawPolygon';
  const drawRectangleMode = activeTool === 'drawRectangle';
  const calibrateMode = activeTool === 'calibrate';
  const selectMode = activeTool === 'select' ? 'volume' : 'face';
  // Track both selected shape and face
  const [selected, setSelected] = useState({ shapeIdx: null, faceIdx: null, edgeIdx: null });
  const [hovered, setHovered] = useState({ shapeIdx: null, faceIdx: null });
  const [levelInterval, setLevelInterval] = useState(1);
  const [showLevels, setShowLevels] = useState(false);
  const [pdfScale, setPdfScale] = useState(1); // scale factor for PDF plane
  const [calibratePoints, setCalibratePoints] = useState([]); // [[x1, y1], [x2, y2]]
  const [pdfOffset, setPdfOffset] = useState([0, 0]);
  const [snapToGrid, setSnapToGrid] = useState(true); // Snap to grid toggle
  const gridSnapSize = 1; // 1 unit grid
  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [multiSelected, setMultiSelected] = useState([]); // array of indices
  const [fiberContext, setFiberContext] = useState({});
  // Add state to track pending core addition
  const [pendingCoreFor, setPendingCoreFor] = useState(null);
  // --- DXF Import State ---
  const [dxfFile, setDxfFile] = useState(null);
  const [dxfLayers, setDxfLayers] = useState([]);
  const [dxfSelectedLayer, setDxfSelectedLayer] = useState('');
  const [dxfPolylines, setDxfPolylines] = useState([]);
  const [dxfLoading, setDxfLoading] = useState(false);
  // --- Pending imported shapes for user review ---
  const [pendingImportedShapes, setPendingImportedShapes] = useState([]);

  const controls = useRef();
  const canvasRef = useRef();

  // --- Vertex Handle Editing State ---
  const [draggingVertex, setDraggingVertex] = useState(null); // { shapeIdx, vertIdx } or null
  const [hoveredVertex, setHoveredVertex] = useState(null); // { shapeIdx, vertIdx } or null

  // --- Vertex Handle Drag Logic ---
  useEffect(() => {
    if (!draggingVertex) return;
    const handlePointerMove = (e) => {
      // Get mouse position in world coords (XY plane)
      let dom = canvasRef.current && canvasRef.current.querySelector('canvas');
      // --- Debug: fallback to document.querySelector if needed ---
      if (!dom) dom = document.querySelector('canvas');
      if (!dom || draggingVertex.shapeIdx == null || draggingVertex.vertIdx == null) return;
      const rect = dom.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const mouse = new THREE.Vector2(x, y);
      const { camera } = fiberContext;
      if (!camera) return;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const point = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, point);
      // --- Debug: log the new vertex position ---
      console.log('Dragging vertex', draggingVertex, 'to', point.x, point.y);
      // Update the vertex in the shape boundary
      onUpdateSpaces(prev => prev.map((space, idx) => {
        if (idx !== draggingVertex.shapeIdx) return space;
        const boundary = [...space.boundary];
        boundary[draggingVertex.vertIdx] = [point.x, point.y];
        return { ...space, boundary };
      }));
    };
    const handlePointerUp = () => {
      setDraggingVertex(null);
      // Re-enable controls
      if (controls.current) controls.current.enabled = true;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    // Disable controls while dragging
    if (controls.current) controls.current.enabled = false;
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (controls.current) controls.current.enabled = true;
    };
  }, [draggingVertex, fiberContext, onUpdateSpaces]);

  // --- Vertex Handles for Selected Shape ---
  const VertexHandles = (() => {
    if (selected.shapeIdx == null || !spaces[selected.shapeIdx]) return null;
    const shape = spaces[selected.shapeIdx];
    return shape.boundary.map(([x, y], vertIdx) => (
      <mesh
        key={vertIdx}
        position={[x, y, (shape.baseZ || 0) + 0.1]}
        onPointerDown={e => {
          e.stopPropagation(); // Ensure OrbitControls do not activate
          setDraggingVertex({ shapeIdx: selected.shapeIdx, vertIdx });
        }}
        onPointerOver={e => {
          e.stopPropagation();
          setHoveredVertex({ shapeIdx: selected.shapeIdx, vertIdx });
        }}
        onPointerOut={e => {
          e.stopPropagation();
          setHoveredVertex(null);
        }}
        pointerEvents="auto"
      >
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={
          draggingVertex && draggingVertex.vertIdx === vertIdx ? '#f6ad55' :
          hoveredVertex && hoveredVertex.vertIdx === vertIdx ? '#3182ce' : '#FFD600'
        } opacity={0.95} />
      </mesh>
    ));
  })();

  // --- Drag selection handlers ---
  useEffect(() => {
    if (selectMode !== 'volume') return;
    const dom = canvasRef.current && canvasRef.current.querySelector('canvas');
    if (!dom) return;
    let dragActive = false;
    let start = null;
    let end = null;
    const handleMouseDown = (e) => {
      // Only start drag selection if Shift is held
      if (e.button !== 0 || !e.shiftKey) return;
      dragActive = true;
      start = [e.clientX, e.clientY];
      setIsDragging(true);
      // Disable OrbitControls while dragging
      if (controls.current) controls.current.enabled = false;
    };
    const handleMouseMove = (e) => {
      if (!dragActive) return;
      end = [e.clientX, e.clientY];
    };
    const handleMouseUp = (e) => {
      if (!dragActive) return;
      dragActive = false;
      setIsDragging(false);
      // Compute selection
      const rect = [
        Math.min(start[0], e.clientX),
        Math.min(start[1], e.clientY),
        Math.max(start[0], e.clientX),
        Math.max(start[1], e.clientY)
      ];
      // Project each volume's base polygon to screen and check intersection
      const selectedIdxs = [];
      const { camera, gl } = fiberContext;
      if (!camera || !gl) {
        setMultiSelected([]);
        return;
      }
      spaces.forEach((space, idx) => {
        const verts = space.boundary.map(([x, y]) => {
          const vec = new THREE.Vector3(x, y, space.baseZ || 0);
          vec.project(camera);
          // Convert to screen coords
          const sx = (vec.x * 0.5 + 0.5) * gl.domElement.clientWidth;
          const sy = (-vec.y * 0.5 + 0.5) * gl.domElement.clientHeight;
          return [sx, sy];
        });
        // Check if any vertex is inside the drag rect
        if (verts.some(([sx, sy]) => sx >= rect[0] && sx <= rect[2] && sy >= rect[1] && sy <= rect[3])) {
          selectedIdxs.push(idx);
        }
      });
      setMultiSelected(selectedIdxs);
      setSelected({ shapeIdx: null, faceIdx: null, edgeIdx: null });
    };
    dom.addEventListener('mousedown', handleMouseDown);
    dom.addEventListener('mousemove', handleMouseMove);
    dom.addEventListener('mouseup', handleMouseUp);
    return () => {
      dom.removeEventListener('mousedown', handleMouseDown);
      dom.removeEventListener('mousemove', handleMouseMove);
      dom.removeEventListener('mouseup', handleMouseUp);
      // Ensure controls are enabled if effect is cleaned up
      if (controls.current) controls.current.enabled = true;
    };
  }, [selectMode, spaces, fiberContext]);

  // Provide camera/gl context for drag selection
  useEffect(() => {
    window._threeFiberContext = fiberContext;
    return () => { delete window._threeFiberContext; };
  }, [fiberContext]);

  // --- Global keydown handler for delete and esc ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete selected volume(s)
      if (
        e.key === 'Delete' &&
        selectMode === 'volume' &&
        ((selected.shapeIdx !== null && spaces[selected.shapeIdx]) || multiSelected.length > 0)
      ) {
        if (multiSelected.length > 0) {
          onUpdateSpaces(prev => prev.filter((_, idx) => !multiSelected.includes(idx)));
          setMultiSelected([]);
        } else {
          onUpdateSpaces(prev => prev.filter((_, idx) => idx !== selected.shapeIdx));
        }
        setSelected({ shapeIdx: null, faceIdx: null, edgeIdx: null });
      }
      // ESC always clears all selections and cancels drag/rectangle drawing
      if (e.key === 'Escape') {
        setSelected({ shapeIdx: null, faceIdx: null, edgeIdx: null });
        setMultiSelected([]);
        setIsDragging(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectMode, selected, spaces, onUpdateSpaces, multiSelected, isDragging]);

  const handleComplete = (space) => {
    let baseZ = 0;
    if (selected.shapeIdx !== null && spaces[selected.shapeIdx]) {
      const sel = spaces[selected.shapeIdx];
      baseZ = (sel.baseZ || 0) + (sel.height || 1);
    }
    if (onAddSpace) {
      onAddSpace({ ...space, baseZ });
      setTimeout(() => {
        if (window.confirm('Do you want to add a core to this volume?')) {
          setPendingCoreFor(spaces.length); // index of the just-added volume
          setActiveTool('drawCore');
        } else {
          setActiveTool && setActiveTool('select');
          setSelected({ shapeIdx: spaces.length, faceIdx: null, edgeIdx: null });
        }
      }, 100);
    }
  };

  // Deselect when clicking empty space
  const handleDeselect = () => {
    setSelected({ shapeIdx: null, faceIdx: null, edgeIdx: null });
  };

  // Push/pull handler: only allow for top face (for simplicity)
  const handleFaceSelect = (faceIndex, mesh, geometry, shapeIdx) => {
    if (typeof faceIndex !== "number" || faceIndex < 0) {
      setSelected({ shapeIdx: null, faceIdx: null, edgeIdx: null });
      return;
    }
    // For side faces, also store the edge index
    let edgeIdx = null;
    if (faceIndex >= 2) {
      edgeIdx = faceIndex - 2;
    }
    setSelected({ shapeIdx, faceIdx: faceIndex, edgeIdx });
  };

  const handlePushPull = (newHeight) => {
    if (selected.shapeIdx != null) {
      onUpdateSpaces(prev =>
        prev.map((space, idx) =>
          idx === selected.shapeIdx ? { ...space, height: newHeight } : space
        )
      );
    }
  };

  // Extrude side (push/pull edge) logic
  const handleExtrudeSide = (delta) => {
    if (selected.shapeIdx == null || selected.faceIdx == null || selected.faceIdx < 2) return;
    const edgeIdx = selected.faceIdx - 2;
    onUpdateSpaces(prev => prev.map((space, idx) => {
      if (idx !== selected.shapeIdx) return space;
      const boundary = [...space.boundary];
      // Get previous and next points for the edge
      const n = boundary.length;
      const p1 = boundary[edgeIdx];
      const p2 = boundary[(edgeIdx + 1) % n];
      // Compute edge vector
      const dx = p2[0] - p1[0];
      const dy = p2[1] - p1[1];
      // Normal vector (perpendicular, outward)
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      // Move both points of the edge
      const step = delta; // e.g., 0.5 units
      boundary[edgeIdx] = [p1[0] + nx * step, p1[1] + ny * step];
      boundary[(edgeIdx + 1) % n] = [p2[0] + nx * step, p2[1] + ny * step];
      return { ...space, boundary };
    }));
  };

  // Calculate metrics
  const metrics = React.useMemo(() => {
    // Separate main and core volumes
    const mainVolumes = spaces.filter(space => !space.isCore);
    const coreVolumes = spaces.filter((space, idx) => space.isCore && (coreVisibility[idx] !== false)); // Only visible cores
    let totalGFA = 0;
    let totalLevels = mainVolumes.length;
    const perVolume = mainVolumes.map((space, idx) => {
      // Area of base polygon (Shoelace formula)
      const boundary = space.boundary;
      let area = 0;
      for (let i = 0, n = boundary.length; i < n; i++) {
        const [x1, y1] = boundary[i];
        const [x2, y2] = boundary[(i + 1) % n];
        area += (x1 * y2 - x2 * y1);
      }
      area = Math.abs(area) / 2;
      let gfa = area * (space.height || 1);
      // Subtract overlapping core volumes
      coreVolumes.forEach(core => {
        // Check Z overlap
        const mainBase = space.baseZ || 0;
        const mainTop = mainBase + (space.height || 1);
        const coreBase = core.baseZ || 0;
        const coreTop = coreBase + (core.height || 1);
        const overlapStart = Math.max(mainBase, coreBase);
        const overlapEnd = Math.min(mainTop, coreTop);
        const overlapHeight = overlapEnd - overlapStart;
        if (overlapHeight > 0) {
          // Area of core base polygon (Shoelace)
          const coreBoundary = core.boundary;
          let coreArea = 0;
          for (let i = 0, n = coreBoundary.length; i < n; i++) {
            const [x1, y1] = coreBoundary[i];
            const [x2, y2] = coreBoundary[(i + 1) % n];
            coreArea += (x1 * y2 - x2 * y1);
          }
          coreArea = Math.abs(coreArea) / 2;
          // Subtract the overlapping core volume (coreArea * overlapHeight)
          gfa -= coreArea * overlapHeight;
          area -= coreArea; // For per-level area, subtract base area if fully overlapping
        }
      });
      gfa = Math.max(0, gfa);
      area = Math.max(0, area);
      totalGFA += gfa;
      return { idx, gfa, area, height: space.height || 1 };
    });
    return { totalGFA, totalLevels, perVolume };
  }, [spaces, coreVisibility]);

  // Modified ExtrudedShape click logic for selectMode
  function handleVolumeSelect(idx, e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    setSelected({ shapeIdx: idx, faceIdx: null, edgeIdx: null });
  }

  // --- PDF Calibration Logic ---
  const CalibratePDFHelper = () => {
    const { camera, gl } = useThree();
    useEffect(() => {
      if (!calibrateMode) return;
      const handleClick = (e) => {
        if (!planImage) return;
    const mouse = new THREE.Vector2();
        mouse.x = (e.clientX / gl.domElement.clientWidth) * 2 - 1;
        mouse.y = -(e.clientY / gl.domElement.clientHeight) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const point = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, point);
        const x = (point.x / pdfScale) + pdfOffset[0];
        const y = (point.y / pdfScale) + pdfOffset[1];
        setCalibratePoints((prev) => {
          if (prev.length === 0) return [[x, y]];
          if (prev.length === 1) return [prev[0], [x, y]];
          return [[x, y]];
        });
      };
      gl.domElement.addEventListener('pointerdown', handleClick);
      return () => gl.domElement.removeEventListener('pointerdown', handleClick);
    }, [calibrateMode, planImage, pdfScale, pdfOffset]);
    // Draw calibration line
    if (calibratePoints.length === 2) {
      const [[x1, y1], [x2, y2]] = calibratePoints;
      return (
        <line>
          <bufferGeometry attach="geometry">
            <bufferAttribute attachObject={["attributes", "position"]} count={2} array={new Float32Array([x1, y1, 0.02, x2, y2, 0.02])} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color="#e53e3e" linewidth={2} />
        </line>
      );
    }
    return null;
  };

  useEffect(() => {
    if (calibrateMode && calibratePoints.length === 2) {
      const [[x1, y1], [x2, y2]] = calibratePoints;
      const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      setTimeout(() => {
        const realDist = parseFloat(prompt('Please enter the real-world distance between the two points (in meters):'));
        if (realDist && dist > 0) {
          setPdfScale(realDist / dist);
        }
        setActiveTool && setActiveTool(null);
        setCalibratePoints([]);
      }, 100);
    }
  }, [calibratePoints, calibrateMode]);

  // --- Add core drawing support ---
  const drawCoreMode = activeTool === 'drawCore';

  // When drawing a core, mark the new space as isCore: true
  const handleCoreComplete = (coreObj) => {
    setTimeout(() => {
      // If using InteractiveDraw, coreObj is { name, boundary, height }
      let { name, boundary, height } = coreObj;
      if (!name) name = prompt("Please enter a name for this core:");
      if (!height) height = parseFloat(prompt("Please enter the height for this core (in meters):"));
      let baseZ = 0;
      if (pendingCoreFor !== null && spaces[pendingCoreFor]) {
        const sel = spaces[pendingCoreFor];
        baseZ = sel.baseZ || 0;
      }
      if (name && height && boundary) {
        onAddSpace && onAddSpace({ name, boundary, height, baseZ, isCore: true });
      }
      setPendingCoreFor(null);
      setActiveTool && setActiveTool('select');
      setSelected({ shapeIdx: spaces.length, faceIdx: null, edgeIdx: null });
    }, 100);
  };

  // --- Split at Level logic ---
  const handleSplitAllLevels = () => {
    if (selected.shapeIdx == null || !spaces[selected.shapeIdx] || levelInterval <= 0) return;
    const space = spaces[selected.shapeIdx];
    const { boundary, height = 1, baseZ = 0, name, isCore } = space;
    // Only split main volumes, not cores
    if (isCore) return;
    const splits = [];
    for (let z = 0; z < height; z += levelInterval) {
      const h = Math.min(levelInterval, height - z);
      splits.push({
        name: name + ' (L' + (Math.floor(z / levelInterval) + 1) + ')',
        boundary: [...boundary],
        height: h,
        baseZ: baseZ + z,
        isCore: false
      });
    }
    // Keep all cores in the array, only replace the selected main volume
    onUpdateSpaces(prev => {
      const before = prev.slice(0, selected.shapeIdx);
      const after = prev.slice(selected.shapeIdx + 1);
      return [
        ...before,
        ...splits,
        ...after
      ];
    });
    // Automatically select the first new split volume
    setSelected({ shapeIdx: selected.shapeIdx, faceIdx: null, edgeIdx: null });
  };

  // --- Polygon Complete logic ---
  const handlePolygonComplete = (points) => {
    setTimeout(() => {
      const name = prompt("Please enter a name for this shape:");
      const height = parseFloat(prompt("Please enter the height for this shape (in meters):"));
      let baseZ = 0;
      if (selected.shapeIdx !== null && spaces[selected.shapeIdx]) {
        const sel = spaces[selected.shapeIdx];
        baseZ = (sel.baseZ || 0) + (sel.height || 1);
      }
      if (name && height) {
        if (onAddSpace) {
          onAddSpace({ name, boundary: points, height, baseZ });
          setTimeout(() => {
            if (window.confirm('Do you want to add a core to this volume?')) {
              setPendingCoreFor(spaces.length);
              setActiveTool('drawCore');
            } else {
              setActiveTool && setActiveTool('select');
              setSelected({ shapeIdx: spaces.length, faceIdx: null, edgeIdx: null });
      }
    }, 100);
        }
      }
    }, 100);
  };

  // Separate main and core volumes
  const mainVolumes = spaces.filter(space => !space.isCore);
  const coreVolumes = spaces.filter((space, idx) => space.isCore && (coreVisibility[idx] !== false)); // Only visible cores

  // --- DXF Import Handlers ---
  const handleDxfFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDxfFile(file);
    setDxfLoading(true);
    try {
      const text = await file.text();
      const parser = new DxfParser();
      const dxf = parser.parseSync(text);
      // Get all layers
      const layers = (dxf.tables && dxf.tables.layer && dxf.tables.layer.layers)
        ? Object.keys(dxf.tables.layer.layers)
        : [];
      setDxfLayers(layers);
      setDxfSelectedLayer(layers[0] || '');
      setDxfPolylines([]);
    } catch (err) {
      alert('Failed to parse DXF: ' + err.message);
      setDxfLayers([]);
      setDxfSelectedLayer('');
      setDxfPolylines([]);
    }
    setDxfLoading(false);
  };

  const handleDxfLayerSelect = (e) => {
    setDxfSelectedLayer(e.target.value);
    setDxfPolylines([]);
  };

  // --- Camera fit helper ---
  const fitCameraToBounds = (bounds, padding = 1.2) => {
    if (!fiberContext.camera || !fiberContext.controls) return;
    const { camera } = fiberContext;
    const { min, max } = bounds;
    // Center
    const center = [
      (min[0] + max[0]) / 2,
      (min[1] + max[1]) / 2,
      (min[2] + max[2]) / 2,
    ];
    // Size
    const size = [
      (max[0] - min[0]) * padding,
      (max[1] - min[1]) * padding,
      (max[2] - min[2]) * padding,
    ];
    // Set camera position (from above, at a distance)
    const maxDim = Math.max(size[0], size[1], size[2]);
    camera.position.set(center[0] + maxDim, center[1] + maxDim, center[2] + maxDim);
    camera.lookAt(center[0], center[1], center[2]);
    if (fiberContext.controls) {
      fiberContext.controls.target.set(center[0], center[1], center[2]);
      fiberContext.controls.update();
    }
  };

  const handleDxfImportPolylines = async () => {
    if (!dxfFile || !dxfSelectedLayer) return;
    setDxfLoading(true);
    try {
      const text = await dxfFile.text();
      const parser = new DxfParser();
      const dxf = parser.parseSync(text);
      // Filter for polylines in the selected layer
      const polylines = (dxf.entities || []).filter(ent =>
        (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') &&
        ent.layer === dxfSelectedLayer
      );
      // Convert to boundary format (cm to m)
      let boundaries = polylines.map(poly => {
        if (poly.vertices) {
          return poly.vertices.map(v => [v.x / 100, v.y / 100]);
        } else if (poly.points) {
          return poly.points.map(v => [v.x / 100, v.y / 100]);
        }
        return [];
      }).filter(b => b.length > 1);
      // --- Auto-center and scale logic ---
      if (boundaries.length > 0) {
        // Flatten all points
        const allPoints = boundaries.flat();
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        allPoints.forEach(([x, y]) => {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        });
        // Compute centroid
        const sum = allPoints.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
        const centroid = [sum[0] / allPoints.length, sum[1] / allPoints.length];
        // Center all boundaries
        boundaries = boundaries.map(boundary => boundary.map(([x, y]) => [x - centroid[0], y - centroid[1]]));
        // Optionally scale to fit within 20x20 meters
        const width = maxX - minX;
        const height = maxY - minY;
        const maxDim = Math.max(width, height) / 100; // already in meters, but just in case
        let scale = 1;
        if (maxDim > 20) {
          scale = 20 / maxDim;
          boundaries = boundaries.map(boundary => boundary.map(([x, y]) => [x * scale, y * scale]));
        }
      }
      setDxfPolylines(boundaries);
      // --- Instead of adding to spaces, let user review and choose type ---
      setPendingImportedShapes(
        boundaries.map((boundary, idx) => ({
          boundary,
          name: `DXF Shape ${idx + 1}`,
          height: 3,
          isCore: false
        }))
      );
      // Camera fit as before
      if (boundaries.length > 0) {
        let minX = Infinity, minY = Infinity, minZ = 0;
        let maxX = -Infinity, maxY = -Infinity, maxZ = 0;
        boundaries.forEach(b => b.forEach(([x, y]) => {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }));
        setTimeout(() => {
          fitCameraToBounds({ min: [minX, minY, minZ], max: [maxX, maxY, maxZ] });
        }, 200);
      }
      // Do not add to spaces yet!
      // alert(`${boundaries.length} polylines imported as new shapes.`);
    } catch (err) {
      alert('Failed to import polylines: ' + err.message);
    }
    setDxfLoading(false);
  };

  // --- Add All pending imported shapes to spaces ---
  const handleAddAllImportedShapes = () => {
    pendingImportedShapes.forEach(shape => {
      onAddSpace && onAddSpace({
        name: shape.name,
        boundary: shape.boundary,
        height: shape.height,
        baseZ: 0,
        isCore: !!shape.isCore
      });
    });
    setPendingImportedShapes([]);
  };

  // --- UI for reviewing imported shapes ---
  const ImportReviewPanel = pendingImportedShapes.length > 0 && (
    <div style={{
      position: 'absolute',
      top: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      padding: 24,
      zIndex: 100,
      minWidth: 340,
      maxWidth: 480
    }}>
      <h3 style={{ marginTop: 0 }}>Review Imported Shapes</h3>
      {pendingImportedShapes.map((shape, idx) => (
        <div key={idx} style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Shape #{idx + 1}</div>
          <label>Name: <input value={shape.name} style={{ marginLeft: 8 }} onChange={e => {
            const val = e.target.value;
            setPendingImportedShapes(shapes => shapes.map((s, i) => i === idx ? { ...s, name: val } : s));
          }} /></label>
          <label style={{ marginLeft: 16 }}>Height: <input type="number" min="0.1" step="0.1" value={shape.height} style={{ width: 60, marginLeft: 4 }} onChange={e => {
            const val = parseFloat(e.target.value);
            setPendingImportedShapes(shapes => shapes.map((s, i) => i === idx ? { ...s, height: val } : s));
          }} /> m</label>
          <label style={{ marginLeft: 16 }}>Type:
            <select value={shape.isCore ? 'core' : 'volume'} style={{ marginLeft: 6 }} onChange={e => {
              setPendingImportedShapes(shapes => shapes.map((s, i) => i === idx ? { ...s, isCore: e.target.value === 'core' } : s));
            }}>
              <option value="volume">Volume</option>
              <option value="core">Core</option>
            </select>
          </label>
        </div>
      ))}
      <button onClick={handleAddAllImportedShapes} style={{ marginTop: 8, padding: '8px 18px', borderRadius: 6, background: '#3182ce', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Add All</button>
    </div>
  );

  return (
    <>
      {ImportReviewPanel}
      {/* --- DXF Import Panel (modern card style, top left) --- */}
      <div className="dxf-import-panel" style={{
        position: 'absolute',
        top: 24,
        left: 24,
        background: '#f4f7fa',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: 16,
        maxWidth: 420,
        zIndex: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <h3 style={{ margin: 0, marginBottom: 8, fontWeight: 600 }}>Import DXF Polylines</h3>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: 500 }}>DXF File:</label>
          <input type="file" accept=".dxf" onChange={handleDxfFileChange} disabled={dxfLoading} style={{ marginLeft: 8 }} />
          {dxfFile && <span style={{ marginLeft: 8, fontSize: 13, color: '#555' }}>{dxfFile.name}</span>}
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: 500 }}>Layer:</label>
          <select value={dxfSelectedLayer} onChange={handleDxfLayerSelect} disabled={dxfLoading || !dxfLayers.length} style={{ marginLeft: 8 }}>
            <option value="">Select Layer</option>
            {dxfLayers.map(layer => <option key={layer} value={layer}>{layer}</option>)}
          </select>
        </div>
        <button
          onClick={handleDxfImportPolylines}
          disabled={dxfLoading || !dxfFile || !dxfSelectedLayer}
          style={{
            padding: '8px 18px',
            borderRadius: 6,
            background: dxfFile && dxfSelectedLayer ? '#3182ce' : '#e2e8f0',
            color: dxfFile && dxfSelectedLayer ? 'white' : '#222',
            border: 'none',
            fontWeight: 600,
            cursor: dxfFile && dxfSelectedLayer ? 'pointer' : 'not-allowed'
          }}
        >
          Import Polylines
        </button>
        {dxfLoading && <span style={{ marginLeft: 16, color: '#805ad5' }}>Loading...</span>}
        <div style={{ fontSize: 12, color: '#666', marginTop: 10 }}>
          DXF units are assumed to be <b>centimeters</b> and will be auto-centered and scaled to fit the view.
        </div>
      </div>
      {/* --- End DXF Import Panel --- */}
      <div className="bottom-bar-panel">
        {/* Snap to Grid Toggle */}
        <button style={{ marginRight: 12, padding: '10px 18px', background: snapToGrid ? '#3182ce' : '#e2e8f0', color: snapToGrid ? 'white' : '#222', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 16 }} onClick={() => setSnapToGrid(v => !v)}>
          {snapToGrid ? `Snap: ${gridSnapSize} m` : 'Snap: OFF'}
        </button>
        {/* Level Height Input */}
        <label style={{ fontWeight: 500, marginRight: 8 }}>Level Height (m):</label>
        <input type="number" min="0.1" step="0.1" value={levelInterval} onChange={e => setLevelInterval(Number(e.target.value))} style={{ width: 60, marginRight: 16 }} />
        {/* Show Levels Toggle */}
        <label style={{ marginRight: 16 }}>
          <input type="checkbox" checked={showLevels} onChange={e => setShowLevels(e.target.checked)} style={{ marginRight: 4 }} /> Show Levels
        </label>
        {/* Split at Level Button */}
        <button onClick={handleSplitAllLevels} disabled={selected.shapeIdx === null || selectMode !== 'volume'} style={{ marginRight: 16, padding: '8px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: selected.shapeIdx !== null && selectMode === 'volume' ? '#805ad5' : '#e2e8f0', color: selected.shapeIdx !== null && selectMode === 'volume' ? 'white' : '#222', fontWeight: 600, cursor: selected.shapeIdx !== null && selectMode === 'volume' ? 'pointer' : 'not-allowed' }}>
          Split at Level
        </button>
        {/* Extrude Up/Down Buttons (top face or any face) */}
        <button
          className={`extrude-btn${selected.shapeIdx !== null && (selected.faceIdx === null || selected.faceIdx < 2) ? ' active' : ''}`}
          onClick={() => {
            if (selected.shapeIdx !== null && (selected.faceIdx === 0 || selected.faceIdx === 1)) {
              // Prompt for direct height entry if top or bottom face is selected
              const currentHeight = spaces[selected.shapeIdx]?.height || 1;
              const val = window.prompt('Enter new height (meters):', currentHeight);
              const newHeight = parseFloat(val);
              if (!isNaN(newHeight) && newHeight > 0) {
                handlePushPull(newHeight);
              }
            } else {
              handlePushPull(Math.max(0.1, (spaces[selected.shapeIdx]?.height || 1) + 1));
            }
          }}
          disabled={selected.shapeIdx === null}
        >▲</button>
        <button
          className={`extrude-btn${selected.shapeIdx !== null && (selected.faceIdx === null || selected.faceIdx < 2) ? ' active' : ''}`}
          onClick={() => {
            if (selected.shapeIdx !== null && (selected.faceIdx === 0 || selected.faceIdx === 1)) {
              // Prompt for direct height entry if top or bottom face is selected
              const currentHeight = spaces[selected.shapeIdx]?.height || 1;
              const val = window.prompt('Enter new height (meters):', currentHeight);
              const newHeight = parseFloat(val);
              if (!isNaN(newHeight) && newHeight > 0) {
                handlePushPull(newHeight);
              }
            } else {
              handlePushPull(Math.max(0.1, (spaces[selected.shapeIdx]?.height || 1) - 1));
            }
          }}
          disabled={selected.shapeIdx === null}
        >▼</button>
        {/* Extrude Side Buttons (side face) */}
        <button className={`extrude-btn${selected.shapeIdx !== null && selected.faceIdx != null && selected.faceIdx >= 2 ? ' active' : ''}`} onClick={() => handleExtrudeSide(0.5)} disabled={selected.shapeIdx === null || selected.faceIdx == null || selected.faceIdx < 2}>▲ Side</button>
        <button className={`extrude-btn${selected.shapeIdx !== null && selected.faceIdx != null && selected.faceIdx >= 2 ? ' active' : ''}`} onClick={() => handleExtrudeSide(-0.5)} disabled={selected.shapeIdx === null || selected.faceIdx == null || selected.faceIdx < 2}>▼ Side</button>
        {/* Selector Toggle */}
        <button onClick={() => setActiveTool && setActiveTool('select')} style={{ marginRight: 8, padding: '8px 18px', borderRadius: 6, border: '1px solid #e2e8f0', background: selectMode === 'volume' ? '#3182ce' : '#e2e8f0', color: selectMode === 'volume' ? 'white' : '#222', fontWeight: 600 }}>Volume Select</button>
        <button onClick={() => setActiveTool && setActiveTool(null)} style={{ marginRight: 16, padding: '8px 18px', borderRadius: 6, border: '1px solid #e2e8f0', background: selectMode === 'face' ? '#3182ce' : '#e2e8f0', color: selectMode === 'face' ? 'white' : '#222', fontWeight: 600 }}>Face Select</button>
      </div>
        <Canvas
          ref={canvasRef}
          camera={{ position: [20, 20, 20], up: [0, 0, 1], fov: 75, near: 0.1, far: 1000 }}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
          shadows
          onPointerMissed={handleDeselect}
        >
          <CameraContextBridge onUpdate={setFiberContext} />
          {/* --- Modern Lighting and Environment --- */}
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[10, 10, 20]}
            intensity={1.1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0005}
          />
          <StaticGrid size={gridSize} divisions={50} colorCenterLine={'#666'} colorGrid={'#b0b0b0'} />
          {/* --- Vertex Handles for Selected Shape --- */}
          {VertexHandles}
          {/* --- DXF Polylines as lines --- */}
          {dxfPolylines && dxfPolylines.length > 0 && (
            <group>
              {dxfPolylines.map((boundary, idx) => {
                if (boundary.length < 2) return null;
                // Check if closed (first and last point are the same)
                const isClosed =
                  boundary.length > 2 &&
                  boundary[0][0] === boundary[boundary.length - 1][0] &&
                  boundary[0][1] === boundary[boundary.length - 1][1];
                const points = boundary.map(([x, y]) => new THREE.Vector3(x, y, 0.05)); // z=0.05 for visibility
                return isClosed ? (
                  <lineLoop key={idx}>
                    <bufferGeometry>
                      <bufferAttribute attachObject={['attributes', 'position']} count={points.length} array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))} itemSize={3} />
                    </bufferGeometry>
                    <lineBasicMaterial color="#FFD600" linewidth={2} />
                  </lineLoop>
                ) : (
                  <line key={idx}>
                    <bufferGeometry>
                      <bufferAttribute attachObject={['attributes', 'position']} count={points.length} array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))} itemSize={3} />
                    </bufferGeometry>
                    <lineBasicMaterial color="#FFD600" linewidth={2} />
                  </line>
                );
              })}
            </group>
          )}
          <mesh position={[0, 0, 2]}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="red" />
          </mesh>
          {planImage && <PlanImagePlane imageUrl={planImage} scale={pdfScale} offset={pdfOffset} />}
          {calibrateMode && <CalibratePDFHelper />}
        {drawPolygonMode && <InteractivePolygonDraw onComplete={handlePolygonComplete} planImage={planImage} pdfScale={pdfScale} pdfOffset={pdfOffset} snapToGrid={snapToGrid} gridSnapSize={gridSnapSize} />}
          {drawRectangleMode && <InteractiveDraw onComplete={handleComplete} planImage={planImage} pdfScale={pdfScale} pdfOffset={pdfOffset} snapToGrid={snapToGrid} gridSnapSize={gridSnapSize} />}
        {drawCoreMode && <InteractiveDraw onComplete={handleCoreComplete} planImage={planImage} pdfScale={pdfScale} pdfOffset={pdfOffset} snapToGrid={snapToGrid} gridSnapSize={gridSnapSize} />}
        {/* Render main volumes with boolean subtraction, but keep ExtrudedShape for selected volume */}
        {mainVolumes.map((space, idx) => {
          // If selected, render as interactive ExtrudedShape
          const globalIdx = spaces.findIndex(s => s === space);
          // --- Use spaceType color if set ---
          const color = SPACE_TYPE_COLORS[space.spaceType || 'Unspecified'] || VOLUME_COLORS[globalIdx % VOLUME_COLORS.length];
          if (selected.shapeIdx === globalIdx) {
            return (
              <ExtrudedShape
                key={globalIdx}
                boundary={space.boundary}
                height={space.height || 1}
                onFaceSelect={selectMode === 'face' ? (faceIndex, mesh, geometry) => handleFaceSelect(faceIndex, mesh, geometry, globalIdx) : undefined}
                selectedFace={selectMode === 'face' && selected.shapeIdx === globalIdx ? selected.faceIdx : null}
                onPushPull={handlePushPull}
                hoveredFace={hovered.shapeIdx === globalIdx ? hovered.faceIdx : null}
                setHoveredFace={(faceIdx) => setHovered({ shapeIdx: globalIdx, faceIdx })}
                controls={controls}
                position={[0, 0, space.baseZ || 0]}
                color={color}
                {...(selectMode === 'volume' ? {
                  onVolumeSelect: (e) => handleVolumeSelect(globalIdx, e),
                  isVolumeSelected: multiSelected.includes(globalIdx)
                } : {})}
              />
            );
          }
          // Otherwise, render as CSG mesh with core subtraction
          const mesh = subtractCoresFromVolume(space, coreVolumes);
          // --- Set mesh material color to match spaceType ---
          if (mesh && mesh.material) {
            mesh.material.color = new THREE.Color(color);
          }
          return (
            <primitive
              key={globalIdx}
              object={mesh}
              position={[0, 0, space.baseZ || 0]}
              onClick={selectMode === 'volume' ? (e) => handleVolumeSelect(globalIdx, e) : undefined}
              // Optionally add hover/selection visuals here
            />
          );
        })}
        <GizmoHelper alignment="top-right" margin={[80, 80]} controls={controls}>
          <GizmoViewcube faces={['+Z', '-Z', '+Y', '-Y', '+X', '-X']} />
          </GizmoHelper>
          <OrbitControls ref={controls} target={[0, 0, 0]} enablePan={true} enableRotate={true} enableZoom={true} enableDamping={true} dampingFactor={0.15} />
          <mesh position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[gridSize, gridSize]} />
            <meshStandardMaterial color="#f4f7fa" opacity={0.2} transparent />
          </mesh>
        </Canvas>
    </>
  );
} 