// Lookup tables for the territorial decision engine
// Source: BD/diccionario_uso_suelo_bj.csv, diccionario_giros_demo.csv,
//         reglas_decision_demo.csv, salidas_app_demo.csv

export const GIROS_DEMO = [
  {
    giro_usuario: 'Cafetería',
    giro_normalizado: 'CAFETERIA',
    familia: 'Alimentos y bebidas sin alcohol',
    riesgo: 'BAJO',
    comentario: 'Puede ser caso útil para bajo impacto, sujeto a uso de suelo y requisitos sanitarios básicos.',
    icono: '☕',
  },
  {
    giro_usuario: 'Restaurante',
    giro_normalizado: 'RESTAURANTE',
    familia: 'Alimentos preparados',
    riesgo: 'MEDIO',
    comentario: 'Requiere revisar uso de suelo, aviso o permiso aplicable, protección civil y requisitos sanitarios.',
    icono: '🍽',
  },
  {
    giro_usuario: 'Gimnasio',
    giro_normalizado: 'GIMNASIO',
    familia: 'Servicios deportivos',
    riesgo: 'MEDIO',
    comentario: 'Requiere revisar compatibilidad de uso de suelo, aforo, protección civil y condiciones del inmueble.',
    icono: '🏋',
  },
  {
    giro_usuario: 'Tienda',
    giro_normalizado: 'TIENDA',
    familia: 'Comercio de proximidad',
    riesgo: 'BAJO',
    comentario: 'Puede ser caso útil para bajo impacto, sujeto al giro específico y uso de suelo.',
    icono: '🛍',
  },
  {
    giro_usuario: 'Consultorio',
    giro_normalizado: 'CONSULTORIO',
    familia: 'Servicios profesionales o salud',
    riesgo: 'MEDIO',
    comentario: 'Puede cambiar mucho si es consultorio médico, dental, psicológico u otro. Requiere precisión.',
    icono: '🩺',
  },
  {
    giro_usuario: 'Bar',
    giro_normalizado: 'BAR',
    familia: 'Bebidas alcohólicas',
    riesgo: 'ALTO',
    comentario: 'No usar como caso simple. Requiere revisión especial por alcohol, horario, impacto y permisos.',
    icono: '🍺',
  },
];

// Keys are lowercase-normalized uso_descri for fuzzy matching
export const DICT_USO_SUELO = {
  'habitacional': {
    semaforo: 'AMARILLO',
    mensaje: 'Parece ser vivienda. Antes de pensar en negocio, hay que verificar uso de suelo.',
  },
  'habitacional con comercio': {
    semaforo: 'VERDE',
    mensaje: 'Puede ser buen candidato para comercio de bajo impacto, sujeto a verificación oficial.',
  },
  'habitacional con comercio (en planta baja)': {
    semaforo: 'VERDE',
    mensaje: 'Puede ser buen candidato para comercio de bajo impacto en planta baja, sujeto a verificación oficial.',
  },
  'habitacional con comercio en p.b.': {
    semaforo: 'VERDE',
    mensaje: 'Puede ser buen candidato para comercio de bajo impacto en planta baja, sujeto a verificación oficial.',
  },
  'habitacional mixto': {
    semaforo: 'VERDE',
    mensaje: 'Puede ser buen candidato para actividad económica, sujeto a verificar el giro.',
  },
  'habitacional y oficinas (con comercio en planta baja)': {
    semaforo: 'VERDE',
    mensaje: 'Puede servir si el negocio está en planta baja, sujeto a verificación oficial.',
  },
  'habitacional con servicios': {
    semaforo: 'AMARILLO',
    mensaje: 'Puede servir para algunos servicios, pero hay que verificar el giro específico.',
  },
  'habitacional con oficinas': {
    semaforo: 'AMARILLO',
    mensaje: 'Uso orientado a oficinas. Verificar si el giro comercial es compatible antes de avanzar.',
  },
  'centro de barrio': {
    semaforo: 'VERDE',
    mensaje: 'Parece compatible con comercio o servicios de proximidad, sujeto a verificación oficial.',
  },
  'equipamiento': {
    semaforo: 'ROJO',
    mensaje: 'No conviene asumir que sirve para un negocio ordinario. Requiere revisión especializada.',
  },
  'equipamiento para servicios educativos (en planta baja para educacion y cultura)': {
    semaforo: 'ROJO',
    mensaje: 'Parece destinado a educación o cultura. No usar como caso comercial genérico.',
  },
  'equipamiento (para salud, cultura y deporte)': {
    semaforo: 'ROJO',
    mensaje: 'Parece destinado a salud, cultura o deporte. Requiere revisión específica.',
  },
  'espacios abiertos': {
    semaforo: 'ROJO',
    mensaje: 'No usar como caso de establecimiento mercantil ordinario.',
  },
  'espacios abiertos (parques, jardines y deportivos)': {
    semaforo: 'ROJO',
    mensaje: 'No usar como caso comercial ordinario.',
  },
  'estacionamientos existentes sujetos a norma particular': {
    semaforo: 'AMARILLO',
    mensaje: 'Tiene norma particular. Hay que revisar antes de decidir.',
  },
};

// Key: "SEMAFORO_RIESGO"
export const REGLAS_DECISION = {
  'VERDE_BAJO': {
    decision: 'AVANZAR',
    mensaje: 'El giro parece compatible de forma orientativa con el uso de suelo registrado. Debe verificarse con certificado SEDUVI vigente.',
    accion: 'Pasar al árbol de trámites.',
  },
  'VERDE_MEDIO': {
    decision: 'AVANZAR_CON_REVISION',
    mensaje: 'El predio parece viable de forma orientativa, pero el giro requiere revisión adicional por requisitos sanitarios, protección civil, aforo u operación.',
    accion: 'Pasar al árbol de trámites con advertencias.',
  },
  'VERDE_ALTO': {
    decision: 'REVISION_ESPECIAL',
    mensaje: 'Aunque el uso de suelo parece favorable, el giro tiene riesgo regulatorio alto. No debe tratarse como trámite simple.',
    accion: 'Pedir revisión especializada antes de avanzar.',
  },
  'AMARILLO_BAJO': {
    decision: 'VERIFICAR_PRIMERO',
    mensaje: 'El giro podría ser de bajo impacto, pero el uso de suelo no permite asumir compatibilidad.',
    accion: 'Solicitar verificación SEDUVI antes del árbol de trámites.',
  },
  'AMARILLO_MEDIO': {
    decision: 'VERIFICAR_PRIMERO',
    mensaje: 'El giro y el predio requieren verificación previa. No conviene avanzar automáticamente.',
    accion: 'Detener avance y pedir certificado o revisión.',
  },
  'AMARILLO_ALTO': {
    decision: 'REVISION_ESPECIAL',
    mensaje: 'El predio requiere verificación y el giro tiene riesgo alto.',
    accion: 'Recomendar asesoría especializada.',
  },
  'ROJO_BAJO': {
    decision: 'NO_AVANZAR',
    mensaje: 'El predio no debe usarse como caso comercial ordinario sin revisión específica.',
    accion: 'No pasar al árbol de trámites.',
  },
  'ROJO_MEDIO': {
    decision: 'NO_AVANZAR',
    mensaje: 'El predio y el giro requieren revisión especializada antes de cualquier trámite.',
    accion: 'No pasar al árbol de trámites.',
  },
  'ROJO_ALTO': {
    decision: 'NO_AVANZAR',
    mensaje: 'El giro es regulatoriamente sensible y el predio no parece adecuado para avanzar de forma automática.',
    accion: 'No pasar al árbol de trámites.',
  },
};

export const SALIDAS_APP = {
  AVANZAR: {
    pantalla: 'El predio parece viable de forma orientativa. Puedes continuar con la identificación de trámites.',
    boton: 'Continuar al árbol de trámites',
    modulo: 'arbol_tramites',
    color: 'verde',
  },
  AVANZAR_CON_REVISION: {
    pantalla: 'El predio parece viable, pero el giro requiere revisión adicional antes de decidir trámites.',
    boton: 'Continuar con advertencias',
    modulo: 'arbol_tramites_con_alertas',
    color: 'amarillo-verde',
  },
  VERIFICAR_PRIMERO: {
    pantalla: 'Antes de avanzar, verifica el uso de suelo con certificado SEDUVI vigente.',
    boton: 'Ver qué debo verificar',
    modulo: 'modulo_verificacion',
    color: 'amarillo',
  },
  REVISION_ESPECIAL: {
    pantalla: 'Este caso requiere revisión especializada por el tipo de giro o por las condiciones del predio.',
    boton: 'Solicitar revisión especializada',
    modulo: 'modulo_revision_especial',
    color: 'naranja',
  },
  NO_AVANZAR: {
    pantalla: 'No conviene avanzar automáticamente con este predio y giro. Se requiere revisión previa.',
    boton: 'Entender el motivo',
    modulo: 'modulo_explicacion',
    color: 'rojo',
  },
};
