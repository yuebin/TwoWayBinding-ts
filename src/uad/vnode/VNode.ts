import { UID, IDirective, EventAgent, Component, DirectiveManager, PROT_STATE_METADATA} from '../index';
import { EventType } from '../core/events/EventAgent';
import { Util } from '../utils/Util';


const VNOD_ID_KEY = "data-vnode-id";

class VNode{
    
    
    public id:string;
    public name:string;
    public tag:string;
    public attrs: Array<any>;
    public directives: Array<any>;
    public template:string;
    public children:Array<VNode>;
    public events:Array<any>;
    public _token:Array<any>;
    public txt:string;
    private el:HTMLElement;
    private parentComponent:Component;
    private _value: any;
    private _oldValue:any;
    private startIndex:number;
    private endIndex:number;
    private isActive:boolean;

    constructor(parentComponent:Component){
        this.id = `_$_vnod_${UID.getId()}`;
        this._token = new Array<any>();
        this.children = new Array<any>();
        this.attrs = new Array<any>();
        this.directives = new Array<any>();
        this.events = new Array<any>();
        this.parentComponent = parentComponent;
        this.isActive = false;
        this._oldValue = "";
    }

    set token(newValue:Array<any>){
        this._token = newValue;
    }

    set value(newValue:any){
        this._value = newValue;

        //值有变化，执行此VNode对的表达式，更新数据
        this.execPression(newValue);
        
        this.saveVNodeState();
        this.parentComponent.mounte();
        this._oldValue = this._value;
    }

    get value():any{
        return this._value;
    }

    public saveVNodeState():void{
        if (document.activeElement.getAttribute(VNOD_ID_KEY) === this.id){
            this.isActive = true;
            this.startIndex = (this.el as any).selectionStart;
            this.endIndex = (this.el as any).selectionEnd;
            return ;
        }else if(!Util.isEmpty(this.children)){
            this.children.forEach((childrenVNode:VNode)=>{
                childrenVNode.saveVNodeState();
            });
        }
    }

    private execPression(newValue:string):void{
        //1，执行属性求值表达式
        //2, 执行指令表达
        if(!Util.isEmpty(this.directives)){
            this.directives.forEach((directive:any) => {
                let expression = directive.value.value;
                if (expression){
                    this.parentComponent.updateModule(newValue, expression);
                }
            });
        }
    }

    public resetVNodeState():void{
        if(this.isActive){
            this.el.focus();
            (this.el as any).setSelectionRange(this.startIndex,this.endIndex);
            this.isActive = false;
            return ;
        } else if (!Util.isEmpty(this.children)) {
            this.children.forEach((childrenVNode: VNode) => {
                childrenVNode.resetVNodeState();
            });
        }
    }


    public appendChild(vNode: VNode): any {
        this.children.push(vNode);
    }

    public getElement(): HTMLElement {
        return document.createElement(this.tag);
    }

    public _parse(_component: Component): void{
        let attr:any = {};
        let attrFlag = false;
        let attrValueFlag = false;

        for(let i = 0; i < this._token.length;i++){
            let token = this._token[i];
            
            if (token.type === "event"){
                let exporess = Object.create(null);
                exporess.key = token;
                exporess.value = this._token[i + 3];
                this.events.push(exporess);
            }
            if (token.directive){
                let exporess = Object.create(null);
                exporess.key = token;
                exporess.value = this._token[i + 3];
                this.directives.push(exporess);
            }
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
        }

        if (this.children && this.children.length > 0) {
            this.children.forEach((vnode: VNode) => {
                vnode._parse(_component);
            });
        }
    }


    public init(_component: Component): any {
        this.directives.forEach((directExproess:any)=>{
            _component.addDirective(this,directExproess)
        });

        this.events.forEach((eventExpress)=>{
            _component.addEvent(this,eventExpress);
        });

        if(!Util.isEmpty(this.children)){
            this.children.forEach((childVNode:VNode)=>{
                childVNode.init(_component);
            });
        }

    }

    public parse(){
        this._parse(this.parentComponent);
    }

    public render(): HTMLElement {
        this.el = this.buildElement(this);
        if (!Util.isEmpty(this.children)) {
            if (this.children) {
                this.children.forEach((childVnode: VNode) => {
                    this.el.appendChild(childVnode.render());
                });
            }
        }
        return this.el;
    }


    buildElement(vNode: VNode): HTMLElement {
        let el = vNode.getElement();//document.createElement(this.vnode.tag);

        vNode.attrs.forEach((attr) => {
            el.setAttribute(attr.name, this.getArrayAttrValue(attr.value))
        });

        el.setAttribute(VNOD_ID_KEY, `${vNode.id}`);
        if (vNode.txt) {
            el.innerText = this.bindData(this);
        }
        if(vNode._value){
            (el as any).value = vNode._value;
        }
        return el;
    }

    bindData(vNode: VNode): string {
        if (vNode.txt) {
            return vNode.txt.replace(/(\{\{([a-z]|[.]|[A-Z]|[$_])+\}\})+/g, (match: string) => {
                let keys = match.replace(/(\{||\})+/g, "");
                let result = "";
                return this.parentComponent.getModuleData(keys);
            });
        } else {
            return "";
        }
    }

    getArrayAttrValue(value: Array<string>): string {
        let result = "";
        if (value && value instanceof Array) {
            value.forEach((attr) => {
                result = result + " " + attr;
            });
        }
        return result;
    }

    getValueByObj(obj: any, key: string): any {
        if (obj && key) {
            let keyPath = key.split(".");
            let tempObj = obj;
            keyPath.forEach((_key) => {
                if (tempObj.hasOwnProperty(_key)) {
                    tempObj = tempObj[_key];
                }
            });
            return tempObj;
        } else {
            return null;
        }
    }


    public addEventListener(eventType: EventType, exporess:Function){
        EventAgent.getEventAgent().addVNodeEvent(eventType,this, exporess,this.parentComponent);
    }

}


export default VNode;
