document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const trialBalance = document.getElementById('trial-balance');
    const adjustedTrialBalance = document.getElementById('adjusted-trial-balance');
    const balanceDateInput = document.getElementById('balance-date');
    const adjustedBalanceDateInput = document.getElementById('adjusted-balance-date');
    const applyDateBtn = document.getElementById('apply-date');
    const applyAdjustedDateBtn = document.getElementById('apply-adjusted-date');
    const trialBalanceBody = document.getElementById('trial-balance-body');
    const adjustedTrialBalanceBody = document.getElementById('adjusted-trial-balance-body');
    const trialBalanceDebitTotal = document.getElementById('trial-balance-debit-total');
    const trialBalanceCreditTotal = document.getElementById('trial-balance-credit-total');
    const adjustedBalanceDebitTotal = document.getElementById('adjusted-balance-debit-total');
    const adjustedBalanceCreditTotal = document.getElementById('adjusted-balance-credit-total');
    
    // Set default date to today
    const today = new Date();
    balanceDateInput.valueAsDate = today;
    adjustedBalanceDateInput.valueAsDate = today;
    
    // Show trial balance by default
    showTrialBalance();
    
    function showTrialBalance() {
        trialBalance.style.display = 'block';
        adjustedTrialBalance.style.display = 'none';
    }
    
    function showAdjustedTrialBalance() {
        trialBalance.style.display = 'none';
        adjustedTrialBalance.style.display = 'block';
    }
    
    // Load data from localStorage
    function loadData() {
        const accounts = JSON.parse(localStorage.getItem('chartOfAccounts')) || [];
        const journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];
        return { accounts, journalEntries };
    }
    
    // Generate trial balance
    function generateTrialBalance(asOfDate = null) {
        const { accounts, journalEntries } = loadData();
        
        // Filter entries by date if specified
        const filteredEntries = asOfDate 
            ? journalEntries.filter(entry => new Date(entry.date) <= new Date(asOfDate))
            : journalEntries;
        
        // Initialize account balances
        const accountBalances = {};
        accounts.forEach(account => {
            accountBalances[account.no] = { 
                no: account.no,
                description: account.description,
                debit: 0,
                credit: 0
            };
        });
        
        // Process journal entries to calculate account balances
        filteredEntries.forEach(entry => {
            // Process debits
            entry.debits.forEach(debit => {
                if (accountBalances[debit.account]) {
                    accountBalances[debit.account].debit += parseFloat(debit.amount);
                }
            });
            
            // Process credits
            entry.credits.forEach(credit => {
                if (accountBalances[credit.account]) {
                    accountBalances[credit.account].credit += parseFloat(credit.amount);
                }
            });
        });
        
        // Convert to array and filter out accounts with no activity
        const balances = Object.values(accountBalances)
            .filter(account => account.debit > 0 || account.credit > 0);
        
        // Sort by account number
        balances.sort((a, b) => a.no.localeCompare(b.no));
        
        return balances;
    }
    
    // Generate adjusted trial balance (includes adjusting entries)
    function generateAdjustedTrialBalance(asOfDate = null) {
        const { accounts, journalEntries } = loadData();
        
        // Filter entries by date if specified
        const filteredEntries = asOfDate 
            ? journalEntries.filter(entry => new Date(entry.date) <= new Date(asOfDate))
            : journalEntries;
        
        // Initialize account balances
        const accountBalances = {};
        accounts.forEach(account => {
            accountBalances[account.no] = { 
                no: account.no,
                description: account.description,
                debit: 0,
                credit: 0
            };
        });
        
        // Process all journal entries including adjusting entries
        filteredEntries.forEach(entry => {
            // Process debits
            entry.debits.forEach(debit => {
                if (accountBalances[debit.account]) {
                    accountBalances[debit.account].debit += parseFloat(debit.amount);
                }
            });
            
            // Process credits
            entry.credits.forEach(credit => {
                if (accountBalances[credit.account]) {
                    accountBalances[credit.account].credit += parseFloat(credit.amount);
                }
            });
        });
        
        // Convert to array and filter out accounts with no activity
        const balances = Object.values(accountBalances)
            .filter(account => account.debit > 0 || account.credit > 0);
        
        // Sort by account number
        balances.sort((a, b) => a.no.localeCompare(b.no));
        
        return balances;
    }
    
    // Format currency
    function formatCurrency(amount) {
        return 'PHP ' + parseFloat(amount).toFixed(2);
    }
    
    // Render trial balance table
    function renderTrialBalance(asOfDate = null) {
        const balances = generateTrialBalance(asOfDate);
        
        // Clear table body
        trialBalanceBody.innerHTML = '';
        
        if (balances.length === 0) {
            trialBalanceBody.innerHTML = '<tr><td colspan="4" class="no-data-message">No data available. Please add journal entries first.</td></tr>';
            trialBalanceDebitTotal.textContent = formatCurrency(0);
            trialBalanceCreditTotal.textContent = formatCurrency(0);
            return;
        }
        
        // Calculate net balances and totals
        let totalDebit = 0;
        let totalCredit = 0;
        
        balances.forEach(account => {
            // Calculate net balance for display
            let netDebit = 0;
            let netCredit = 0;
            
            if (account.debit > account.credit) {
                netDebit = account.debit - account.credit;
                totalDebit += netDebit;
            } else {
                netCredit = account.credit - account.debit;
                totalCredit += netCredit;
            }
            
            // Create table row
            const row = document.createElement('tr');
            
            const noCell = document.createElement('td');
            noCell.textContent = account.no;
            noCell.setAttribute('data-label', 'Account No.');
            
            const descCell = document.createElement('td');
            descCell.textContent = account.description;
            descCell.setAttribute('data-label', 'Particulars');
            
            const debitCell = document.createElement('td');
            debitCell.textContent = netDebit > 0 ? formatCurrency(netDebit) : '';
            debitCell.setAttribute('data-label', 'Debit');
            
            const creditCell = document.createElement('td');
            creditCell.textContent = netCredit > 0 ? formatCurrency(netCredit) : '';
            creditCell.setAttribute('data-label', 'Credit');
            
            row.appendChild(noCell);
            row.appendChild(descCell);
            row.appendChild(debitCell);
            row.appendChild(creditCell);
            
            trialBalanceBody.appendChild(row);
        });
        
        // Update totals
        trialBalanceDebitTotal.textContent = formatCurrency(totalDebit);
        trialBalanceCreditTotal.textContent = formatCurrency(totalCredit);
    }
    
    // Render adjusted trial balance table
    function renderAdjustedTrialBalance(asOfDate = null) {
        const balances = generateAdjustedTrialBalance(asOfDate);
        
        // Clear table body
        adjustedTrialBalanceBody.innerHTML = '';
        
        if (balances.length === 0) {
            adjustedTrialBalanceBody.innerHTML = '<tr><td colspan="4" class="no-data-message">No data available. Please add journal entries first.</td></tr>';
            adjustedBalanceDebitTotal.textContent = formatCurrency(0);
            adjustedBalanceCreditTotal.textContent = formatCurrency(0);
            return;
        }
        
        // Calculate net balances and totals
        let totalDebit = 0;
        let totalCredit = 0;
        
        balances.forEach(account => {
            // Calculate net balance for display
            let netDebit = 0;
            let netCredit = 0;
            
            if (account.debit > account.credit) {
                netDebit = account.debit - account.credit;
                totalDebit += netDebit;
            } else {
                netCredit = account.credit - account.debit;
                totalCredit += netCredit;
            }
            
            // Create table row
            const row = document.createElement('tr');
            
            const noCell = document.createElement('td');
            noCell.textContent = account.no;
            noCell.setAttribute('data-label', 'Account No.');
            
            const descCell = document.createElement('td');
            descCell.textContent = account.description;
            descCell.setAttribute('data-label', 'Particulars');
            
            const debitCell = document.createElement('td');
            debitCell.textContent = netDebit > 0 ? formatCurrency(netDebit) : '';
            debitCell.setAttribute('data-label', 'Debit');
            
            const creditCell = document.createElement('td');
            creditCell.textContent = netCredit > 0 ? formatCurrency(netCredit) : '';
            creditCell.setAttribute('data-label', 'Credit');
            
            row.appendChild(noCell);
            row.appendChild(descCell);
            row.appendChild(debitCell);
            row.appendChild(creditCell);
            
            adjustedTrialBalanceBody.appendChild(row);
        });
        
        // Update totals
        adjustedBalanceDebitTotal.textContent = formatCurrency(totalDebit);
        adjustedBalanceCreditTotal.textContent = formatCurrency(totalCredit);
    }
    
    // Event listeners for date filters
    applyDateBtn.addEventListener('click', function() {
        renderTrialBalance(balanceDateInput.value);
    });
    
    applyAdjustedDateBtn.addEventListener('click', function() {
        renderAdjustedTrialBalance(adjustedBalanceDateInput.value);
    });
    
    // Listen for storage events to update when data changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'journalEntries' || e.key === 'chartOfAccounts') {
            renderTrialBalance(balanceDateInput.value);
            renderAdjustedTrialBalance(adjustedBalanceDateInput.value);
        }
    });
    
    // Check for changes in localStorage periodically
    function checkForChanges() {
        const currentJournalEntries = localStorage.getItem('journalEntries');
        const currentChartOfAccounts = localStorage.getItem('chartOfAccounts');
        
        if (checkForChanges.lastJournalEntries !== currentJournalEntries || 
            checkForChanges.lastChartOfAccounts !== currentChartOfAccounts) {
            
            renderTrialBalance(balanceDateInput.value);
            renderAdjustedTrialBalance(adjustedBalanceDateInput.value);
            
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
    renderTrialBalance();
    renderAdjustedTrialBalance();
});