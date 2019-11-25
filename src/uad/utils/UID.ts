let id:number = 1;

export default class UID{

    public static getId():number{
        return id++;
    }

}