document.addEventListener('DOMContentLoaded', function() {
    // Handle financial statement dropdown navigation
    const financialLinks = document.querySelectorAll('.dropdown-content a');
    
    financialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Hide all sections
            document.querySelectorAll('section').forEach(section => {
                section.classList.add('hidden');
            });
            
            // Show selected section
            document.getElementById(targetId).classList.remove('hidden');
        });
    });
    
    // Show income statement by default
    document.getElementById('income-statement').classList.remove('hidden');
});