import * as OBC from "@thatopen/components";
export declare class PlatformComponents extends OBC.Component {
    /**
     * A unique identifier for the component.
     * This UUID is used to register the component within the Components system.
     */
    static readonly uuid: "74c0c370-1af8-4ca9-900a-4a4196c0f2f5";
    enabled: boolean;
    inputs: string[];
    private readonly _requestEventID;
    private readonly _createEventID;
    constructor(components: OBC.Components);
    import(componentSource: string): Promise<OBC.ComponentWithUI>;
}
