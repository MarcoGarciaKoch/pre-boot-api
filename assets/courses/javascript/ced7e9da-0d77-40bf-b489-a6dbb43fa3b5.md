# Funciones

Es un elemento de la programación o técnica, que nos ayuda a reutilizar una acción u operación de nuestro código.

Podemos verlo como una plantilla en el código. Son un bloque de instrucciones a los que le doy un alias (nombre) y que cada vez que quiera ejecutar esas instrucciones, simplemente llamo al alias.

**Las funciones deben PODER ejecturarse de manera independiente sin depender de variables de fuera. Se pasa todo por parámetros**

## ¿Cómo se crean funciones?

Hay varias maneras de declararlas. 
- Declarando la función
- Asignadola a una varible
- Función flecha
- Función anónima

```js
function _alias_(_parametro-1_ , _parametro-2_ , ...) {
    /* BLOQUE DE CODIGO QUE EJECUTA LA FUNCION */
    return _parametro_de_salida
}


const _alias_ = function(_parametro-1_ , _parametro-2_ , ...) {
    /* BLOQUE DE CODIGO QUE EJECUTA LA FUNCION */
    return _parametro_de_salida
}

/* ARROW FUNCTION */
// son equivalentes salvo por un concepto que veremos en el futuro (this)

const _alias_ = (_param1_ , _param2) => {
    /* BLOQUE DE CODIGO QUE EJECUTA LA FUNCION */
    return _parametro_de_salida
}

//Si el número de parámetros de entrada es === 1 entonces se pueden eliminar los paréntesis

const _alias_ = _param1_ => {
    /* BLOQUE DE CODIGO QUE EJECUTA LA FUNCION */
    return _parametro_de_salida
}

// Si el bloque de código solo tiene una instrucción entonces podemos eliminar las llaves

const _alias_ = _param1_ => INSTRUCCION // Lo que devuelve se considera return


//OTROS TIPOS DE FUNCIONES

// funciones anónimas ==> que no la puedo llamar en ningún otro lado. 
// Es muy util para funciones que son parámetros de entrada de otra funcion
function(_param_1_, _param_2_){
    /* BLOQUE DE CODIGO QUE EJECUTA LA FUNCION */
}

(_param1_ , _param2_) => {
    /* BLOQUE DE CODIGO QUE EJECUTA LA FUNCION */
}

// IIFE ==> funciones autollamadas
(function (_param_1_, _param_2_) {
  /* BLOQUE DE CODIGO QUE EJECUTA LA FUNCION */
})(_valor_1, _valor_2);

```

**Los paramentros de entrada pueden ser de cualquier tipo de datos que hemos visto o de los que veremos en el futuro**

```js
function suma(a,b) { // defino las variables que quiero sumar, que las tiene que meter quien USE la función
    return a+b; // esta función estaría devolvien la suma de lo que val a + lo que valga b
}

function greeting(name){
    return `Hello ${name}`;
}

greeting('Alex'); // devuelve 'Hello Alex'
greeting('Bootcamp'); // devuelve 'Hello Bootcamp'
const r = greeting('Luis'); // 

const greeting = name => `Hello ${name}`; // sin llaves la instrucción que pongamos es la que devuelve la función
greeting('Marco'); // devuelve 'Hello Marco'
```

## ¿Cómo se llaman a las funciones?

Tenemos que utilizar su alias, abriendo y cerrando paréntesis y separando por `,` , los VALORES de los parámetros de entrada.

```js
const n = parseInt('1233434');

isNan(1233434); // Boolean 


suma(4,7); //  number --> 11
suma(4+5, 9); // number --> 18

const a = 10%5;
suma(8,a); // number --> 8

suma(8/0, 33); // number --> Infinity

const msg = 'hello';
suma(msg*3, msg+6); // string --> NaN , hello6 --> 'Nanhello6'
```

