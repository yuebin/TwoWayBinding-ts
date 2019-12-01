import { Component } from "../../index";

class CompoentFactory{

    static decoratorComponent(target:Function,options:any){
        //做兼容，公用方法，属性处理；
        let compoent = new Component(target,options);
        return compoent;
    }

}

export{
    CompoentFactory
}