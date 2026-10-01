// Entrada de la función de Vercel. Todo lo que está en api/ se despliega como
// función Node, sin depender de que Vercel detecte el Express (con el preset
// "Express" el build fallaba: "Cannot read properties of undefined (reading
// 'fsPath')"). vercel.json reescribe todas las rutas hacia aquí, y Express
// sigue viendo la ruta original en req.url. En local se arranca src/app.js.
export { default } from '../src/app.js';
