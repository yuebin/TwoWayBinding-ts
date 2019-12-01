import { component, state, method } from "./uad/index";


@component({
    el:"#app",
    template:`<div class="container" data-nid="12" @click="sayHello">
        Hello world! {{date}}.
        State data {{state.value}}
        <br/>
        <input type="text" />
    </div>`
})
class App{
    constructor(){}

    @state()
    cData:any ={
        date:new Date().getTime(),
            state:{
                value:"State.Value"
            }
    }


    @method('sayHello')
    sayWord(){
        console.error('Say hello');
        this.cData.date = new Date();
    }
}