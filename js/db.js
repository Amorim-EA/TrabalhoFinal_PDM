/*Indexeddb*/
import { openDB } from "idb";

let db;

async function criarDB(){
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction){
                switch  (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('focos', {
                            keyPath: 'titulo'
                        });
                        store.createIndex('id', 'id');
                        console.log("banco de dados criado!");
                }
            }
        });
        console.log("banco de dados aberto!");
    }catch (e) {
        console.log('Erro ao criar/abrir banco: ' + e.message);
    }
}

window.addEventListener('DOMContentLoaded', async event =>{
    criarDB();
    const cadButton = document.getElementById('btn-submit');
    if(cadButton != "undefined"){
      cadButton.addEventListener('click', cadastrarFoco);
    }
    document.getElementById('btn-listar').addEventListener('click', renderizarFocos);
});



async function cadastrarFoco() {
  let titulo = document.getElementById("titulo").value;
  let descricao = document.getElementById("descricao").value;
  let latitude = document.getElementById("latitude").value;
  let longitude = document.getElementById("longitude").value;

  const tx = await db.transaction('focos', 'readwrite');
  const store = tx.objectStore('focos');

  try {
    await store.add({ 
      titulo: titulo,  
      descricao: descricao,
      coordenadas: {
        latitude: latitude,
        longitude: longitude
      }
    });
    await tx.done;
    limparCampos();
    alert('Registro adicionado com sucesso!');
    console.log('Registro adicionado com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar:', error);
    tx.abort();
  }
}


function limparCampos() {
  document.getElementById("titulo").value = '';
  document.getElementById("descricao").value = '';
  document.getElementById('latitude').value = '';
  document.getElementById('longitude').value = '';
}

async function renderizarFocos(){
  if(db){
    const tx = await db.transaction('focos', 'readonly')
    const store = tx.objectStore('focos');
  
    const tfocos = await store.getAll();
  
    const divLista = tfocos.map(foco => {
      return `<div class="card_item">
                <p class="card_titulo">${foco.titulo}</p>
                <p class="card_descricao">${foco.descricao}</p>
                <iframe class="mapa" src="http://maps.google.com/maps?q=${foco.coordenadas.latitude},${foco.coordenadas.longitude}&z=16&output=embed"></iframe>
              </div>`;
  });

  listagem(divLista.join(' '));

}
}

function listagem(text){
  document.getElementById('resultados').innerHTML = text;
}
