/*--- 1. Conectamos JavaScript con HTML ---*/
// Guardamos en "variables" los elementos del DOM que vamos a usar
const barraBusqueda = document.getElementById('barraBusqueda');
const botonBuscar = document.getElementById('botonBuscar');
const resultadosContainer = document.getElementById('resultadosContainer');
const filtroAutor = document.getElementById('filtroAutor');
const filtroCategoria = document.getElementById('filtroCategoria');
/*--- 2. Se define la biblioteca ---*/
// se rellenara con JSON
let miBiblioteca = [];

/*--- 3. se inicia la aplicación ---*/
// evento que espera a que el HTML este listo
document.addEventListener('DOMContentLoaded', iniciarApp);

// funcion maestra que carga los datos
async function iniciarApp() {
    try {
        //usamos fetch para obtener los datos del archivo JSON
        const response = await fetch('./libros.json');

        //si el servidor no encuentra el archivo o hay otro problema
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        //---DIAGNOSTICO---
        //Leerlo como texto plano
        const textoPlano =await response.text();
        console.log("---INICIO:TEXTO RAW DE LIBROS.JSON ---");
        console.log(textoPlano);
        console.log("---FIN:TEXTO RAW DE LIBROS.JSON ---");
        //interpretación manual
        miBiblioteca = JSON.parse(textoPlano);
        // FIN DIAGNOSTICO

        //convertimos la respuesta en JSON
    
        //Llenamos los filtros
        popularFiltros();
        //Activamos boton de busqueda
        botonBuscar.addEventListener('click', buscarLibro);

        console.log("Biblioteca cargada:", miBiblioteca);

    } catch (error) {
        console.error("Error al cargar la biblioteca:", error);
        resultadosContainer.innerHTML = '<p>Error: No se pudo cargar la base de datos de libros. Revisa el archivo libros.json.</p>';
    }
}
/*--- Funcion para popular los filtros ---*/
/* --- 4. FUNCIÓN: POPULAR LOS FILTROS (¡CON SELECT OPTIONS!) --- */
function popularFiltros() {
    const todosLosAutores = new Set(); 
    const todasLasCategorias = new Set(); 

    miBiblioteca.forEach(libro => {
        if (libro.autor) {
            todosLosAutores.add(libro.autor);
        }

        let categoriasArray = [];
        if (typeof libro.categoria === 'string') {
            categoriasArray = libro.categoria.split(',').map(cat => cat.trim());
        } else if (Array.isArray(libro.categoria)) {
            categoriasArray = libro.categoria;
        }

        categoriasArray.forEach(cat => {
            if (cat) todasLasCategorias.add(cat); 
        });
    });

    // --- Llenar filtro de Autores (Sin cambios) ---
    filtroAutor.innerHTML = '<option value="">-- Todos los Autores --</option>'; 
    [...todosLosAutores].sort().forEach(autor => {
        const opcion = document.createElement("option");
        opcion.value = autor;
        opcion.textContent = autor;
        filtroAutor.appendChild(opcion);
    });

    // --- ¡REVERTIDO! Llenar filtro de Categorías (con Options) ---
    filtroCategoria.innerHTML = ''; // Limpiamos el select
    
    [...todasLasCategorias].sort().forEach(categoria => {
        // Creamos un <option>
        const opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.textContent = categoria;
        // Lo añadimos al <select>
        filtroCategoria.appendChild(opcion);
    });
}

/* --- 5. FUNCIÓN PRINCIPAL DE BÚSQUEDA (¡LEE SELECT MULTIPLE!) --- */
function buscarLibros() {
    const terminoBusqueda = barraBusqueda.value.toLowerCase();
    const autorSeleccionado = filtroAutor.value;
    
    // --- ¡REVERTIDO! Cómo leer las categorías del 'select multiple' ---
    const categoriasSeleccionadas = Array.from(filtroCategoria.selectedOptions).map(opt => opt.value);

    // El resto de la función es idéntica
    let librosEncontrados = miBiblioteca;

    if (terminoBusqueda) {
        librosEncontrados = librosEncontrados.filter(libro => 
            libro.titulo && libro.titulo.toLowerCase().includes(terminoBusqueda)
        );
    }

    if (autorSeleccionado) {
        librosEncontrados = librosEncontrados.filter(libro => 
            libro.autor === autorSeleccionado
        );
    }

    if (categoriasSeleccionadas.length > 0) {
        librosEncontrados = librosEncontrados.filter(libro => {
            let categoriasArray = [];
            if (typeof libro.categoria === 'string') {
                categoriasArray = libro.categoria.split(',').map(cat => cat.trim());
            } else if (Array.isArray(libro.categoria)) {
                categoriasArray = libro.categoria;
            }
            return categoriasArray.some(cat => categoriasSeleccionadas.includes(cat));
        });
    }

    mostrarResultados(librosEncontrados);
}

/*--- 6. FUNCIÓN PARA MOSTRAR RESULTADOS ---*/
function mostrarResultados(libros) {
    // Limpiamos resultados anteriores
    resultadosContainer.innerHTML = '';
    // Verificamos si se encontraron libros
    if (libros.lenght === 0) {
        resultadosContainer.innerHTML = '<p>No se encontraron libros.<p>';
        return; //salimos de la funnción
    }
    // Creamos un elemento para cada libro encontrado
    libros.forEach(libro => {
        //creamos nuevos elementos HTML desde JavaScript
        const libroDiv = document.createElement('div');
        libroDiv.className = 'libro-item'; //usamos el estilo CSS que definimos antes
        // codigo para la portada del libro en jpg
        if (libro.portada) {
            const libroPortada = document.createElement('img');
            libroPortada.src = libro.portada;
            libroPortada.alt = "Portada de " + (libro.titulo || 'Desconocido');
            libroDiv.appendChild(libroPortada);
        }
        const libroTitulo = document.createElement('h3');
        libroTitulo.textContent = libro.titulo || 'Título desconocido';
        const libroAutor = document.createElement('p');
        libroAutor.textContent = `Autor: ${libro.autor || 'Desconocido'}`;
        const libroUbicacion = document.createElement('p');
        libroUbicacion.innerHTML = `Ubicación: ${libro.ubicacion || 'N/A'}`;
        const libroCategorias = document.createElement('p');

        let categoriaTexto = "N/A";
        if (typeof libro.categoria === 'string' && libro.categoria) {
            categoriaTexto = libro.categoria; 
        } else if (Array.isArray(libro.categoria) && libro.categoria.length > 0) {
            categoriaTexto = libro.categoria.join(', ');
        }

        libroCategorias.innerHTML = `<strong>Categorías:</strong> ${categoriaTexto}`;


        // Armamos la "tarjeta" del libro
        libroDiv.appendChild(libroTitulo);
        libroDiv.appendChild(libroAutor);
        libroDiv.appendChild(libroUbicacion);
        libroDiv.appendChild(libroCategorias);

        // Agregamos la "tarjeta" al contenedor de resultados
        resultadosContainer.appendChild(libroDiv);
    });
}
    