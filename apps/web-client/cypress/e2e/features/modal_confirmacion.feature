# language: es
Característica: Modal de Confirmación Interactivo (ConfirmationModal)
  Como usuario de CrystalTides SMP
  Quiero ver un modal de confirmación claro y seguro al realizar acciones críticas
  Para evitar cambios no deseados o confirmar operaciones importantes

  Escenario: Visualización y cancelación en Modal de Confirmación Estándar
    Dado que abro un flujo que requiere confirmación modal
    Entonces el modal de confirmación debe desplegarse con los datos correspondientes
    Cuando hago clic en el botón de cancelar en el modal
    Entonces el modal de confirmación debe cerrarse inmediatamente

  Escenario: Confirmación de acción en Modal de Peligro
    Dado que abro un flujo de acción peligrosa en el modal
    Entonces el botón de confirmación debe mostrar un estilo de peligro destacado
    Cuando confirmo la acción en el modal
    Entonces la acción debe ejecutarse y el modal se cierra
