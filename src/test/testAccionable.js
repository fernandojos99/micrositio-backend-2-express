import {
    obtenerTodos,
    crear,
    obtenerPorId,
    actualizar,
    eliminar,
    obtenerAccionablesPorProyecto,
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
  
  

    // // const accionables =await obtenerAccionablesPorProyecto(idProyecto);
    const accionables =await obtenerAccionablesPorProyecto(80);
    console.log(accionables);

    // const accionables =await obtenerPorTestingCard(3);
    // console.log(accionables);


     } catch (err) {
       console.error(err);
    }
  }
  
  test();