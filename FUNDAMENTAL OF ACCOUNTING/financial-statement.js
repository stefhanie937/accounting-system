document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const statementPeriod = document.getElementById('statement-period');
    const statementDate = document.getElementById('statement-date');
    const generateBtn = document.getElementById('generate-statement');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const incomeStatement = document.getElementById('income-statement');
    const balanceSheet = document.getElementById('balance-sheet');
    
    // Set default date to today
    statementDate.valueAsDate = new Date();
    
    // Load data from localStorage
    function loadData() {
        const accounts = JSON.parse(localStorage.getItem('chartOfAccounts')) || [];
        const journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];
        return { accounts, journalEntries };
    }
    
    // Format currency
    function formatCurrency(amount) {
        return 'PHP ' + parseFloat(amount).toFixed(2);
    }
    
    // Generate financial statements
    function generateFinancialStatements() {
        const { accounts, journalEntries } = loadData();
        const period = statementPeriod.value;
        const endDate = new Date(statementDate.value);
        let startDate;
        
        // Determine date range based on period selection
        switch(period) {
            case 'monthly':
                startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
                break;
            case 'quarterly':
                const quarter = Math.floor(endDate.getMonth() / 3);
                startDate = new Date(endDate.getFullYear(), quarter * 3, 1);
                break;
            case 'annual':
                startDate = new Date(endDate.getFullYear(), 0, 1);
                break;
        }
        
        // Update statement period display
        const periodDisplay = period === 'annual' ? 
            `For the Year Ended ${endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` :
            `For the Period ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
        
        document.getElementById('income-statement-period').textContent = periodDisplay;
        document.getElementById('balance-sheet-period').textContent = `As of ${endDate.toLocaleDateString()}`;
        
        // Filter entries by date
        const filteredEntries = journalEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startDate && entryDate <= endDate;
        });
        
        // Initialize account balances
        const accountBalances = {};
        accounts.forEach(account => {
            accountBalances[account.no] = {
                no: account.no,
                description: account.description,
                type: account.type,
                category: account.category,
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
        
        // Calculate net balances
        const accountsWithBalances = Object.values(accountBalances).map(account => {
            const balance = account.type === 'asset' || account.type === 'expense' ? 
                account.debit - account.credit : 
                account.credit - account.debit;
            return {
                ...account,
                balance: balance > 0 ? balance : 0
            };
        });
        
        // Generate Income Statement
        generateIncomeStatement(accountsWithBalances);
        
        // Generate Balance Sheet
        generateBalanceSheet(accountsWithBalances);
    }
    
    // Generate Income Statement
    function generateIncomeStatement(accounts) {
        // Revenue accounts (type = income)
        const revenueAccounts = accounts.filter(account => account.type === 'income');
        const revenueTable = document.getElementById('revenue-table').querySelector('tbody');
        revenueTable.innerHTML = '';
        
        let totalRevenue = 0;
        revenueAccounts.forEach(account => {
            if (account.balance > 0) {
                const row = document.createElement('tr');
                
                const descCell = document.createElement('td');
                descCell.textContent = account.description;
                
                const amountCell = document.createElement('td');
                amountCell.textContent = formatCurrency(account.balance);
                amountCell.className = 'amount';
                
                row.appendChild(descCell);
                row.appendChild(amountCell);
                revenueTable.appendChild(row);
                
                totalRevenue += account.balance;
            }
        });
        
        document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);
        
        // Expense accounts (type = expense)
        const expenseAccounts = accounts.filter(account => account.type === 'expense');
        const expensesTable = document.getElementById('expenses-table').querySelector('tbody');
        expensesTable.innerHTML = '';
        
        let totalExpenses = 0;
        expenseAccounts.forEach(account => {
            if (account.balance > 0) {
                const row = document.createElement('tr');
                
                const descCell = document.createElement('td');
                descCell.textContent = account.description;
                
                const amountCell = document.createElement('td');
                amountCell.textContent = formatCurrency(account.balance);
                amountCell.className = 'amount';
                
                row.appendChild(descCell);
                row.appendChild(amountCell);
                expensesTable.appendChild(row);
                
                totalExpenses += account.balance;
            }
        });
        
        document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
        
        // Net Income
        const netIncome = totalRevenue - totalExpenses;
        document.getElementById('net-income').textContent = formatCurrency(netIncome);
    }
    
    // Generate Balance Sheet
    function generateBalanceSheet(accounts) {
        // Asset accounts (type = asset)
        const assetAccounts = accounts.filter(account => account.type === 'asset');
        const assetsTable = document.getElementById('assets-table').querySelector('tbody');
        assetsTable.innerHTML = '';
        
        let totalAssets = 0;
        assetAccounts.forEach(account => {
            if (account.balance > 0) {
                const row = document.createElement('tr');
                
                const descCell = document.createElement('td');
                descCell.textContent = account.description;
                
                const amountCell = document.createElement('td');
                amountCell.textContent = formatCurrency(account.balance);
                amountCell.className = 'amount';
                
                row.appendChild(descCell);
                row.appendChild(amountCell);
                assetsTable.appendChild(row);
                
                totalAssets += account.balance;
            }
        });
        
        document.getElementById('total-assets').textContent = formatCurrency(totalAssets);
        
        // Liability accounts (type = liability)
        const liabilityAccounts = accounts.filter(account => account.type === 'liability');
        const liabilitiesTable = document.getElementById('liabilities-table').querySelector('tbody');
        liabilitiesTable.innerHTML = '';
        
        let totalLiabilities = 0;
        liabilityAccounts.forEach(account => {
            if (account.balance > 0) {
                const row = document.createElement('tr');
                
                const descCell = document.createElement('td');
                descCell.textContent = account.description;
                
                const amountCell = document.createElement('td');
                amountCell.textContent = formatCurrency(account.balance);
                amountCell.className = 'amount';
                
                row.appendChild(descCell);
                row.appendChild(amountCell);
                liabilitiesTable.appendChild(row);
                
                totalLiabilities += account.balance;
            }
        });
        
        document.getElementById('total-liabilities').textContent = formatCurrency(totalLiabilities);
        
        // Equity accounts (type = equity)
        const equityAccounts = accounts.filter(account => account.type === 'equity');
        const equityTable = document.getElementById('equity-table').querySelector('tbody');
        equityTable.innerHTML = '';
        
        let totalEquity = 0;
        equityAccounts.forEach(account => {
            if (account.balance > 0) {
                const row = document.createElement('tr');
                
                const descCell = document.createElement('td');
                descCell.textContent = account.description;
                
                const amountCell = document.createElement('td');
                amountCell.textContent = formatCurrency(account.balance);
                amountCell.className = 'amount';
                
                row.appendChild(descCell);
                row.appendChild(amountCell);
                equityTable.appendChild(row);
                
                totalEquity += account.balance;
            }
        });
        
        // Add net income to equity (from income statement)
        const netIncome = parseFloat(document.getElementById('net-income').textContent.replace(/[^0-9.-]+/g,""));
        totalEquity += netIncome;
        
        const netIncomeRow = document.createElement('tr');
        netIncomeRow.innerHTML = `
            <td>Net Income</td>
            <td class="amount">${formatCurrency(netIncome)}</td>
        `;
        equityTable.appendChild(netIncomeRow);
        
        document.getElementById('total-equity').textContent = formatCurrency(totalEquity);
        document.getElementById('total-liabilities-equity').textContent = formatCurrency(totalLiabilities + totalEquity);
    }
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding statement
            const statement = this.dataset.statement;
            incomeStatement.style.display = statement === 'income' ? 'block' : 'none';
            balanceSheet.style.display = statement === 'balance' ? 'block' : 'none';
        });
    });
    
    // Generate statement button
    generateBtn.addEventListener('click', generateFinancialStatements);
    
    // Listen for storage events to update when data changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'journalEntries' || e.key === 'chartOfAccounts') {
            generateFinancialStatements();
        }
    });
    
    // Check for changes in localStorage periodically
    function checkForChanges() {
        const currentJournalEntries = localStorage.getItem('journalEntries');
        const currentChartOfAccounts = localStorage.getItem('chartOfAccounts');
        
        if (checkForChanges.lastJournalEntries !== currentJournalEntries || 
            checkForChanges.lastChartOfAccounts !== currentChartOfAccounts) {
            
            generateFinancialStatements();
            
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
    generateFinancialStatements();
});