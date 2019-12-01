import { CompoentFactory, ComponentManager } from "../index";

const PROT_STATE_METADATA = "__prot_state_metadata__";
const PROT_METHOD_METADATA = "__prot_method_metadata__";


function component(options: any): Function {

    return function (target: any, name: string, descriptor: any) {
        //1,将options装饰为一个， 对组件镜像装饰处理。
        let component = CompoentFactory.decoratorComponent(target,options);
        
        //2,注册完成，
        ComponentManager.getComponentManager().register(component);

        //3,解析元素模板
        component.parse();

        //4,初始化组件
        component.initComponent(target);
        
        //5,对组件添加watcher
        component.addWatch(target);

        //6,注册事件。
        component.initEvent(target);
        
        //7,初始化生命周期
        component.initLifeCycle();

        return target;
    }
}


function state(options?: any): Function {

    return function (target: any, name: string, descriptor: any) {
        if (!target.constructor.__proto__[PROT_STATE_METADATA]){
            target.constructor.__proto__[PROT_STATE_METADATA] = {};
        }
        target.constructor.__proto__[PROT_STATE_METADATA][name] = { type: 'state', options: options?options:null};
        return target[name];
    }
}

function method(options?: any): Function {

    return function (target: any, name: string, descriptor: any) {
        if (!target.constructor.__proto__[PROT_METHOD_METADATA]) {
            target.constructor.__proto__[PROT_METHOD_METADATA] = {};
        }
        target.constructor.__proto__[PROT_METHOD_METADATA][name] = { type: 'method', options: options ? options : null };
        return target;
    }
}

export {
    component,
    state,
    method,
    PROT_STATE_METADATA,
    PROT_METHOD_METADATA
}