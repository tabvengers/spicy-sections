export declare class OUIPanelsetElement extends HTMLElement {
    #private;
    get affordance(): "disclosure" | "tabset" | "content";
    set affordance(value: "disclosure" | "tabset" | "content");
    getPanels(): {
        open: boolean;
        label: HTMLHeadingElement;
        contents: (Element | Text)[];
    }[];
}
