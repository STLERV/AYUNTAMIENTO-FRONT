export class User {

    
    _id: string;
    name: string;
    id: string;
    pass: string
    

    constructor(
        _id = '',
        name = '',
        id = '',
        pass= '',
       


    ) {

        this._id = _id;
        this.name = name;
        this.id = id;
        this.pass = pass;
        
    }


}
