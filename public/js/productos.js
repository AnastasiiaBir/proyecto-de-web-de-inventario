// public/js/productos.js

document.addEventListener('DOMContentLoaded', async () => {
  const table = document.getElementById('tablaProductos');
  const filterForm = document.querySelector('.filters');

  let categorias = window.categorias || [];
  let proveedores = window.proveedores || [];
  let localizaciones = window.localizaciones || [];

  if (!categorias.length || !proveedores.length || !localizaciones.length) {
    try {
      const res = await fetch('/admin/productos/options');
      const data = await res.json();
      categorias = data.categorias;
      proveedores = data.proveedores;
      localizaciones = data.localizaciones;
    } catch (err) {
      console.error('Error al obtener opciones:', err);
    }
  }

  function createSelect(options, currentText) {
    const select = document.createElement('select');
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.id;
      option.textContent = opt.nombre;
      if (opt.nombre === currentText) option.selected = true;
      select.appendChild(option);
    });
    return select;
  }

  if (!table || !filterForm) return;

  // === Dropdown Export ===
const exportButton = document.getElementById('btnExportar');
const exportMenu = document.getElementById('exportMenu');

if (exportButton && exportMenu) {
  exportButton.addEventListener('click', (e) => {
    e.stopPropagation();
    exportMenu.style.display = exportMenu.style.display === 'block' ? 'none' : 'block';
  });

  document.addEventListener('click', (e) => {
    if (exportMenu.style.display === 'block' &&
        !exportButton.contains(e.target) &&
        !exportMenu.contains(e.target)) {
      exportMenu.style.display = 'none';
    }
  });
}

  // === Filtros ===
  filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = (filterForm.nombre.value || '').toLowerCase();
    const marca = (filterForm.marca.value || '').toLowerCase();
    const categoria = (filterForm.categoria.value || '').toLowerCase();
    const proveedor = (filterForm.proveedor.value || '').toLowerCase();
    const localizacion = (filterForm.localizacion.value || '').toLowerCase();
    const precioMax = parseFloat(filterForm.precioMax.value) || Infinity;
    const costoMax = parseFloat(filterForm.costoMax.value) || Infinity;
    const stockMin = parseFloat(filterForm.stockMin.value) || 0;

    table.querySelectorAll('tbody tr').forEach(row => {
      const cells = row.children;
      const rowCategoria = cells[3].textContent.toLowerCase();
      const rowProveedor = cells[4].textContent.toLowerCase();
      const rowLocalizacion = cells[10].textContent.toLowerCase();
      const rowPrecio = parseFloat(cells[5].textContent) || 0;
      const rowCosto = parseFloat(cells[6].textContent) || 0;
      const rowStock = parseFloat(cells[8].textContent) || 0;

      const match =
        cells[1].textContent.toLowerCase().includes(nombre) &&
        cells[2].textContent.toLowerCase().includes(marca) &&
        rowCategoria.includes(categoria) &&
        rowProveedor.includes(proveedor) &&
        rowLocalizacion.includes(localizacion) &&
        rowPrecio <= precioMax &&
        rowCosto <= costoMax &&
        rowStock >= stockMin;

      row.style.display = match ? '' : 'none';
    });
  });

  // === Edit / Save / Cancel / Delete ===
  // let editingCell = null;
  // let editingInput = null;
  // let currentRowSaveBtn = null;
  // let currentRowCancelBtn = null;

  table.querySelectorAll('tbody tr').forEach(row => {
    const cells = row.querySelectorAll('.editable');
    const deleteBtn = row.querySelector('.delete-btn');
    
    // Создаём кнопки для каждой строки
    let saveBtn = row.querySelector('.save-btn');
    if (!saveBtn) {
      saveBtn = document.createElement('button');
      saveBtn.textContent = 'Guardar';
      saveBtn.className = 'save-btn';
      saveBtn.style.display = 'none';
      row.appendChild(saveBtn);
    }

    let cancelBtn = row.querySelector('.cancel-btn');
    if (!cancelBtn) {
      cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancelar';
      cancelBtn.className = 'cancel-btn';
      cancelBtn.style.display = 'none';
      saveBtn.parentNode.insertBefore(cancelBtn, saveBtn.nextSibling);
    }

    let editingCell = null;
    let editingInput = null;

    // Сохраняем оригинальные значения
    const productId = row.dataset.id;
    const originalValues = {};
    cells.forEach(cell => originalValues[cell.dataset.field] = cell.textContent.trim());

    // === Double click ===
    cells.forEach(cell => {
      cell.addEventListener('dblclick', () => {
        if (editingCell) return;
        editingCell = cell;

        // currentRowSaveBtn = saveBtn;
        // currentRowCancelBtn = cancelBtn;

        const field = cell.dataset.field;
        const currentValue = cell.textContent.trim();
        let input;

        let optionsList = [];
        if (field === 'categoria_nombre') optionsList = categorias;
        else if (field === 'proveedor_nombre') optionsList = proveedores;
        else if (field === 'localizacion_nombre') optionsList = localizaciones;

        if (optionsList.length) {
          input = createSelect(optionsList, currentValue);
        } else {
          input = document.createElement('input');
          input.type = 'text';
          input.value = currentValue;
        }

        cell.innerHTML = '';
        cell.appendChild(input);
        input.focus();
        editingInput = input;

        saveBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
      });
    });

    // === Save ===
    saveBtn.addEventListener('click', async () => {
      if (!editingCell || !editingInput) return;

      const field = editingCell.dataset.field;
      let value = editingInput.value || '';

      let sendField = field;
      if (field === 'categoria_nombre') sendField = 'categoria_id';
      else if (field === 'proveedor_nombre') sendField = 'proveedor_id';
      else if (field === 'localizacion_nombre') sendField = 'localizacion_id';

      try {
        const res = await fetch(`/admin/productos/${productId}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [sendField]: value })
        });
        const json = await res.json();
        if (json.success) {

          if (field === 'categoria_nombre') editingCell.textContent = categorias.find(c => c.id == value)?.nombre || '';
          else if (field === 'proveedor_nombre') editingCell.textContent = proveedores.find(p => p.id == value)?.nombre || '';
          else if (field === 'localizacion_nombre') editingCell.textContent = localizaciones.find(l => l.id == value)?.nombre || '';
          else editingCell.textContent = value;

          editingCell = null;
          editingInput = null;
          saveBtn.style.display = 'none';
          cancelBtn.style.display = 'none';
        } else {
          alert('Error al guardar');
        }
      } catch (err) {
        alert('Error al guardar');
      }
    });

    // === Cancel ===
    cancelBtn.addEventListener('click', () => {
      if (!editingCell) return;
      editingCell.textContent = originalValues[editingCell.dataset.field];
      editingCell = null;
      editingInput = null;
      saveBtn.style.display = 'none';
      cancelBtn.style.display = 'none';
    });

    // === Delete ===
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
        try {
          const res = await fetch(`/admin/productos/eliminar/${row.dataset.id}`, { method: 'DELETE' });
          const json = await res.json();
          if (json.success) row.remove();
          else alert('Error al eliminar');
        } catch (err) {
          alert('Error al eliminar');
        }
      });
    }
  });
});