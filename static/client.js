'use strict';
((io) => {
  var client = io();

  client.on('connect', () => {
    console.log('connection');

    client.emit('data', {
      query: 'select',
      module: 'fnConcretizeAAU',
      parent: '2',
      project: '2'
    });

    client.emit('data', {
      query: 'subscribe',
      module: 'fnConcretizeAAU'
    });

    client.emit('data', {
      query: 'subscribe',
      module: 'viewAAUSupplies'
    });
  });

  client.on('response', (data) => {
    var query = data.query;
    if (data.row) {
      if (data.module == 'fnConcretizeAAU') {
        if (query == 'select' || query == 'insert') {
          tree.doselect(data.row);
        } else if (query == 'update') {
          tree.doselect(data.row);
        } else if (query == 'delete') {
          data.row.description_concreted = null;
          data.row.id_concreted = null;
          data.row.parent_concreted = null;
          tree.doselect(data.row);
        } else {
          console.log('sin procesar fnConcretizeAAU', data);
        }
      } else if (data.module == 'viewAAUSupplies') {
        if (query == 'select') {
          viewaausupplies.doselect(data.row);
        } else if (query == 'update') {
          viewaausupplies.doupdate(data.row);
        } else {
          console.log('sin procesar viewAAUSupplies', data);
        }
      } else {
        console.log('sin procesar', data.row);
      }
    }
  });

  window.client = client;
})(io);
