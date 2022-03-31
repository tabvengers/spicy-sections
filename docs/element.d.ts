export declare class OUIPanelsetElement extends HTMLElement {
    #private;
    get affordance(): "content" | "disclosure" | "tabset";
    set affordance(value: "content" | "disclosure" | "tabset");
    getPanels(): {
        open: boolean;
        label: HTMLHeadingElement;
        contents: (Element | Text)[];
    }[];
}
