document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const accountFilter = document.getElementById('account-filter');
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');
    const applyFilterBtn = document.getElementById('apply-filter');
    const resetFilterBtn = document.getElementById('reset-filter');
    const ledgerEntries = document.getElementById('ledger-entries');
    
    // Set default dates (current month)
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    dateFrom.valueAsDate = firstDayOfMonth;
    dateTo.valueAsDate = today;
    
    // Load data from localStorage
    function loadData() {
        const accounts = JSON.parse(localStorage.getItem('chartOfAccounts')) || [];
        const journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];
        return { accounts, journalEntries };
    }
    
    // Populate account filter dropdown
    function populateAccountFilter() {
        const { accounts } = loadData();
        accountFilter.innerHTML = '<option value="">All Accounts</option>';
        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.no;
            option.textContent = `${account.no} - ${account.description}`;
            accountFilter.appendChild(option);
        });
    }
    
    // Generate ledger entries grouped by account
    function generateLedger() {
        const { accounts, journalEntries } = loadData();
        const selectedAccount = accountFilter.value;
        const fromDate = dateFrom.value ? new Date(dateFrom.value) : null;
        const toDate = dateTo.value ? new Date(dateTo.value) : null;
        
        // Clear existing entries
        ledgerEntries.innerHTML = '';
        
        // Get accounts to display
        const displayAccounts = selectedAccount 
            ? accounts.filter(account => account.no === selectedAccount)
            : accounts;
        
        if (displayAccounts.length === 0) {
            const noData = document.createElement('div');
            noData.className = 'no-data-message';
            noData.textContent = 'No accounts found';
            ledgerEntries.appendChild(noData);
            return;
        }
        
        // Process each account
        displayAccounts.forEach(account => {
            // Filter entries for this account
            const accountEntries = [];
            let accountBalance = 0;
            
            journalEntries.forEach(entry => {
                const entryDate = new Date(entry.date);
                
                // Check date range filter
                if ((fromDate && entryDate < fromDate) || (toDate && entryDate > toDate)) {
                    return;
                }
                
                // Process debits
                entry.debits.forEach(debit => {
                    if (debit.account === account.no) {
                        accountBalance += parseFloat(debit.amount);
                        accountEntries.push({
                            date: entry.date,
                            type: entry.type,
                            description: entry.particular,
                            reference: '',
                            debit: parseFloat(debit.amount),
                            credit: 0,
                            balance: accountBalance
                        });
                    }
                });
                
                // Process credits
                entry.credits.forEach(credit => {
                    if (credit.account === account.no) {
                        accountBalance -= parseFloat(credit.amount);
                        accountEntries.push({
                            date: entry.date,
                            type: entry.type,
                            description: entry.particular,
                            reference: '',
                            debit: 0,
                            credit: parseFloat(credit.amount),
                            balance: accountBalance
                        });
                    }
                });
            });
            
            // Create account section
            const accountSection = document.createElement('div');
            accountSection.className = 'account-section';
            
            const accountTitle = document.createElement('div');
            accountTitle.className = 'account-title';
            accountTitle.textContent = `${account.description} (Account No. ${account.no})`;
            accountSection.appendChild(accountTitle);
            
            if (accountEntries.length === 0) {
                const noEntries = document.createElement('div');
                noEntries.className = 'no-entries';
                noEntries.textContent = 'No entries found for this account';
                accountSection.appendChild(noEntries);
            } else {
                // Create table
                const table = document.createElement('table');
                
                // Create header
                const thead = document.createElement('thead');
                thead.innerHTML = `
                    <tr>
                        <th>Date</th>
                        <th>Particular</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>Balance</th>
                    </tr>
                `;
                table.appendChild(thead);
                
                // Create body
                const tbody = document.createElement('tbody');
                
                // Sort entries by date
                accountEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
                
                // Add entries
                accountEntries.forEach(entry => {
                    const row = document.createElement('tr');
                    
                    const dateCell = document.createElement('td');
                    dateCell.textContent = new Date(entry.date).toLocaleDateString();
                    
                    const descCell = document.createElement('td');
                    descCell.textContent = entry.description;
                    
                    const debitCell = document.createElement('td');
                    debitCell.textContent = entry.debit > 0 ? formatCurrency(entry.debit) : '';
                    debitCell.className = 'amount debit';
                    
                    const creditCell = document.createElement('td');
                    creditCell.textContent = entry.credit > 0 ? formatCurrency(entry.credit) : '';
                    creditCell.className = 'amount credit';
                    
                    const balanceCell = document.createElement('td');
                    balanceCell.textContent = formatCurrency(entry.balance);
                    balanceCell.className = 'amount balance';
                    
                    row.appendChild(dateCell);
                    row.appendChild(descCell);
                    row.appendChild(debitCell);
                    row.appendChild(creditCell);
                    row.appendChild(balanceCell);
                    
                    tbody.appendChild(row);
                });
                
                table.appendChild(tbody);
                accountSection.appendChild(table);
            }
            
            ledgerEntries.appendChild(accountSection);
        });
    }
    
    // Format currency
    function formatCurrency(amount) {
        return 'PHP ' + parseFloat(amount).toFixed(2);
    }
    
    // Event listeners
    applyFilterBtn.addEventListener('click', generateLedger);
    resetFilterBtn.addEventListener('click', function() {
        accountFilter.value = '';
        dateFrom.valueAsDate = firstDayOfMonth;
        dateTo.valueAsDate = today;
        generateLedger();
    });
    
    // Listen for storage events to update when data changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'journalEntries' || e.key === 'chartOfAccounts') {
            populateAccountFilter();
            generateLedger();
        }
    });
    
    // Check for changes in localStorage periodically
    function checkForChanges() {
        const currentJournalEntries = localStorage.getItem('journalEntries');
        const currentChartOfAccounts = localStorage.getItem('chartOfAccounts');
        
        if (checkForChanges.lastJournalEntries !== currentJournalEntries || 
            checkForChanges.lastChartOfAccounts !== currentChartOfAccounts) {
            
            populateAccountFilter();
            generateLedger();
            
            checkForChanges.lastJournalEntries = currentJournalEntries;
            checkForChanges.lastChartOfAccounts = currentChartOfAccounts;
        }
    }
    
    // Store initial values
    checkForChanges.lastJournalEntries = localStorage.getItem('journalEntries');
    checkForChanges.lastChartOfAccounts = localStorage.getItem('chartOfAccounts');
    
    // Check for changes every 2 seconds
    setInterval(checkForChanges, 2000);
    
    // Initialize
    populateAccountFilter();
    generateLedger();
});