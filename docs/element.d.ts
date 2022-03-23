export declare class OUIPanelsetElement extends HTMLElement {
    #private;
    get affordance(): "disclosure" | "tabset" | "content";
    set affordance(value: "disclosure" | "tabset" | "content");
    getActivePanels(): {
        label: HTMLHeadingElement;
        contents: (Element | Text)[];
    }[];
}
