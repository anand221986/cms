const http=require('http');

const server =http.createServer((req,res)=>{
   res.end('Hello from Node.js');
}
)

server.listen(3000, () => console.log('Server running on port 3000'));

//const promise=new Promise((res)))






async function reverseString(inputString='Hello')
{

   let output=inputString.split('')
   console.log(output)


   
}