from fastapi import FastAPI, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import ifcopenshell
import ifcopenshell.api
import ifcopenshell.util.element
import tempfile
import os
from typing import List
from shapely.geometry import Polygon
from ifcopenshell.api.profile import add_arbitrary_profile_with_voids

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SpaceInput(BaseModel):
    name: str
    boundary: List[List[float]]  # List of [x, y] points
    height: float
    baseZ: float = 0.0  # Add baseZ for vertical offset
    isCore: bool = False  # Add isCore to distinguish core spaces

class BuildingInput(BaseModel):
    spaces: List[SpaceInput]

@app.post("/generate-ifc")
def generate_ifc(building: BuildingInput):
    print(building)
    # Create a new IFC file
    ifc = ifcopenshell.file()
    project = ifcopenshell.api.run("root.create_entity", ifc, ifc_class="IfcProject", name="Project")
    site = ifcopenshell.api.run("root.create_entity", ifc, ifc_class="IfcSite", name="Site")
    building_entity = ifcopenshell.api.run("root.create_entity", ifc, ifc_class="IfcBuilding", name="Building")
    storey = ifcopenshell.api.run("root.create_entity", ifc, ifc_class="IfcBuildingStorey", name="Storey 1")
    ifcopenshell.api.run("aggregate.assign_object", ifc, products=[site], relating_object=project)
    ifcopenshell.api.run("aggregate.assign_object", ifc, products=[building_entity], relating_object=site)
    ifcopenshell.api.run("aggregate.assign_object", ifc, products=[storey], relating_object=building_entity)

    # Ensure IfcGeometricRepresentationContext exists
    if not ifc.by_type("IfcGeometricRepresentationContext"):
        ifcopenshell.api.run(
            "context.add_context",
            ifc,
            context_type="Model",
            context_identifier="Body",
            target_view="MODEL_VIEW"
        )

    # Stack spaces from backend, ignore incoming baseZ
    current_baseZ = 0.0
    overlap = 0.001  # or 1e-5 for a very tiny overlap
    # Optionally, use the same boundary for all spaces (uncomment next line)
    # common_boundary = building.spaces[0].boundary if building.spaces else []

    # Separate main spaces and core spaces
    main_spaces = [s for s in building.spaces if not getattr(s, 'isCore', False)]
    core_spaces = [s for s in building.spaces if getattr(s, 'isCore', False)]

    def close_boundary(boundary):
        if boundary[0] != boundary[-1]:
            return boundary + [boundary[0]]
        return boundary

    for space in main_spaces:
        baseZ = space.baseZ
        boundary = space.boundary
        main_boundary = close_boundary(boundary)
        main_poly = Polygon(main_boundary)
        if not main_poly.is_valid:
            main_poly = main_poly.buffer(0)

        # Collect core boundaries that are fully inside this main space and overlap in Z
        void_boundaries = []
        for core in core_spaces:
            # Check Z overlap
            main_base = space.baseZ
            main_top = main_base + space.height
            core_base = core.baseZ
            core_top = core_base + core.height
            overlap_start = max(main_base, core_base)
            overlap_end = min(main_top, core_top)
            overlap_height = overlap_end - overlap_start
            core_boundary = close_boundary(core.boundary)
            core_poly = Polygon(core_boundary)
            if not core_poly.is_valid:
                core_poly = core_poly.buffer(0)
            # Only add as void if fully inside in XY and Z overlap
            if overlap_height > 0 and main_poly.contains(core_poly):
                void_boundaries.append(core_boundary)

        # --- 3D Geometry Creation for main space with voids ---
        # Use add_arbitrary_profile_with_voids to create a profile with holes
        profile_with_voids = add_arbitrary_profile_with_voids(
            ifc,
            outer_profile=main_boundary,
            inner_profiles=void_boundaries,
            name=space.name
        )
        direction = ifc.createIfcDirection([0.0, 0.0, 1.0])
        origin_geom = ifc.createIfcCartesianPoint([0.0, 0.0, baseZ])  # Extrude from baseZ
        axis2placement_geom = ifc.createIfcAxis2Placement3D(origin_geom, None, None)
        solid = ifc.createIfcExtrudedAreaSolid(profile_with_voids, axis2placement_geom, direction, space.height)
        context = ifc.by_type("IfcGeometricRepresentationContext")[0]
        body = ifc.createIfcShapeRepresentation(context, "Body", "SweptSolid", [solid])
        shape = ifc.createIfcProductDefinitionShape(None, None, [body])

        # Create IfcSpace for main space
        space_entity = ifcopenshell.api.run("root.create_entity", ifc, ifc_class="IfcSpace", name=space.name)
        space_entity.LongName = space.name
        space_entity.CompositionType = "ELEMENT"
        ifcopenshell.api.run("aggregate.assign_object", ifc, products=[space_entity], relating_object=storey)
        space_entity.Representation = shape

        # 2. Place the object at the correct Z using IfcLocalPlacement
        origin_placement = ifc.createIfcCartesianPoint([0.0, 0.0, 0.0])
        axis2placement_placement = ifc.createIfcAxis2Placement3D(origin_placement, None, None)
        placement = ifc.createIfcLocalPlacement(None, axis2placement_placement)
        space_entity.ObjectPlacement = placement

        current_baseZ += space.height - overlap  # Stack next one on top

    # Save to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".ifc") as tmp:
        ifc.write(tmp.name)
        tmp_path = tmp.name

    # Return the IFC file
    return FileResponse(tmp_path, filename="building.ifc", media_type="application/octet-stream") 