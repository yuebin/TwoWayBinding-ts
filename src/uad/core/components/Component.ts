import VNode from "../../vnode/VNode";
import { Lexer, PROT_STATE_METADATA, Watcher, PROT_METHOD_METADATA, EventAgent, Message, PROT_WATCHER_METADATA, watch } from "../../index";
import { MessageType } from "../../watcher/Message";


const HTML_TAG_REG = /(<\/?\w+(\s*@?([a-z]|[A-Z]|[0-9]|[-])*=\"?([a-z]|[A-Z]|[-.]|[0-9])*\"?)*>)|(<\w+(\s*@?([a-z]|[A-Z]|[0-9]|[-])*=\"?([a-z]|[A-Z]|[-.]|[0-9])*\"?)*\s*\/?>)/g;
/**
 * 元素5大规范：
 * 1，高内聚: 
 * 2, 独立作用域
 * 3，自定义标签
 * 4, 规范化接口
 * 5，可以相互组合
 */
class Component{
    
    private template:string;
    private templateUrl:string;
    private selector:string;
    private ctor:Function;
    private vnode:VNode;
    private slot:Array<Component>;
    private _name:string;
    private el:HTMLElement;
    private handlder: any = {
        get: function (target: any, key: string, receiver: any) {
            return Reflect.get(target, key, receiver);
        },
        set: function (target: any, key: string, value: any, receiver: any) {
            return Reflect.set(target, key, value, receiver);
        }
    };

    constructor(ctor:Function,options?:any){
        this.ctor = ctor;
        this._name = ctor.name;
        if(options){
            options.template && (this.template = options.template);
            options.templateUrl && (this.templateUrl = options.templateUrl);
            options.el && (this.selector = options.el);
        }
    }


    public parse(template?:string):void{
        
        if (this.template){
            let token:Array<any> = null;
            let index = 0;
            let newTemplate = 
            this.template.replace(HTML_TAG_REG,(match:string,...args:any[])=>{
                let regIndex = args[8];
                let innerText = "";
                let startIndex = regIndex + match.length;
                if (startIndex > (index + 1)){
                    let nextIndex = args[9].substring(regIndex + match.length).search(/<\w+\s*\/?>/g);
                    if (nextIndex > -1){
                        innerText = args[9].substring(startIndex, startIndex + nextIndex);
                        index = startIndex;
                    }
                }
                
                let lexer:Lexer = new Lexer();
                let tempToken: Array<any> = lexer.lex(match);
                if (!token && match){
                    token = tempToken;
                    this.vnode = new VNode()
                    this.vnode.token = token;
                    this.vnode.txt = innerText;
                }else{
                    if(match){
                        let vNode: VNode = new VNode();
                        vNode.token = tempToken;
                        vNode.txt = innerText;
                        if (tempToken && tempToken.length > 0){
                            this.vnode.appendChild(vNode);
                        }
                    }
                }
                return "";
            });
        }
    }

    public getVNode(): VNode {
        return this.vnode;
    }

    /**
     * 初始化组件，
     * 实例化控制器
     */
    initComponent(target:any): any {
        this.ctor = new target();
        this.initVNode(this);
        this.initState(target);
    }

    private initVNode(_component:Component):void{
        this.vnode.init(_component);
    }

    private initState(target:any):void{
        if (target && target.__proto__ && target.__proto__[PROT_STATE_METADATA]) {
            for (let p in target.__proto__[PROT_STATE_METADATA]) {
                if ((this.ctor as any)[p]) {
                    (this.ctor as any)[p] = new Proxy((this.ctor as any)[p], Watcher.getWatcher().getWatcherHandler(this,p));
                } else {
                    (this.ctor as any)[p] = new Proxy((this.ctor as any)[p], Watcher.getWatcher().getWatcherHandler(this,p));
                }
            }
        }
    }

    public dispatcherEvent(express:any,event:Event):void{
        let methodName = express.value.value;
        let options = (this.ctor as any).__proto__.constructor.__proto__[PROT_METHOD_METADATA][methodName];
        if (options && options.func) {
            (this.ctor as any).__proto__[options.func].apply(this.ctor, [event]);
        }
    }

    /**
     * 初始化生命周期
     */
    initLifeCycle(): any {
        this.render();
    }


    bindData(vNode:VNode):string{
        if(vNode.txt){
             return vNode.txt.replace(/(\{\{([a-z]|[.]|[A-Z]|[$_])+\}\})+/g,(match:string)=>{
                let keys = match.replace(/(\{||\})+/g,"");
                let result = "";
                let state = (this.ctor as any).__proto__.constructor.__proto__[PROT_STATE_METADATA];
                for(let p in state){
                    let keyArray = keys.split(".");
                    keyArray.forEach((key)=>{
                        if(key === p){
                            result = this.getValueByObj((this.ctor as any), keys);
                            if (result) {
                                return result;
                            }
                        }
                    });
                }
                return result;
            });
        }else{
            return "";
        }
    }

    getValueByObj(obj:any,key:string):any{
        if(obj && key){
            let keyPath = key.split(".");
            let tempObj = obj;
            keyPath.forEach((_key)=>{
                if (tempObj.hasOwnProperty(_key)){
                    tempObj = tempObj[_key];
                }
            });
            return tempObj;
        }else{
            return null;
        }
    }

    render(parent?:HTMLElementEventMap):void{
        //this.bindData(this.vnode);
        //this.vnode.render();
        this.el = this.buildElement(this.vnode);
         //调用指令的render方法

        if (this.vnode.children) {
            this.vnode.children.forEach((childVnode:VNode)=>{
                //childVnode.render();
                this.el.appendChild(this.buildElement(childVnode));
                //调用指令的render方法
                 
            });
        }

        this.update();
    }

    buildElement(vNode:VNode):HTMLElement{
        let el = vNode.getElement();//document.createElement(this.vnode.tag);

        vNode.attrs.forEach((attr) => {
            el.setAttribute(attr.name, this.getArrayAttrValue(attr.value))
        });

        el.setAttribute('data-vnode-id', `${vNode.id}`);
        if(vNode.txt){
            
            el.innerText = this.bindData(this.vnode);
        }
        return el;
    }
    

    update():void{
        增加质量的update方法
        if(this.selector){
            document.querySelector(this.selector).innerHTML = "";
            document.querySelector(this.selector).appendChild(this.el);
        }
    }
    
    /**
     * 初始化事件
     */
    initEvent(target?:any): any {
        if (target && target.__proto__ && target.__proto__[PROT_METHOD_METADATA]) {
            for (let p in target.__proto__[PROT_METHOD_METADATA]) {
                let methodName = p;
                let value = target.__proto__[PROT_METHOD_METADATA][p];
                let eventMethodName = value.func;
                if (!eventMethodName){
                    eventMethodName = methodName;
                }
                //this.name eventMethodName
                EventAgent.getEventAgent().addEvent(`${this.name}.${eventMethodName}`,this);
            }
        }
        
        this.vnode._token.forEach((token)=>{

        });
    }




    dispatchEvent(event:Event):void{
        console.error(event);
    }

    /**
     * 新增Watcher
     */
    addWatch(target:any): any {
        
    }

    /**
     * 获取组件名称
     */
    get name():string{
        return this._name;
    }


    getArrayAttrValue(value: Array<string>): string {
        let result = "";
        if (value && value instanceof Array){
            value.forEach((attr)=>{
                result = result + " " + attr;
            });
        }
        return result;
    }



    public execWatcher(message: Message): any {
        if(message.type === MessageType.WATCHER){
            this.execWatcherExpress(message);
            this.render();
        }
    }

    private execWatcherExpress(message: Message):void{
        let stateName = message.message.stateName;
        let stateKey = message.message.changeKey;
        let watcherKey = `${stateName}.${stateKey}`;
        let methodName = (this.ctor as any).__proto__.constructor.__proto__[PROT_WATCHER_METADATA][watcherKey].func;
        (this.ctor as any).__proto__[methodName].apply(this.ctor, [message.message.value]);
        
    }

}

export {
    Component
}
