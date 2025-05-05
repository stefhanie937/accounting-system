document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const entryForm = document.getElementById('entry-form');
    const entriesTableBody = document.getElementById('entriesTableBody');
    const resetEntriesBtn = document.getElementById('reset-entries-btn');
    const addDebitBtn = document.getElementById('add-debit-btn');
    const addCreditBtn = document.getElementById('add-credit-btn');
    const debitEntries = document.getElementById('debit-entries');
    const creditEntries = document.getElementById('credit-entries');
    const totalDebitDisplay = document.getElementById('total-debit');
    const totalCreditDisplay = document.getElementById('total-credit');

    // Load entries and accounts from localStorage
    let journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    let accounts = JSON.parse(localStorage.getItem('chartOfAccounts')) || [];

    // Function to add a new debit row
    function addDebitRow() {
        const row = document.createElement('div');
        row.className = 'entry-row debit-row';
        
        const select = document.createElement('select');
        select.className = 'debit-account';
        select.required = true;
        select.innerHTML = '<option value="">Select Account</option>';
        
        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.no;
            option.textContent = `${account.no} - ${account.description}`;
            select.appendChild(option);
        });
        
        row.innerHTML = `
            <input type="number" class="debit-amount" placeholder="Amount" step="0.01" min="0" required>
            <button type="button" class="btn-secondary remove-btn">Remove</button>
        `;
        row.prepend(select);
        debitEntries.appendChild(row);
        addRowEventListeners(row, 'debit');
    }

    // Function to add a new credit row
    function addCreditRow() {
        const row = document.createElement('div');
        row.className = 'entry-row credit-row';
        
        const select = document.createElement('select');
        select.className = 'credit-account';
        select.required = true;
        select.innerHTML = '<option value="">Select Account</option>';
        
        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.no;
            option.textContent = `${account.no} - ${account.description}`;
            select.appendChild(option);
        });
        
        row.innerHTML = `
            <input type="number" class="credit-amount" placeholder="Amount" step="0.01" min="0" required>
            <button type="button" class="btn-secondary remove-btn">Remove</button>
        `;
        row.prepend(select);
        creditEntries.appendChild(row);
        addRowEventListeners(row, 'credit');
    }

    // Add event listeners to row buttons
    function addRowEventListeners(row, type) {
        const removeBtn = row.querySelector('.remove-btn');
        const amountInput = row.querySelector(`.${type}-amount`);
        
        removeBtn.addEventListener('click', () => {
            row.remove();
            calculateTotals();
        });
        
        amountInput.addEventListener('input', calculateTotals);
    }

    // Calculate and display totals
    function calculateTotals() {
        let totalDebit = 0;
        let totalCredit = 0;

        document.querySelectorAll('.debit-amount').forEach(input => {
            totalDebit += parseFloat(input.value) || 0;
        });

        document.querySelectorAll('.credit-amount').forEach(input => {
            totalCredit += parseFloat(input.value) || 0;
        });

        totalDebitDisplay.textContent = `PHP ${totalDebit.toFixed(2)}`;
        totalCreditDisplay.textContent = `PHP ${totalCredit.toFixed(2)}`;
    }

 // Function to render entries table
function renderEntriesTable() {
    entriesTableBody.innerHTML = '';
    
    // Sort entries by date (newest first)
    journalEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    journalEntries.forEach((entry, index) => {
        // Create a row for each debit entry
        entry.debits.forEach((debitItem, debitIndex) => {
            const row = document.createElement('tr');
            
            // Date cell (only show for first debit entry)
            const dateCell = document.createElement('td');
            if (debitIndex === 0) {
                dateCell.textContent = new Date(entry.date).toLocaleDateString();
                dateCell.rowSpan = entry.debits.length + entry.credits.length;
            }
            
            // Account Title cell
            const accountCell = document.createElement('td');
            const account = accounts.find(acc => acc.no === debitItem.account);
            accountCell.textContent = account ? account.description : debitItem.account;
            
            // Debit amount cell
            const debitCell = document.createElement('td');
            debitCell.textContent = `PHP ${parseFloat(debitItem.amount).toFixed(2)}`;
            
            // Credit amount cell (empty for debit entries)
            const creditCell = document.createElement('td');
            
            // Particular cell (only show for first debit entry)
            const particularCell = document.createElement('td');
            if (debitIndex === 0) {
                particularCell.textContent = entry.particular;
                particularCell.rowSpan = entry.debits.length + entry.credits.length;
            }
            
            // Action cell (only show for first debit entry)
            const actionCell = document.createElement('td');
            if (debitIndex === 0) {
                const removeBtn = document.createElement('a');
                removeBtn.href = '#';
                removeBtn.textContent = 'Remove';
                removeBtn.classList.add('remove-btn');
                removeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    removeEntry(index);
                });
                actionCell.appendChild(removeBtn);
                actionCell.rowSpan = entry.debits.length + entry.credits.length;
            }
            
            // Append all cells to the row
            if (debitIndex === 0) {
                row.appendChild(dateCell);
            }
            row.appendChild(accountCell);
            row.appendChild(debitCell);
            row.appendChild(creditCell);
            if (debitIndex === 0) {
                row.appendChild(particularCell);
                row.appendChild(actionCell);
            }
            
            // Add row to table
            entriesTableBody.appendChild(row);
        });
        
        // Create a row for each credit entry
        entry.credits.forEach((creditItem, creditIndex) => {
            const row = document.createElement('tr');
            
            // Account Title cell
            const accountCell = document.createElement('td');
            const account = accounts.find(acc => acc.no === creditItem.account);
            accountCell.textContent = account ? account.description : creditItem.account;
            
            // Debit amount cell (empty for credit entries)
            const debitCell = document.createElement('td');
            
            // Credit amount cell
            const creditCell = document.createElement('td');
            creditCell.textContent = `PHP ${parseFloat(creditItem.amount).toFixed(2)}`;
            
            // Append cells to the row
            row.appendChild(accountCell);
            row.appendChild(debitCell);
            row.appendChild(creditCell);
            
            // Add row to table
            entriesTableBody.appendChild(row);
        });
        
        // Add a total row
        const totalRow = document.createElement('tr');
        totalRow.classList.add('total-row');
        
        const totalLabelCell = document.createElement('td');
        totalLabelCell.colSpan = 2;
        totalLabelCell.textContent = 'Total record';
        
        const totalDebitCell = document.createElement('td');
        totalDebitCell.textContent = `PHP ${entry.totalDebit.toFixed(2)}`;
        
        const totalCreditCell = document.createElement('td');
        totalCreditCell.textContent = `PHP ${entry.totalCredit.toFixed(2)}`;
        
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 2;
        
        totalRow.appendChild(totalLabelCell);
        totalRow.appendChild(totalDebitCell);
        totalRow.appendChild(totalCreditCell);
        totalRow.appendChild(emptyCell);
        
        entriesTableBody.appendChild(totalRow);
    });
}
    
    // Function to add a new entry
    function addEntry(event) {
        event.preventDefault();
        
        // Get basic info
        const type = document.getElementById('entry-type').value;
        const date = document.getElementById('date').value;
        const particular = document.getElementById('particular').value;
        
        // Validate required fields
        if (!date || !particular) {
            alert('Please fill in all required fields (Date and Particular)');
            return;
        }
        
        // Process debit entries
        const debits = [];
        document.querySelectorAll('.debit-row').forEach(row => {
            const accountNo = row.querySelector('.debit-account').value;
            const amount = parseFloat(row.querySelector('.debit-amount').value);
            
            if (accountNo && amount) {
                const account = accounts.find(acc => acc.no === accountNo);
                debits.push({
                    account: accountNo,
                    amount
                });
            }
        });
        
        // Process credit entries
        const credits = [];
        document.querySelectorAll('.credit-row').forEach(row => {
            const accountNo = row.querySelector('.credit-account').value;
            const amount = parseFloat(row.querySelector('.credit-amount').value);
            
            if (accountNo && amount) {
                const account = accounts.find(acc => acc.no === accountNo);
                credits.push({
                    account: accountNo,
                    amount
                });
            }
        });
        
        // Validate at least one debit and one credit
        if (debits.length === 0 || credits.length === 0) {
            alert('Please add at least one debit and one credit entry');
            return;
        }
        
        // Check for duplicate accounts in the same entry
        const allAccounts = [...debits.map(d => d.account), ...credits.map(c => c.account)];
        const uniqueAccounts = [...new Set(allAccounts)];
        
        if (allAccounts.length !== uniqueAccounts.length) {
            alert('Error: The same account cannot be used multiple times in a single entry');
            return;
        }
        
        // Calculate totals and validate balance
        const totalDebit = debits.reduce((sum, entry) => sum + entry.amount, 0);
        const totalCredit = credits.reduce((sum, entry) => sum + entry.amount, 0);
        
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            alert(`Debits and credits must balance. Current difference: PHP ${Math.abs(totalDebit - totalCredit).toFixed(2)}`);
            return;
        }
        
        // Add new entry
        journalEntries.push({
            type,
            date,
            particular,
            debits,
            credits,
            totalDebit,
            totalCredit
        });
        
        // Save to localStorage
        localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
        
        // Refresh the table
        renderEntriesTable();
        
        // Reset the form
        resetForm();
    }
    
    // Function to reset the form
    function resetForm() {
        entryForm.reset();
        document.getElementById('date').valueAsDate = new Date();
        debitEntries.innerHTML = '<h4>Debit Entries</h4>';
        creditEntries.innerHTML = '<h4>Credit Entries</h4>';
        addDebitRow();
        addCreditRow();
        calculateTotals();
    }
    
    // Function to remove an entry
    function removeEntry(index) {
        if (confirm('Are you sure you want to remove this entry?')) {
            journalEntries.splice(index, 1);
            localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
            renderEntriesTable();
        }
    }
    
    // Function to reset all entries
    function resetAllEntries() {
        if (confirm('Are you sure you want to delete ALL journal entries? This cannot be undone.')) {
            journalEntries = [];
            localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
            renderEntriesTable();
        }
    }
    
    // Function to update account dropdowns when accounts change
    function updateAccountDropdowns() {
        accounts = JSON.parse(localStorage.getItem('chartOfAccounts')) || [];
        
        document.querySelectorAll('.debit-account, .credit-account').forEach(select => {
            const currentValue = select.value;
            const isRequired = select.required;
            
            select.innerHTML = '<option value="">Select Account</option>';
            accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.no;
                option.textContent = `${account.no} - ${account.description}`;
                select.appendChild(option);
            });
            
            select.value = currentValue;
            select.required = isRequired;
        });
    }
    
    // Event listeners
    entryForm.addEventListener('submit', addEntry);
    resetEntriesBtn.addEventListener('click', resetAllEntries);
    addDebitBtn.addEventListener('click', addDebitRow);
    addCreditBtn.addEventListener('click', addCreditRow);
    entryForm.addEventListener('reset', resetForm);
    
    // Listen for storage events to update accounts
    window.addEventListener('storage', function(e) {
        if (e.key === 'chartOfAccounts') {
            updateAccountDropdowns();
        }
    });
    
    // Initialize
    document.getElementById('date').valueAsDate = new Date();
    resetForm();
    renderEntriesTable();
    
    // Update accounts periodically in case of changes
    setInterval(updateAccountDropdowns, 1000);
});