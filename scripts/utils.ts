const findElement = (id: string) =>{
    const element = document.getElementById(id);
    if(element){
        return element;
    }
    throw new Error(`element with name: ${id} not found`);
}

export { findElement }