const person = {
    name: "nsr",
    age:30,
    hobby: "coding",
    hasHobby: true,
    greet: () => console.log("Hi, I am " + person.name)
}



const printName = ({name}) =>{
    console.log("Name is " + name);
}
//  or
// const printName = (person) => {
//     console.log("Name is " + person.name);
// }



// printName(person);

// const {name, age} = person;
// console.log("Name is " + name);
// console.log("Age is " + age);
hobbies = ['coding', 'reading', 'gaming'];

const [hobby1, hobby2] = hobbies;
console.log("Hobby 1 is " + hobby1);
console.log("Hobby 2 is " + hobby2);