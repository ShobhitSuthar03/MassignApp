import * as THREE from "three";
import { Component } from "../core";
export declare class SectionGenerator extends Component {
    /**
     * A unique identifier for the component.
     * This UUID is used to register the component within the Components system.
     */
    static readonly uuid: "1a193b87-6376-46c8-9e65-62a1576fdb64";
    enabled: boolean;
    private _inverseMatrix;
    private _localPlane;
    private _tempLine;
    private _tempVector;
    private _plane?;
    private _plane2DCoordinateSystem;
    private _precission;
    private _planeAxis?;
    get plane(): THREE.Plane;
    set plane(plane: THREE.Plane);
    createEdges(data: {
        meshes: THREE.Mesh[];
        posAttr: THREE.BufferAttribute;
    }): {
        indexes: number[];
        index: number;
    };
    createFills(buffer: Float32Array, trianglesIndices: number[]): number[];
    private computeFill;
    private updatePlane2DCoordinateSystem;
    private shapecast;
}
