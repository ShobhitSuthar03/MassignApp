import React, { useState, useEffect } from "react";
import { Box, Flex, VStack, Heading, Button, Text, HStack, Input } from "@chakra-ui/react";
import ThreeDView from "./components/ThreeDView";
import * as pdfjsLib from "pdfjs-dist";
import axios from 'axios';
import VerticalToolbar from './components/VerticalToolbar';
import './App.css';
import * as THREE from 'three';
import { CSG } from 'three-csg-ts';
// Try to import BufferGeometryUtils if available
let BufferGeometryUtils = null;
try {
  BufferGeometryUtils = require('three/examples/jsm/utils/BufferGeometryUtils');
} catch (e) {}
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// --- Space type color mapping ---
const SPACE_TYPE_COLORS = {
  Unspecified: '#b0b0b0',
  Basement: '#6D6875',
  Residential: '#81B29A',
  Commercial: '#E07A5F',
  Parking: '#FFD166',
  Roof: '#43AA8B',
};

function App() {
  const [spaces, setSpaces] = useState([]);
  const [planImage, setPlanImage] = useState(null); // image URL for imported plan
  const [activeTool, setActiveTool] = useState(null); // LIFTED STATE
  // --- Core visibility state ---
  const [coreVisibility, setCoreVisibility] = useState({}); // { idx: true/false }
  // --- Undo/Redo state ---
  const [history, setHistory] = useState([]); // stack of previous spaces
  const [future, setFuture] = useState([]); // stack of undone spaces

  // PDF import logic
  const handlePdfChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedarray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      const imgUrl = canvas.toDataURL();
      setPlanImage(imgUrl);
    };
    fileReader.readAsArrayBuffer(file);
  };

  // Generate IFC handler
  const handleGenerateIFC = async () => {
    try {
      const spacesToSend = spaces.map(space => ({
        name: space.name,
        boundary: space.boundary,
        height: space.height,
        baseZ: space.baseZ || 0,
        isCore: !!space.isCore // Send isCore property
      }));
      const response = await axios.post(
        'http://localhost:8000/generate-ifc',
        { spaces: spacesToSend },
        { responseType: 'blob' }
      );
      // Download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'building.ifc');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to generate IFC: ' + err.message);
    }
  };

  // Utility: Extract bottom face boundary from a mesh
  function extractBottomFaceBoundary(mesh) {
    const geom = mesh.geometry;
    geom.computeBoundingBox();
    const pos = geom.attributes.position;
    // Adjust all Zs by mesh.position.z
    const zOffset = mesh.position?.z || 0;
    let minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i) + zOffset;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
    // Get all vertices at minZ
    const verts = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i) + zOffset;
      if (Math.abs(z - minZ) < 1e-4) verts.push([x, y]);
    }
    // Order the verts (convex hull for now)
    if (verts.length < 3) return { boundary: [], minZ, maxZ };
    verts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    // Simple convex hull (Graham scan)
    function cross(o, a, b) { return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0]); }
    const lower = [];
    for (const v of verts) {
      while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], v) <= 0) lower.pop();
      lower.push(v);
    }
    const upper = [];
    for (let i = verts.length-1; i >= 0; i--) {
      const v = verts[i];
      while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], v) <= 0) upper.pop();
      upper.push(v);
    }
    upper.pop(); lower.pop();
    return { boundary: lower.concat(upper), minZ, maxZ };
  }

  const handleExportVisibleIFC = async () => {
    // Send both main and core volumes to backend for void support
    const solids = spaces.map(space => ({
      name: space.name,
      boundary: space.boundary,
      height: space.height,
      baseZ: space.baseZ || 0,
      isCore: !!space.isCore
    }));
    // Send to backend
    try {
      const response = await axios.post(
        'http://localhost:8000/generate-ifc',
        { spaces: solids },
        { responseType: 'blob' }
      );
      // Download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'building_visible.ifc');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to generate IFC: ' + err.message);
    }
  };

  // --- Metrics calculation (moved from ThreeDView) ---
  const metrics = React.useMemo(() => {
    // Separate main and core volumes
    const mainVolumes = spaces.filter(space => !space.isCore);
    const coreVolumes = spaces.filter(space => space.isCore);
    let totalGFA = 0;
    let totalLevels = mainVolumes.length;
    let totalHeight = 0;
    let totalBuiltUp = 0;
    const perVolume = spaces.map((space, idx) => {
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
      if (!space.isCore) {
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
      }
      gfa = Math.max(0, gfa);
      area = Math.max(0, area);
      totalGFA += !space.isCore ? gfa : 0;
      totalHeight += !space.isCore ? (space.height || 1) : 0;
      totalBuiltUp += !space.isCore ? area : 0;
      return { idx, gfa, area, height: space.height || 1, name: space.name, isCore: !!space.isCore };
    });
    return {
      totalGFA,
      totalLevels,
      totalHeight,
      totalBuiltUp,
      perVolume
    };
  }, [spaces]);

  // --- Undo/Redo handlers ---
  const handleUndo = () => {
    if (history.length === 0) return;
    setFuture(fut => [spaces, ...fut]);
    setSpaces(history[history.length - 1]);
    setHistory(hist => hist.slice(0, -1));
  };
  const handleRedo = () => {
    if (future.length === 0) return;
    setHistory(hist => [...hist, spaces]);
    setSpaces(future[0]);
    setFuture(fut => fut.slice(1));
  };

  // --- Push to history on spaces change (except undo/redo) ---
  const setSpacesWithHistory = (updater) => {
    setHistory(hist => [...hist, spaces]);
    setFuture([]);
    setSpaces(updater);
  };

  // --- Keyboard shortcuts for undo/redo ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, future, spaces]);

  return (
    <div className="app-root">
      <header className="app-header">
        Volumetric Building Modeler
      </header>
      <div className="app-body">
        <aside className="sidebar-left">
          <VerticalToolbar
            active={activeTool}
            onAction={setActiveTool}
          />
        </aside>
        <main className="main-3dview">
          <ThreeDView
            spaces={spaces}
            onAddSpace={space => setSpacesWithHistory(prev => [...prev, space])}
            onUpdateSpaces={setSpacesWithHistory}
            planImage={planImage}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            coreVisibility={coreVisibility}
          />
        </main>
        <aside className="sidebar-right">
          <div style={{ padding: 18, maxHeight: 'calc(100vh - 56px)', overflowY: 'auto' }}>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Analysis</h3>
            {/* BUILDING SECTION ONLY */}
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: '#805ad5' }}>BUILDING</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Gross Floor Area:</span>
              <span style={{ fontWeight: 700 }}>{metrics.totalGFA.toFixed(2)} m²</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Built-up Area:</span>
              <span style={{ fontWeight: 700 }}>{metrics.totalBuiltUp.toFixed(2)} m²</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Building Height:</span>
              <span style={{ fontWeight: 700 }}>{metrics.totalHeight} m</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Required Green Area:</span>
              <span style={{ fontWeight: 700 }}>{(metrics.totalGFA * 0.24).toFixed(2)} m²</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span>Required Parking Spaces:</span>
              <span style={{ fontWeight: 700 }}>{(metrics.totalGFA / 40).toFixed(2)}</span>
            </div>
            {/* Per Volume List */}
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Per Volume:</div>
            <div style={{ maxHeight: 180, overflowY: 'auto', fontSize: 15 }}>
              {metrics.perVolume.length === 0 && <div style={{ color: '#888' }}>No volumes defined.</div>}
              {metrics.perVolume.map((v, i) => (
                <div key={i} style={{ marginBottom: 6, padding: '6px 0', borderBottom: '1px solid #e2e8f0', color: v.isCore ? '#e03523' : undefined }}>
                  <b>#{i + 1}</b>
                  {v.isCore ? (
                    <>
                      <span style={{ background: '#ffeaea', color: '#e03523', borderRadius: 4, padding: '2px 6px', marginLeft: 4, fontSize: 13 }}>Core</span>
                      {/* --- Editable height input for core --- */}
                      &nbsp; Height:
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={spaces[v.idx]?.height || 1}
                        style={{ width: 50, marginLeft: 4 }}
                        onChange={e => {
                          const newHeight = parseFloat(e.target.value);
                          setSpacesWithHistory(prev => prev.map((space, idx) => idx === v.idx ? { ...space, height: newHeight } : space));
                        }}
                      />
                      m
                      {/* --- Core visibility checkbox --- */}
                      <label style={{ marginLeft: 12, fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={coreVisibility[v.idx] !== false}
                          onChange={e => {
                            setCoreVisibility(prev => ({ ...prev, [v.idx]: e.target.checked }));
                          }}
                          style={{ marginRight: 4 }}
                        />
                        Visible
                      </label>
                      {/* --- Horizontal bar for core --- */}
                      <div style={{ height: 4, background: '#e03523', borderRadius: 2, margin: '8px 0 0 0', opacity: 0.3 }} />
                    </>
                  ) : (
                    <>
                      {/* --- Space type dropdown and color swatch --- */}
                      <label style={{ marginLeft: 8, fontSize: 13, display: 'inline-flex', alignItems: 'center' }}>
                        <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 4, background: SPACE_TYPE_COLORS[spaces[v.idx]?.spaceType || 'Unspecified'], marginRight: 4, border: '1px solid #e2e8f0' }} />
                        Type:
                        <select
                          value={spaces[v.idx]?.spaceType || 'Unspecified'}
                          onChange={e => {
                            const newType = e.target.value;
                            setSpacesWithHistory(prev => prev.map((space, idx) => idx === v.idx ? { ...space, spaceType: newType } : space));
                          }}
                          style={{ marginLeft: 4 }}
                        >
                          <option value="Unspecified">Unspecified</option>
                          <option value="Basement">Basement</option>
                          <option value="Residential">Residential</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Parking">Parking</option>
                          <option value="Roof">Roof</option>
                        </select>
                      </label>
                      &nbsp; Area: {v.area.toFixed(2)} m² &nbsp; Height: {v.height} m &nbsp; GFA: {v.gfa.toFixed(2)} m²
                    </>
                  )}
                </div>
              ))}
            </div>
            <Button onClick={handleExportVisibleIFC} colorScheme="blue" mb={2}>Export IFC (Visible Geometry)</Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;