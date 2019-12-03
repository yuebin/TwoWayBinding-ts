class Util{

    static isEmpty(express:any):boolean{
        if (!express){
            return true;
        }
        if(express instanceof Map && express.size === 0){
            return true;
        }
        if (express instanceof Array && express.length === 0){
            return true;
        }

        return false;
    }
}

export {
    Util
}