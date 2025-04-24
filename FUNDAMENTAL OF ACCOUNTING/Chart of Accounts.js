document.addEventListener('DOMContentLoaded', function() {
    // Sample data - would normally come from a database
    const accounts = [
        { no: '01', description: 'Cash In Bank', action: 'Receive' },
        { no: '02', description: 'Account Receivable', action: 'Receive' },
        { no: '03', description: 'Advances To Employees', action: 'Receive' },
        { no: '04', description: 'Furniture And Fixtures', action: 'Receive' },
        { no: '05', description: 'Equipment', action: 'Receive' },
        { no: '06', description: 'Supplies Inventory', action: 'Receive' }
    ];

    const tableBody = document.querySelector('#accountsTable tbody');
    const addButton = document.getElementById('addAccount');
    const accountNoInput = document.getElementById('accountNo');
    const descriptionInput = document.getElementById('description');

    // Populate table with sample data
    function populateTable() {
        tableBody.innerHTML = '';
        accounts.forEach(account => {
            const row = document.createElement('tr');
            
            const noCell = document.createElement('td');
            noCell.textContent = account.no;
            
            const descCell = document.createElement('td');
            descCell.textContent = account.description;
            
            const actionCell = document.createElement('td');
            actionCell.textContent = account.action;
            actionCell.classList.add('action-receive');
            
            row.appendChild(noCell);
            row.appendChild(descCell);
            row.appendChild(actionCell);
            
            tableBody.appendChild(row);
        });
    }

    // Add new account
    addButton.addEventListener('click', function() {
        const no = accountNoInput.value.trim();
        const description = descriptionInput.value.trim();
        
        if (no && description) {
            // Check if account number already exists
            if (accounts.some(acc => acc.no === no)) {
                alert('Account number already exists!');
                return;
            }
            
            // Add new account
            accounts.push({
                no: no,
                description: description,
                action: 'Receive' // Default action
            });
            
            // Sort accounts by number
            accounts.sort((a, b) => a.no.localeCompare(b.no));
            
            // Update table
            populateTable();
            
            // Clear inputs
            accountNoInput.value = '';
            descriptionInput.value = '';
        } else {
            alert('Please fill in both fields!');
        }
    });

    // Initialize table
    populateTable();

    // Dropdown functionality
    document.querySelectorAll('.dropdown').forEach(item => {
        item.addEventListener('click', function() {
            this.textContent = this.textContent.includes('▼') 
                ? this.textContent.replace('▼', '▲') 
                : this.textContent.replace('▲', '▼');
        });
    });
});