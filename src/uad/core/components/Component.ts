import VNode from "../../vnode/VNode";
import { Lexer, PROT_STATE_METADATA, Watcher, PROT_METHOD_METADATA, EventAgent, Message, PROT_WATCHER_METADATA, watch, DirectiveManager, Util, IDirective, EventType } from "../../index";
import { MessageType } from "../../watcher/Message";


const HTML_TAG_REG = /(<\/?\w+(\s*@?([a-z]|[A-Z]|[0-9]|[-])*=\"?([a-z]|[A-Z]|[-.]|[0-9])*\"?)*>)|(<\w+(\s*@?([a-z]|[A-Z]|[0-9]|[-])*=\"?([a-z]|[A-Z]|[-.]|[0-9])*\"?)*\s*\/?>)/g;
const IDENTITY_REG = /([a-z]|[A-Z]|[_$.])*/g;
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
    public ctor:Function;
    private vnode:VNode;
    private slot:Array<Component>;
    private _name:string;
    private el:HTMLElement;
    private directives:Map<VNode,IDirective>;
    private events: Map<VNode, any>;
    private watcher:Watcher;
    private module:any;
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

        this.directives = new Map<VNode, IDirective>();
        this.events = new Map<VNode, any>();
        this.module = Object.create(null);
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
                    this.vnode = new VNode(this)
                    this.vnode.token = token;
                    this.vnode.txt = innerText;
                }else{
                    if(match){
                        let vNode: VNode = new VNode(this);
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

        this.vnode.parse();
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
        this.initDirective();
        this.initEvent();
    }

    initDirective():void{
        //找到对应的指令，执行其bind方法
        // let directive: IDirective = DirectiveManager.getDirectiveManager().findDirective(exporess);
        // directive.init(this.el, this);
        if (!Util.isEmpty(this.directives)){
            for(let key of this.directives.keys()){
                let directive = this.directives.get(key);
                let exporess = (directive as any).__proto__['exproess'];
                let value = this.executeExproess(exporess);
                (directive as any).init(key, {
                    express: exporess,
                    value:value
                });
            }
        }
    }


    private executeExproess(exporess:any):any{
        if (exporess.key.directive){ //如果是指令，后面为求值表达
            let expressStr = exporess.value.value;
            return this.getValueExproess(expressStr);
        }
        return null;
    }

    private getValueExproess(express:string):any{
        if (IDENTITY_REG.test(express)){
            return this.getModuleData(express);
        }
    }

    private initVNode(_component:Component):void{
        this.vnode.init(_component);
    }

    private initState(target:any):void{
        if (target && target.__proto__ && target.__proto__[PROT_STATE_METADATA]) {
            for (let p in target.__proto__[PROT_STATE_METADATA]) {
                if ((this.ctor as any)[p]) {
                    this.module[p] = (this.ctor as any)[p] = new Proxy((this.ctor as any)[p], Watcher.getWatcher().getWatcherHandler(this,p));
                } else {
                    this.module[p] = (this.ctor as any)[p] = new Proxy((this.ctor as any)[p], Watcher.getWatcher().getWatcherHandler(this,p));
                }
            }
        }
    }

    public dispatcherEvent(express:any,event:Event):void{
        if (express instanceof Function){
            express.apply(this.ctor, [event]);
        }else{
            let methodName = express.value.value;
            let options = (this.ctor as any).__proto__.constructor.__proto__[PROT_METHOD_METADATA][methodName];
            if (options && options.func) {
                (this.ctor as any).__proto__[options.func].apply(this.ctor, [event]);
            }
        }
    }


    public getModuleData(express:any):any{
        let result = null;
        if (typeof express === "string" && express.length > 0){
            let keys = express.split(".");
            if (this.module[keys[0]]){
                let tempObject = this.module[keys[0]];
                for(let i = 1; i < keys.length; i++){
                    tempObject = tempObject[keys[i]];
                }
                result = tempObject;
            }
        }
        return result;
    }

    /**
     * 初始化生命周期
     */
    initLifeCycle(): any {
        
    }

    public mounte(): any {
        this.render();
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
        this.el = this.vnode.render();
         //调用指令的render方法
        this.update();
    }


    update():void{
        //增加指令的update方法
        if(this.selector){
            this.vnode.saveVNodeState();
            document.querySelector(this.selector).innerHTML = "";
            document.querySelector(this.selector).appendChild(this.el);
            this.vnode.resetVNodeState();
        }
    }

    
    /**
     * 初始化事件
     */
    initEvent(target?:any): any {

        //1,初始化VM上的注解方法
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

        //2，初始化模板中的事件
        if (!Util.isEmpty(this.events)) {
            for (let key of this.events.keys()) {
                let express = this.events.get(key);
                let methodName = (express as any).value.value;
                EventAgent.getEventAgent().addVNodeEvent((express.key.name as EventType), key, this.getMethod(methodName),this);
            }
        }
        
    }


    public getMethod(methodName:string):Function{
        if ((this.ctor as any).__proto__.hasOwnProperty(methodName)){
            return (this.ctor as any).__proto__[methodName];
        }else{
            //PROT_METHOD_METADATA
            return this.getMetaDataMethod(methodName);
        }
    }

    public getMetaDataMethod(methodName: string): Function{
        let methodAsName = this.getMetaData(PROT_METHOD_METADATA);
        if ((this.ctor as any).__proto__.hasOwnProperty(methodAsName[methodName].func)) {
            return (this.ctor as any).__proto__[methodAsName[methodName].func];
        }
        return null;
    }


    public getMetaData(protMetData:string):any{
        if ((this.ctor as any) 
            && (this.ctor as any).__proto__.constructor.__proto__
            && (this.ctor as any).__proto__.constructor.__proto__.hasOwnProperty(protMetData)){
            return (this.ctor as any).__proto__.constructor.__proto__[protMetData];
        }
        return null;
    }

    public updateModule(newValue: string, expression: any): any {
        if (expression && IDENTITY_REG.test(expression)){ //变量表达式
            let keys = expression.split(".");
            let templateObj = this.module[keys[0]];
            for (let i = 1; i < (keys.length - 1 ); i++){
                templateObj = templateObj[keys[i]];
            }
            templateObj[keys[keys.length - 1]] = newValue;
        }
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
        let propt = (this.ctor as any).__proto__.constructor.__proto__[PROT_WATCHER_METADATA][watcherKey];
        if (propt && propt.func){
            let methodName = propt.func;
            (this.ctor as any).__proto__[methodName].apply(this.ctor, [message.message.value]);
        }
    }


    public addDirective(vnode:VNode,exporess: any): any {
        let directive = DirectiveManager.getDirectiveManager().findDirective(exporess.key.text);
        (directive as any).__proto__['exproess'] = exporess;
        this.directives.set(vnode,directive);
    }

    public addEvent(vnode:VNode,eventExpress: any): any {
        this.events.set(vnode, eventExpress);
    }

}

export {
    Component
}
