document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // 1. Configuration & DOM
    // ======================
    const statementPeriod = document.getElementById('statement-period');
    const statementDate = document.getElementById('statement-date');
    const generateBtn = document.getElementById('generate-statement');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const incomeStatement = document.getElementById('income-statement');
    const balanceSheet = document.getElementById('balance-sheet');

    // Cache for performance
    let cachedAccounts = null;
    let cachedEntries = null;

    // Set default date to today
    statementDate.valueAsDate = new Date();

    // ======================
    // 2. Core Functions
    // ======================

    /** Load data from localStorage with caching */
    function loadData() {
        if (!cachedAccounts || !cachedEntries) {
            cachedAccounts = JSON.parse(localStorage.getItem('chartOfAccounts')) || [];
            cachedEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];
        }
        return { accounts: cachedAccounts, journalEntries: cachedEntries };
    }

    /** Validate journal entries (double-entry accounting) */
    function validateJournalEntries(entries) {
        const invalidEntries = entries.filter(entry => {
            const totalDebits = entry.debits.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
            const totalCredits = entry.credits.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
            return Math.abs(totalDebits - totalCredits) > 0.01; // Allow for floating-point rounding
        });

        if (invalidEntries.length > 0) {
            console.error("Invalid journal entries (debits ≠ credits):", invalidEntries);
            alert(`Error: ${invalidEntries.length} journal entries are unbalanced. Fix them first.`);
            return false;
        }
        return true;
    }

    /** Format currency with PHP symbol */
    function formatCurrency(amount) {
        return 'PHP ' + parseFloat(amount || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    // ======================
    // 3. Statement Generation
    // ======================

    /** Generate financial statements */
    function generateFinancialStatements() {
        const { accounts, journalEntries } = loadData();

        // Validate data before processing
        if (!validateJournalEntries(journalEntries)) return;

        // Date range calculation
        const period = statementPeriod.value;
        const endDate = new Date(statementDate.value);
        let startDate;

        switch (period) {
            case 'monthly': startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1); break;
            case 'quarterly':
                const quarter = Math.floor(endDate.getMonth() / 3);
                startDate = new Date(endDate.getFullYear(), quarter * 3, 1);
                break;
            case 'annual': startDate = new Date(endDate.getFullYear(), 0, 1); break;
        }

        // Update UI period display
        const periodDisplay = period === 'annual' ?
            `For the Year Ended ${endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` :
            `For the Period ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;

        document.getElementById('income-statement-period').textContent = periodDisplay;
        document.getElementById('balance-sheet-period').textContent = `As of ${endDate.toLocaleDateString()}`;

        // Filter entries by date range
        const filteredEntries = journalEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startDate && entryDate <= endDate;
        });

        // Calculate account balances
        const accountBalances = {};
        accounts.forEach(account => {
            accountBalances[account.no] = {
                ...account,
                debit: 0,
                credit: 0,
                balance: 0
            };
        });

        filteredEntries.forEach(entry => {
            entry.debits.forEach(debit => {
                if (accountBalances[debit.account]) {
                    accountBalances[debit.account].debit += parseFloat(debit.amount || 0);
                }
            });
            entry.credits.forEach(credit => {
                if (accountBalances[credit.account]) {
                    accountBalances[credit.account].credit += parseFloat(credit.amount || 0);
                }
            });
        });

        // Calculate net balances
        const accountsWithBalances = Object.values(accountBalances).map(account => {
            let balance;
            switch (account.type) {
                case 'asset':
                case 'expense':
                    balance = account.debit - account.credit;
                    break;
                case 'liability':
                case 'equity':
                case 'income':
                    balance = account.credit - account.debit;
                    break;
                default:
                    console.warn(`Unknown account type: ${account.type} for account ${account.no}`);
                    balance = 0;
            }
            return { ...account, balance: Math.max(balance, 0) }; // Prevent negative display
        });

        // Generate statements
        generateIncomeStatement(accountsWithBalances);
        generateBalanceSheet(accountsWithBalances);
    }

    /** Generate Income Statement */
    function generateIncomeStatement(accounts) {
        // Revenue
        const revenueAccounts = accounts.filter(account => account.type === 'income');
        const revenueTable = document.getElementById('revenue-table').querySelector('tbody');
        revenueTable.innerHTML = '';
        let totalRevenue = 0;

        revenueAccounts.forEach(account => {
            if (account.balance > 0) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${account.description}</td>
                    <td class="amount">${formatCurrency(account.balance)}</td>
                `;
                revenueTable.appendChild(row);
                totalRevenue += account.balance;
            }
        });
        document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);

        // Expenses
        const expenseAccounts = accounts.filter(account => account.type === 'expense');
        const expensesTable = document.getElementById('expenses-table').querySelector('tbody');
        expensesTable.innerHTML = '';
        let totalExpenses = 0;

        expenseAccounts.forEach(account => {
            if (account.balance > 0) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${account.description}</td>
                    <td class="amount">${formatCurrency(account.balance)}</td>
                `;
                expensesTable.appendChild(row);
                totalExpenses += account.balance;
            }
        });
        document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);

        // Net Income
        const netIncome = totalRevenue - totalExpenses;
        document.getElementById('net-income').textContent = formatCurrency(netIncome);
    }

    /** Generate Balance Sheet */
    function generateBalanceSheet(accounts) {
        // Assets
        const assetAccounts = accounts.filter(account => account.type === 'asset');
        const assetsTable = document.getElementById('assets-table').querySelector('tbody');
        assetsTable.innerHTML = '';
        let totalAssets = 0;

        assetAccounts.forEach(account => {
            if (account.balance > 0) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${account.description}</td>
                    <td class="amount">${formatCurrency(account.balance)}</td>
                `;
                assetsTable.appendChild(row);
                totalAssets += account.balance;
            }
        });
        document.getElementById('total-assets').textContent = formatCurrency(totalAssets);

        // Liabilities
        const liabilityAccounts = accounts.filter(account => account.type === 'liability');
        const liabilitiesTable = document.getElementById('liabilities-table').querySelector('tbody');
        liabilitiesTable.innerHTML = '';
        let totalLiabilities = 0;

        liabilityAccounts.forEach(account => {
            if (account.balance > 0) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${account.description}</td>
                    <td class="amount">${formatCurrency(account.balance)}</td>
                `;
                liabilitiesTable.appendChild(row);
                totalLiabilities += account.balance;
            }
        });
        document.getElementById('total-liabilities').textContent = formatCurrency(totalLiabilities);

        // Equity (including net income)
        const equityAccounts = accounts.filter(account => account.type === 'equity');
        const equityTable = document.getElementById('equity-table').querySelector('tbody');
        equityTable.innerHTML = '';
        let totalEquity = 0;

        equityAccounts.forEach(account => {
            if (account.balance > 0) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${account.description}</td>
                    <td class="amount">${formatCurrency(account.balance)}</td>
                `;
                equityTable.appendChild(row);
                totalEquity += account.balance;
            }
        });

        // Add net income to equity
        const netIncome = parseFloat(document.getElementById('net-income').textContent.replace(/[^0-9.-]+/g, ''));
        if (netIncome !== 0) {
            const netIncomeRow = document.createElement('tr');
            netIncomeRow.innerHTML = `
                <td>${netIncome > 0 ? 'Net Income' : 'Net Loss'}</td>
                <td class="amount">${formatCurrency(netIncome)}</td>
            `;
            equityTable.appendChild(netIncomeRow);
            totalEquity += netIncome;
        }

        document.getElementById('total-equity').textContent = formatCurrency(totalEquity);
        document.getElementById('total-liabilities-equity').textContent = formatCurrency(totalLiabilities + totalEquity);
    }

    // ======================
    // 4. Event Listeners
    // ======================
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            incomeStatement.style.display = this.dataset.statement === 'income' ? 'block' : 'none';
            balanceSheet.style.display = this.dataset.statement === 'balance' ? 'block' : 'none';
        });
    });

    generateBtn.addEventListener('click', generateFinancialStatements);

    // ======================
    // 5. Auto-Refresh Logic
    // ======================
    function checkForChanges() {
        const currentAccounts = localStorage.getItem('chartOfAccounts');
        const currentEntries = localStorage.getItem('journalEntries');

        if (currentAccounts !== cachedAccounts || currentEntries !== cachedEntries) {
            cachedAccounts = JSON.parse(currentAccounts);
            cachedEntries = JSON.parse(currentEntries);
            generateFinancialStatements();
        }
    }

    // Check every 5 seconds (less aggressive than 2s)
    setInterval(checkForChanges, 5000);

    // Initial load
    generateFinancialStatements();
});