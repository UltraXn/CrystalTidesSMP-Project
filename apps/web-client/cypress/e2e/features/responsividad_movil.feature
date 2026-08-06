# language: es
Característica: Adaptabilidad y Responsividad en Pantallas Móviles y Tablets

  Escenario: Renderizado correcto del menú hamburguesa en pantalla Móvil (iPhone 14)
    Dado que configuro el tamaño de pantalla a viewport "iphone-xr" (390px x 844px)
    Y navego a la página principal en "/"
    Entonces el menú de navegación superior debe ocultarse en favor del botón de Menú Hamburguesa
    Cuando hago clic en el botón del menú hamburguesa
    Entonces el drawer de navegación móvil debe desplegarse correctamente

  Escenario: Adaptabilidad del layout en pantalla Tablet (iPad)
    Dado que configuro el tamaño de pantalla a viewport "ipad-2" (768px x 1024px)
    Y navego a la página de reglas en "/rules"
    Entonces el contenedor principal debe adaptarse al ancho de pantalla sin desbordamiento horizontal
