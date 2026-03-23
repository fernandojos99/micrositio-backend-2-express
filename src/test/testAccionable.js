import {
    //obtenerTodos,
    crear,
    obtenerPorId,
    actualizar,
    eliminar,
    obtenerPorProyecto,
    obtenerPorTestingCard,
    obtenerPorSecuencia,
  } from '../repositories/accionableRepository.js';
  
  async function test() {
  
    try {
  
    // ======================= Creando accionable ================================================

    //   console.log("Creando accionable...");
  
    //   const nuevo = await crear({
    //     contenido: "Optimizar login transformando a JWT",
    //     esfuerzo: 4,
    //     impacto: 6,
    //     // id_accionable = null,
    //     id_learning_card:87,
    //     realizado : false,


    //   });
  
    //   console.log("Creado:", nuevo);
  
  
  //=========================  Consultando todos  =============================================

      // console.log("Consultando todos...");
  
      // const lista = await obtenerTodos();
  
      // console.log(lista);
  
  

    

  //========================= Consultando por id ==============================================
  
      // console.log("Consultando por id...");
  
      // // const uno = await obtenerPorId(nuevo.id);
      // const uno = await obtenerPorId(1);
  
      // console.log(uno);
  
  
  
// ============================ Actualizando ============================================

      // console.log("Actualizando...");
  
      // // const actualizado = await actualizar(nuevo.id, {
      // const actualizado = await actualizar(3, {
      //   esfuerzo: 4,
      //   contenido: "Optimizar login transformando a JWT y refreshtoken2" ,
      // });
  
      // console.log(actualizado);
  
  
// ============================ Eliminando ============================================
  
    //   console.log("Eliminando...");
  
    //   // const eliminado = await eliminar(nuevo.id);
    //   const eliminado = await eliminar(6);
  
    //   console.log(eliminado);
  
  


  //============================ Por Testing Card ============================================

console.log("Accionables por testing card...");

const testing = await obtenerPorTestingCard(465);

console.log(testing);




//============================ Por Secuencia ============================================

console.log("Accionables por secuencia...");

const secuencia = await obtenerPorSecuencia(161);

console.log(secuencia);




//============================ Por Proyecto ============================================

console.log("Accionables por proyecto...");

const proyecto = await obtenerPorProyecto(87);

console.log(proyecto);


     } catch (err) {
       console.error(err);
    }
  }
  
//test();