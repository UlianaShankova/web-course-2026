const API_URL = 'https://task10-11-zen-money.onrender.com';
let expensesChartInstance = null;

const themeToggleBtn = document.getElementById('theme-toggle');
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    themeToggleBtn.textContent = document.body.classList.contains('light-theme') ? 'Светлая' : 'Темная';
});

async function loadCategories() {
    const res = await fetch(`${API_URL}/categories`);
    const categories = await res.json();
    const select = document.getElementById('category');

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

async function loadData() {
    const res = await fetch(`${API_URL}/transactions`);
    const transactions = await res.json();

    const listContainer = document.getElementById('transactions-list');
    listContainer.innerHTML = '';

    let totalBalance = 0;
    let expensesData = {};

    transactions.forEach(t => {
        const rates = { 'BYN': 1, 'USD': 3.27, 'EUR': 3.55, 'RUB': 0.035, 'CNY': 0.45 };
        const amountInByn = t.amount * (rates[t.currency] || 1);

        if (t.category_type === 'income') {
            totalBalance += amountInByn;
        } else {
            totalBalance -= amountInByn;
            expensesData[t.category_name] = (expensesData[t.category_name] || 0) + amountInByn;
        }

        const div = document.createElement('div');
        div.className = 'tx-item';
        const amountClass = t.category_type === 'income' ? 'income' : 'expense';
        const sign = t.category_type === 'income' ? '+' : '-';

        div.innerHTML = `
            <div class="tx-info">
                <div>
                    <div style="font-weight: 600">${t.category_name}</div>
                    <div style="font-size: 12px; color: var(--text-muted)">${t.date} • ${t.comment || 'Без комментария'}</div>
                </div>
            </div>
            <div class="tx-amount ${amountClass}">${sign} ${t.amount} ${t.currency || 'BYN'}</div>
            <button onclick="deleteTx(${t.id})" style="background:transparent; border:none; color: #ff6b6b; cursor:pointer;">✖</button>
        `;
        listContainer.appendChild(div);
    });

    document.getElementById('total-balance').textContent = totalBalance.toFixed(2) + ' Br';
    renderChart(expensesData);
}

function renderChart(data) {
    const ctx = document.getElementById('expensesChart').getContext('2d');
    if (expensesChartInstance) expensesChartInstance.destroy();

    const labels = Object.keys(data);
    const values = Object.values(data);

    if (labels.length === 0) {
        labels.push('Нет данных');
        values.push(1);
    }

    expensesChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['#7bc043', '#2e4a33', '#a3d977', '#4a7c59', '#ff6b6b'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '75%',
            plugins: {
                legend: { position: 'bottom', labels: { color: getComputedStyle(document.body).getPropertyValue('--text-main') } }
            }
        }
    });
}

document.getElementById('transaction-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        amount: parseFloat(document.getElementById('amount').value),
        currency: document.getElementById('currency').value,
        category_id: parseInt(document.getElementById('category').value),
        date: document.getElementById('date').value,
        comment: document.getElementById('comment').value
    };

    const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        document.getElementById('amount').value = '';
        document.getElementById('comment').value = '';
        loadData();
    } else {
        const err = await res.json();
        alert('Ошибка: ' + err.error);
    }
});

async function deleteTx(id) {
    if(!confirm('Удалить операцию?')) return;
    await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE' });
    loadData();
}

const modal = document.getElementById('profile-modal');
const profileBtn = document.getElementById('open-profile-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

profileBtn.addEventListener('click', async () => {
    modal.style.display = 'flex';
    await loadProfile();
});

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

async function loadProfile() {
    try {
        const res = await fetch(`${API_URL}/profile`);
        const user = await res.json();
        const infoDiv = document.getElementById('profile-info');
        infoDiv.innerHTML = `
            <p><strong>Имя:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Статус:</strong> <span style="color: var(--accent-green)">${user.role}</span></p>
        `;
        loadCurrencyWidgets();
    } catch (e) {
        console.error('Ошибка профиля', e);
    }
}

function loadCurrencyWidgets() {
    const container = document.getElementById('currency-widgets');
    container.innerHTML = `
        <div class="currency-card">
            <span>🇺🇸 Доллар (USD)</span>
            <span>3.27 Br</span>
        </div>
        <div class="currency-card">
            <span>🇪🇺 Евро (EUR)</span>
            <span>3.55 Br</span>
        </div>
        <div class="currency-card">
            <span>🇨🇳 Юань (CNY)</span>
            <span>0.45 Br</span>
        </div>
        <div class="currency-card">
            <span>🇷🇺 Рос. рубль (RUB)</span>
            <span>0.035 Br</span>
        </div>
    `;
}

window.onload = async () => {
    document.getElementById('date').valueAsDate = new Date();
    await loadCategories();
    await loadData();
};



