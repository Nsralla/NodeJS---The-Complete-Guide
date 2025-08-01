let name = 'max';
let age = 30;
let hobby = 'coding';
let hasHobby = true;

// function summarizeUser(){
//     return 'Name is ' + name
//     +', age  is ' + age
//     +', hobby is ' + hobby
//     +', has hobby: ' + hasHobby;
// }
// const summarizeUser = function() {
//     return 'Name is ' + name
//     + ', age is ' + age
//     + ', hobby is ' + hobby
//     + ', has hobby: ' + hasHobby;
// }; // is named anonymous function

const summarizeUser = (name, age, hobby, hasHobby) => {
    return 'Name is ' + name
    + ', age is ' + age
    + ', hobby is ' + hobby
    + ', has hobby: ' + hasHobby;
}; // is arrow function

const add = (a,b) => a + b; // if there is only one line of code, you can omit the curly braces and the return statement
const add2 = (a,b) => {
    return a+b;
}
const addone = a => a + 1; // if there is only one parameter, you can omit the parentheses
console.log(name);
console.log(age);
console.log(hobby);
console.log(hasHobby);
console.log(summarizeUser(name, age, hobby, hasHobby));