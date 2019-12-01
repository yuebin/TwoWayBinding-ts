import { UID, IDirective} from '../index';

class VNode{
    
    
    public id:number;
    public name:string;
    public tag:string;
    public attrs: Array<any>;
    public directives: Array<IDirective>;
    public template:string;
    public children:Array<VNode>;
    public events:Array<any>;
    public _token:Array<any>;
    public txt:string;

    constructor(){
        this.id = UID.getId();
        this._token = new Array<any>();
        this.children = new Array<any>();
        this.attrs = new Array<any>();
    }

    set token(newValue:Array<any>){
        this._token = newValue;
    }

    public appendChild(vNode: VNode): any {
        this.children.push(vNode);
    }

    public getElement(): HTMLElement {
        return document.createElement(this.tag);
    }

    public render(): void{
        let el:HTMLElement = null;
        let attr:any = {};
        let attrFlag = false;
        let attrValueFlag = false;

        for(let i = 0; i < this._token.length;i++){
            let token = this._token[i];
            if (token.type === "tag") {
                this.tag = token.name;
            }
            if (!attrFlag && token.identifier && token.type !== 'quo') {
                attrFlag = true;
                attr.name = token.text;
                attrValueFlag = true;
            }
            if (token.type === 'quo' && token.name === "end"){
                attrFlag = false;
                if (attr && attr.name){
                    this.attrs.push(attr);
                    attr = {};
                }

            }
            if (attrFlag && token.operator && token.text === "=") {
                continue;
            }
            if (token.constant && attrValueFlag){
                if(!attr.value ){
                    attr.value = [];
                }
                attr.value.push(token.value);
            }
            
            if (this.children) {
                this.children.forEach((vnode: VNode) => {
                    vnode.render();
                });
            }
        }
    }
}


export default VNode;