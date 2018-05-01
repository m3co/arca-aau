'use strict';
(() => {

  var Children = Symbol();
  var Ready = Symbol();
  var root = {
    id_to_concrete: '2', parent_to_concrete: null,
    description_to_concrete: '', expand: true
  };
  root[Children] = [];
  root[Ready] = false;

  var tree = {};
  tree[Children] = [root];
  tree[Ready] = false;
  var unsorted = [];

  window.trees = tree;
  window.unsorted = unsorted;

  var lastSTO, skipOnce = true;

  function doselect(row) {
    if (row.expand) {
      row[Children] = [];
      row[Ready] = false;
    }

    function search(id_to_concrete, tree) {
      var parent_to_concrete;
      if (tree[Children] instanceof Array) {
        parent_to_concrete = tree[Children].find(d => d.id_to_concrete == id_to_concrete);
        if (parent_to_concrete) {
          return parent_to_concrete;
        }
        for (var i = 0; i < tree[Children].length; i++) {
          parent_to_concrete = search(id_to_concrete, tree[Children][i]);
          if (parent_to_concrete) {
            return parent_to_concrete;
          }
        }
      }
    }
    var parent_to_concrete = search(row.parent_to_concrete, tree);
    if (!parent_to_concrete) {
      unsorted.push(row);
    } else {
      var found = parent_to_concrete[Children].find(d => d.id_to_concrete === row.id_to_concrete);
      if (!found) {
        parent_to_concrete[Children].push(row);
        parent_to_concrete[Ready] = true;
      } else {
        Object.keys(row).forEach(key => {
          found[key] = row[key];
        });

        d3.select(`[id="item-${row.id_to_concrete}"]`)
          .text(`${row.id_to_concrete} ${
            row.description_concreted ?
              row.description_concreted : row.description_to_concrete}`);
        return;
      }
    }

    if (lastSTO) {
      clearTimeout(lastSTO);
    }
    lastSTO = setTimeout(() => {
      render(d3.select('ol.tree'), tree);
    }, 300);
  }

  function render(base, tree) {
    if (!(tree[Children] instanceof Array)) {
      return;
    }
    var tr = base.selectAll('li')
      .data(tree[Children].filter(d => d.expand))
      .enter().append('li');

    tr.append('label')
      .attr('for', d => d.id_to_concrete)
      .attr('id', d => `item-${d.id_to_concrete}`)
      .text(d => `${d.id_to_concrete} ${
        d.description_concreted ?
          d.description_concreted : d.description_to_concrete}`)
      .on('click', viewaausupplies.request);
    tr.append('input')
      .attr('type', 'checkbox')
      .attr('for', d => d.id_to_concrete)
      .on('change', function(d, i, m) {
        if (!(d[Ready])) {
          client.emit('data', {
            query: 'select',
            module: 'fnConcretizeAAU',
            parent: d.id_to_concrete,
            project: '2'
          });
        }
      })
      .each(function(d) {
        if (d.parent_to_concrete === null) {
          d3.select(this).attr('checked', '');
        }
      });
    tr.append('ol').attr('root', d => d.id_to_concrete);

    base.selectAll('li.file').data(tree[Children].filter(d => !d.expand))
      .enter().append('li').attr('class', 'file').append('a')
        .attr('id', d => `item-${d.id_to_concrete}`)
        .attr('href', '#').text(d => `${d.id_to_concrete} ${
          d.description_concreted ?
            d.description_concreted : d.description_to_concrete}`)
        .style('color', d =>
          d.status == 'empty' ? 'gray' : (d.status == 'full' ? 'black' : 'blue')
        )
        .on('click', viewaausupplies.request);

    for (var i = 0; i < tree[Children].length; i++) {
      if (tree[Children][i].expand) {
        render(d3.select(`ol[root="${tree[Children][i].id_to_concrete}"]`),
          tree[Children][i]);
      }
    }
  }

  window.tree = {
    doselect: doselect
  };
})();
