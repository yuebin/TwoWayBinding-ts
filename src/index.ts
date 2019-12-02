import { component, state, method, watch} from "./uad/index";


@component({
    el:"#app",
    template:`<div class="container" data-nid="12" @click="sayHello">
        Hello world! {{state.date}}.
        State data {{state.state.value}}
        Input value : {{state.value}}
        <br />
        <input type="text" u-model="state.value" />
    </div>`
})
class App{
    constructor(){
        setTimeout(() => {
            this.state.date = new Date();
            this.state.state.value = new Date().getTime();
        }, 5000);
    }

    @state()
    state:any = {
        date:new Date().getTime(),
        state:{
            value:"State.Value"
        },
        value:""
    }


    @method('sayHello')
    sayWord(){
        console.error('Say hello');
        this.state.date = new Date();
        
    }

    @watch("state.date")
    dateChange(newValue:any){
        console.error(`dateChange:${newValue}`);
    }
}