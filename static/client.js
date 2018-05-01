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
        if (query == 'select') {
          tree.doselect(data.row);
        }
        if (query == 'update') {
          tree.doselect(data.row);
        }
      } else if (data.module == 'viewAAUSupplies') {
        if (query == 'select') {
          viewaausupplies.doselect(data.row);
        }
        if (query == 'update') {
          viewaausupplies.doupdate(data.row);
        }
      } else {
        console.log('sin procesar', data.row);
      }
    }
  });

  window.client = client;
})(io);
