export declare class OUIPanelsetElement extends HTMLElement {
    #private;
    get affordance(): string;
    set affordance(value: string);
    getActivePanels(): {
        label: HTMLHeadingElement;
        content: (Element | Text)[];
    }[];
}
