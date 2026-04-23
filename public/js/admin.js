// Admin Panel Main JS

const STATUS_OPTIONS = ['pendiente', 'en preparación', 'en camino', 'entregado'];

const CATEGORY_LABELS = {
  size: 'Tamaño',
  dough: 'Masa',
  sauce: 'Salsa',
  cut: 'Corte',
  topping: 'Topping'
};

let allProducts = [];
let allOrders = [];
let editingProductId = null;

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  // Verify admin session
  const me = await apiRequest('/api/auth/me');
  if (!me.ok || me.user.role !== 'admin') {
    window.location.href = '/login.html';
    return;
  }

  // Set admin name in header
  document.getElementById('adminName').textContent = me.user.name;
  document.querySelector('.avatar-small').textContent = me.user.name.charAt(0).toUpperCase();

  // Bind sidebar navigation
  document.querySelectorAll('.nav-item[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    });
  });

  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await apiRequest('/api/auth/logout', 'POST');
    window.location.href = '/login.html';
  });

  // Product modal close
  document.getElementById('closeProductModalBtn').addEventListener('click', closeProductModal);
  document.getElementById('productModal').addEventListener('click', (e) => {
    if (e.target.id === 'productModal') closeProductModal();
  });

  // Add product button
  document.getElementById('addBtn').addEventListener('click', () => openProductModal());

  // Save product
  document.getElementById('saveProductBtn').addEventListener('click', saveProduct);

  // Load initial tab
  await loadDashboard();
});

// ─── TAB NAVIGATION ───────────────────────────────────────────────────────────

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item[data-tab]').forEach(l => l.classList.remove('active'));
  
  document.getElementById(tabName).classList.add('active');
  document.querySelector(`.nav-item[data-tab="${tabName}"]`).classList.add('active');
  
  const titles = { dashboard: 'Dashboard', orders: 'Gestión de Pedidos', products: 'Gestión de Productos' };
  document.getElementById('pageTitle').textContent = titles[tabName] || tabName;

  if (tabName === 'dashboard') loadDashboard();
  if (tabName === 'orders') loadOrders();
  if (tabName === 'products') loadProducts();
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────

async function loadDashboard() {
  const res = await apiRequest('/api/admin/dashboard');
  if (!res.ok) return;

  const { stats } = res;
  document.getElementById('statTotalOrders').textContent = stats.totalOrders;
  document.getElementById('statTotalSales').textContent = formatCurrency(stats.totalSales);
  document.getElementById('statTodayOrders').textContent = stats.todayOrders;

  // Load 5 most recent orders for preview
  const ordersRes = await apiRequest('/api/admin/orders');
  if (ordersRes.ok) {
    const tbody = document.querySelector('#recentOrdersTable tbody');
    const recent = ordersRes.orders.slice(0, 5);
    tbody.innerHTML = recent.length === 0
      ? '<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 2rem;">Sin pedidos aún</td></tr>'
      : recent.map(o => `
        <tr>
          <td style="font-family: monospace; font-size: 0.8rem; opacity: 0.6">#${o.id.slice(0, 8)}...</td>
          <td>${escapeHtml(o.user_name)}</td>
          <td>${formatCurrency(o.total)}</td>
          <td>${statusBadge(o.status)}</td>
        </tr>
      `).join('');
  }
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────

async function loadOrders() {
  const res = await apiRequest('/api/admin/orders');
  if (!res.ok) return showError('No se pudieron cargar los pedidos.');

  allOrders = res.orders;
  const tbody = document.getElementById('allOrdersTableBody');

  tbody.innerHTML = allOrders.length === 0
    ? '<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 2rem;">Sin pedidos aún</td></tr>'
    : allOrders.map(order => {
        const pizzas = JSON.parse(order.pizzas || '[]');
        const pizzaSummary = pizzas.map(p => `${p.size} – ${p.dough}`).join(', ');
        const dateStr = new Date(order.created_at).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

        return `<tr>
          <td style="font-size: 0.85rem; color: var(--text-muted)">${dateStr}</td>
          <td>
            <div style="font-weight: 600">${escapeHtml(order.user_name)}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted)">${escapeHtml(order.user_email)}</div>
          </td>
          <td style="max-width: 200px; font-size: 0.88rem">${escapeHtml(pizzaSummary) || '–'}</td>
          <td style="font-weight: 700">${formatCurrency(order.total)}</td>
          <td>${statusBadge(order.status)}</td>
          <td>
            <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
              ${STATUS_OPTIONS.map(s => `<option value="${s}" ${s === order.status ? 'selected' : ''}>${capitalize(s)}</option>`).join('')}
            </select>
          </td>
        </tr>`;
      }).join('');
}

async function updateOrderStatus(orderId, newStatus) {
  const res = await apiRequest(`/api/admin/orders/${orderId}/status`, 'PUT', { status: newStatus });
  if (res.ok) {
    showToast('Estado actualizado ✓');
  } else {
    showToast('Error al actualizar', true);
  }
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

async function loadProducts() {
  const res = await apiRequest('/api/admin/products');
  if (!res.ok) return showError('No se pudieron cargar los productos.');

  allProducts = res.products;
  const tbody = document.getElementById('productsTableBody');

  tbody.innerHTML = allProducts.map(p => `
    <tr>
      <td><span class="cat-badge">${CATEGORY_LABELS[p.category] || p.category}</span></td>
      <td style="font-weight: 600">${escapeHtml(p.name)}</td>
      <td>${p.price > 0 ? formatCurrency(p.price) : '–'}</td>
      <td>
        <label class="toggle-switch">
          <input type="checkbox" ${p.active ? 'checked' : ''} onchange="toggleProduct('${p.id}', this.checked, '${escapeHtml(p.category)}', '${escapeHtml(p.name)}', ${p.price})">
          <span class="toggle-track"></span>
        </label>
      </td>
      <td>
        <div style="display: flex; gap: 8px;">
          <button class="icon-btn" onclick='openProductModal(${JSON.stringify(p)})' title="Editar">
            <i class='bx bx-edit'></i>
          </button>
          <button class="icon-btn danger" onclick="deleteProduct('${p.id}')" title="Eliminar">
            <i class='bx bx-trash'></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openProductModal(product = null) {
  editingProductId = product ? product.id : null;
  
  document.getElementById('modalTitle').textContent = product ? 'Editar Producto' : 'Nuevo Producto';
  document.getElementById('prodId').value = product?.id || '';
  document.getElementById('prodCategory').value = product?.category || 'size';
  document.getElementById('prodName').value = product?.name || '';
  document.getElementById('prodPrice').value = product?.price ?? 0;
  document.getElementById('prodActive').checked = product ? Boolean(product.active) : true;

  document.getElementById('productModal').classList.add('active');
  document.getElementById('prodName').focus();
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
  editingProductId = null;
}

async function saveProduct() {
  const category = document.getElementById('prodCategory').value;
  const name = document.getElementById('prodName').value.trim();
  const price = parseFloat(document.getElementById('prodPrice').value) || 0;
  const active = document.getElementById('prodActive').checked ? 1 : 0;

  if (!name) {
    showToast('El nombre es obligatorio', true);
    return;
  }

  const btn = document.getElementById('saveProductBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>';

  let res;
  if (editingProductId) {
    res = await apiRequest(`/api/admin/products/${editingProductId}`, 'PUT', { category, name, price, active });
  } else {
    res = await apiRequest('/api/admin/products', 'POST', { category, name, price, active });
  }

  btn.disabled = false;
  btn.innerHTML = 'Guardar';

  if (res.ok) {
    showToast(editingProductId ? 'Producto actualizado ✓' : 'Producto creado ✓');
    closeProductModal();
    loadProducts();
  } else {
    showToast(res.message || 'Error al guardar', true);
  }
}

async function toggleProduct(id, active, category, name, price) {
  const res = await apiRequest(`/api/admin/products/${id}`, 'PUT', { category, name, price, active: active ? 1 : 0 });
  if (res.ok) {
    showToast(active ? 'Producto activado ✓' : 'Producto desactivado');
  } else {
    showToast('Error al actualizar', true);
    loadProducts(); // Revert
  }
}

async function deleteProduct(id) {
  if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;

  const res = await apiRequest(`/api/admin/products/${id}`, 'DELETE');
  if (res.ok) {
    showToast('Producto eliminado');
    loadProducts();
  } else {
    showToast('Error al eliminar', true);
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function statusBadge(status) {
  const cls = {
    'pendiente': 'pendiente',
    'en preparación': 'en-preparacion',
    'en camino': 'en-camino',
    'entregado': 'entregado'
  };
  return `<span class="status-badge status-${cls[status] || 'pendiente'}">${capitalize(status)}</span>`;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

let toastTimeout;
function showToast(message, isError = false) {
  let toast = document.getElementById('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      padding: 14px 24px; border-radius: 10px; font-weight: 600;
      transition: opacity 0.3s, transform 0.3s;
      transform: translateY(20px); opacity: 0;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.background = isError ? '#c0392b' : '#27ae60';
  toast.style.color = '#fff';
  
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  }, 3000);
}

function showError(message) {
  showToast(message, true);
}
