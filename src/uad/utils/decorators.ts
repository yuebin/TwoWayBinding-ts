import { CompoentFactory, ComponentManager, DirectiveManager, Component } from "../index";

const PROT_STATE_METADATA = "__prot_state_metadata__";
const PROT_METHOD_METADATA = "__prot_method_metadata__";
const PROT_WATCHER_METADATA = "__prot_watcher_metadata__";

const PROT_PARSE_METADATA = "__prot_parse_hook_metadata__";
const PROT_INIT_COMP_METADATA = "__prot_init_comp_hook_metadata__";
const PROT_INIT_EVENT_METADATA = "__prot_init_event_hook_metadata__";
const PROT_MOUNT_METADATA = "__prot_mount_hook_metadata__";

/**
 * 组件注解 作用于 Class
 * @param options 
 */
function component(options: any): Function {

    return async function (target: any, name: string, descriptor: any) {
        //1,将options装饰为一个， 对组件镜像装饰处理。
        let component:Component = CompoentFactory.decoratorComponent(target,options);

        //2，初始化生命周期钩子函数
        component.initLifeCycle();
        
        //2,注册完成，
        ComponentManager.getComponentManager().register(component);

        //3,解析元素模板
        await component.parse();

        //4,初始化组件
        component.initComponent(target);
        
        //5,对组件添加watcher
        component.addWatch(target);

        //6,注册事件。
        component.initEvent(target);
        
        //7,准备挂载
        component.mounte();

        return target;
    }
}

/**
 * 数据模型注解 作用于属性
 * @param options 
 */
function model(options?: any): Function {

    return function (target: any, name: string, descriptor: any) {
        if (!target.constructor.__proto__[PROT_STATE_METADATA]){
            target.constructor.__proto__[PROT_STATE_METADATA] = {};
        }
        target.constructor.__proto__[PROT_STATE_METADATA][name] = { type: 'state', options: options?options:null};
        return target[name];
    }
}

/**
 * 方法注解 作用于函数
 * @param options 
 */
function method(options?: any): Function {
    let methodName = "";
    if (typeof options === 'string') {
        methodName = options;
    } else if (options && options.name) {
        methodName = options.name;
    } else {
        throw new Error("method名称不能为空");
    }
    return function (target: any, name: string, descriptor: any) {
        if (!target.constructor.__proto__[PROT_METHOD_METADATA]) {
            target.constructor.__proto__[PROT_METHOD_METADATA] = {};
        }
        target.constructor.__proto__[PROT_METHOD_METADATA][methodName] = {func:name, type: 'method', options: options ? options : null };
        return target;
    }
}

/**
 * watcher函数的注解 作用于函数
 * @param options 
 */
function watch(options:any):Function{
    let watcherStateName = "";
    if (typeof options === 'string'){
        watcherStateName = options;
    } else if (options && options.name){
        watcherStateName = options.name;
    }else{
        throw new Error("Watcher名称不能为空");
    }
    return function (target: any, name: string, descriptor: any) {
        if (!target.constructor.__proto__[PROT_WATCHER_METADATA]) {
            target.constructor.__proto__[PROT_WATCHER_METADATA] = {};
        }
        target.constructor.__proto__[PROT_WATCHER_METADATA][watcherStateName] = { func:name,type: 'watch', options: options ? options : null };
        return target;
    }
}

/**
 * 指令注解 作用于 Class
 * @param options 
 */
function directive(options?:any):Function{
    let directiveName = "";
    if (typeof options === 'string') {
        directiveName = options;
    } else if (options && options.name) {
        directiveName = options.name;
    } else {
        throw new Error("Watcher名称不能为空");
    }
    return function (target: any, name: string, descriptor: any) {
        DirectiveManager.getDirectiveManager().registerDirective(directiveName,target);
        return target;
    }
}


function buildConstructProp(options:any,type:string,proName:string):Function{
    let methodName = "";
    if (typeof options === 'string') {
        methodName = options;
    } else if (options && options.name) {
        methodName = options.name;
    } else {
        throw new Error("parse名称不能为空");
    }

    return function (target: any, name: string, descriptor: any) {
        if (!target.constructor.__proto__[proName]) {
            target.constructor.__proto__[proName] = [];
        }
        let order = 0;
        if (options && options.order) {
            order = Number.parseInt(options.order);
        }else{
            order = target.constructor.__proto__[proName].length;
        }
        target.constructor.__proto__[proName] = {
            func: name,
            type: type,
            order: order,
            options: options ? options : null
        };
            
        return target;
    }
}

/**
 * parse钩子函数注解，作用于函数
 * @param options 
 */
function parse(options?:any){
    return buildConstructProp(options,'parse',PROT_PARSE_METADATA);
}

/**
 * initComponent钩子函数注解，作用于函数
 * @param options 
 */
function initComponent(options?: any) {
    return buildConstructProp(options, 'init_component', PROT_INIT_COMP_METADATA);
}

/**
 * initEvent 钩子函数注解，作用于函数
 * @param options 
 */
function initEvent(options?: any) {
    return buildConstructProp(options, 'init_event', PROT_INIT_EVENT_METADATA);
}

/**
 * Mounte钩子函数注解，作用于函数
 * @param options 
 */
function mounte(options?: any) {
    return buildConstructProp(options, 'mounte', PROT_MOUNT_METADATA);
}



export {
    component,
    model,
    method,
    watch,
    directive,
    mounte,
    initEvent,
    initComponent,
    parse,
    PROT_STATE_METADATA,
    PROT_METHOD_METADATA,
    PROT_WATCHER_METADATA,
    PROT_PARSE_METADATA,
    PROT_INIT_COMP_METADATA,
    PROT_INIT_EVENT_METADATA,
    PROT_MOUNT_METADATA
}