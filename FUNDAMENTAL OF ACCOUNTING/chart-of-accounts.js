document.addEventListener('DOMContentLoaded', function() {
    const addAccountBtn = document.getElementById('addAccountBtn');
    const accountNoInput = document.getElementById('accountNo');
    const accountDescInput = document.getElementById('accountDesc');
    const accountTypeInput = document.getElementById('accountType');
    const accountCategoryInput = document.getElementById('accountCategory');
    const accountsTableBody = document.getElementById('accountsTableBody');

    const categories = {
        Debit: ['Asset', 'Expense'],
        Credit: ['Liability', 'Equity', 'Revenue']
    };

    let accounts = JSON.parse(localStorage.getItem('chartOfAccounts')) || [];

    function renderAccountsTable() {
        accountsTableBody.innerHTML = '';
        accounts.sort((a, b) => a.no.localeCompare(b.no));

        accounts.forEach(account => {
            const row = document.createElement('tr');

            const noCell = document.createElement('td');
            noCell.textContent = account.no;

            const descCell = document.createElement('td');
            descCell.textContent = account.description;

            const typeCell = document.createElement('td');
            typeCell.textContent = account.type;

            const categoryCell = document.createElement('td');
            categoryCell.textContent = account.category;

            const actionCell = document.createElement('td');
            const removeBtn = document.createElement('a');
            removeBtn.href = '#';
            removeBtn.textContent = 'Remove';
            removeBtn.classList.add('remove-btn');
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                removeAccount(account.no);
            });

            actionCell.appendChild(removeBtn);

            row.appendChild(noCell);
            row.appendChild(descCell);
            row.appendChild(typeCell);
            row.appendChild(categoryCell);
            row.appendChild(actionCell);

            accountsTableBody.appendChild(row);
        });
    }

    function addAccount() {
        const accountNo = accountNoInput.value.trim();
        const accountDesc = accountDescInput.value.trim();
        const accountType = accountTypeInput.value;
        const accountCategory = accountCategoryInput.value;

        if (!accountNo || !accountDesc || !accountType || !accountCategory) {
            alert('Please fill in all fields');
            return;
        }

        if (accounts.some(acc => acc.no === accountNo)) {
            alert('Account number already exists');
            return;
        }

        accounts.push({
            no: accountNo,
            description: accountDesc,
            type: accountType,
            category: accountCategory
        });

        localStorage.setItem('chartOfAccounts', JSON.stringify(accounts));
        broadcastAccountsUpdate();

        accountNoInput.value = '';
        accountDescInput.value = '';
        accountTypeInput.value = '';
        accountCategoryInput.innerHTML = '<option value="" disabled selected>Select category</option>';

        renderAccountsTable();
    }

    function removeAccount(accountNo) {
        if (confirm('Are you sure you want to remove this account?')) {
            accounts = accounts.filter(acc => acc.no !== accountNo);
            localStorage.setItem('chartOfAccounts', JSON.stringify(accounts));
            broadcastAccountsUpdate();
            renderAccountsTable();
        }
    }

    accountTypeInput.addEventListener('change', () => {
        const selectedType = accountTypeInput.value;
        accountCategoryInput.innerHTML = '<option value="" disabled selected>Select category</option>';

        if (categories[selectedType]) {
            categories[selectedType].forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                accountCategoryInput.appendChild(option);
            });
        }
    });

    addAccountBtn.addEventListener('click', addAccount);

    [accountNoInput, accountDescInput].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addAccount();
        });
    });

    renderAccountsTable();
});

// Broadcast to other pages if needed
function broadcastAccountsUpdate() {
    const event = new CustomEvent('accountsUpdated', {
        detail: JSON.parse(localStorage.getItem('chartOfAccounts')) || []
    });
    window.dispatchEvent(event);
}
