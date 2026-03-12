export default class Accionable {

  constructor({
    id_accionable = null,
    id_learning_card,
    contenido,
    impacto,
    esfuerzo,
    realizado = false,
    // created_at = null,
    // updated_at = null
  }) {
    this.id_accionable = id_accionable;
    this.id_learning_card = id_learning_card;
    this.contenido = contenido;
    this.impacto = impacto;
    this.esfuerzo = esfuerzo;
    this.realizado = realizado;
    // this.created_at = created_at;
    // this.updated_at = updated_at;
  }

  
  fromRow() {
    return new Accionable({
      id_accionable: this.id_accionable,
      id_learning_card: this.id_learning_card,
      contenido: this.contenido,
      impacto: this.impacto,
      esfuerzo: this.esfuerzo,
      realizado: this.realizado,
      // created_at: this.created_at,
      // updated_at: this.updated_at
    });
  }

}