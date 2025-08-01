// async: 

setTimeout(()=>{
    console.log("Hello, World!"); // This is printed after the two console logs below
},200);

console.log("This is printed first!");
console.log("This is printed second!");

// the code doesn't block code execution, it just schedules the function to be executed after 2 seconds