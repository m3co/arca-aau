'use strict';
(() => {

  var lastSTO;
  var blocks = {};
  window.blocks = blocks;

  function doselect(row) {
    if (row.AAU_expand) return;
    if (!blocks[row.AAU_id]) {
      blocks[row.AAU_id] = {
        AAUSupplies: []
      };
    }
    var AAU = blocks[row.AAU_id];
    AAU.id = row.AAU_id;
    AAU.qop = row.AAU_qop;
    AAU.unit = row.AAU_unit;
    AAU.cost = row.AAU_cost;
    AAU.is_estimated = row.AAU_is_estimated;
    AAU.description = row.AAU_description;
    AAU.information = row.AAU_information;

    var Supply = {};
    Supply.id = row.Supplies_id;
    Supply.cost = row.Supplies_cost;
    Supply.type = row.Supplies_type;
    Supply.unit = row.Supplies_unit;
    Supply.description = row.Supplies_description;

    var AAUSupply = {};
    AAUSupply.id = row.AAUSupplies_id;
    AAUSupply.qop = row.AAUSupplies_qop;
    AAUSupply.AAUId = row.AAUSupplies_AAUId;
    AAUSupply.SupplyId = row.AAUSupplies_SupplyId;

    AAUSupply.Supply = Supply;
    AAUSupply.AAU = AAU;
    AAU.AAUSupplies.push(AAUSupply);

    if (lastSTO) {
      clearTimeout(lastSTO);
    }
    lastSTO = setTimeout(() => {
      render();
    }, 300);
  }

  function render() {
    console.log(blocks);
  }

  function request(d) {
    Object.keys(blocks).forEach(key => {
      delete blocks[key];
    });
    client.emit('data', {
      query: 'select',
      module: 'viewAAUSupplies',
      keynote: d.id_to_concrete
    });
  }

  window.viewaausupplies = {
    doselect: doselect,
    request: request
  };
})();
