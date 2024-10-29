document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const userRows = document.querySelectorAll('#user-list tr');
    const sortOptions = document.querySelectorAll('.sort-option');
    const filterOptions = document.querySelectorAll('.filter-option');

    // Search functionality
    searchButton.addEventListener('click', function () {
        const searchTerm = searchInput.value.toLowerCase();
        userRows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            if (rowText.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Sort functionality
    sortOptions.forEach(option => {
        option.addEventListener('click', function () {
            const sortBy = this.getAttribute('data-sort');
            const rowsArray = Array.from(userRows);

            rowsArray.sort((a, b) => {
                if (sortBy === 'name') {
                    return a.cells[0].textContent.localeCompare(b.cells[0].textContent);
                } else if (sortBy === 'dateJoined') {
                    const dateA = new Date(a.cells[4].textContent);
                    const dateB = new Date(b.cells[4].textContent);
                    return dateA - dateB;
                }
            });

            rowsArray.forEach(row => document.getElementById('user-list').appendChild(row));
        });
    });

    // Filter functionality (membership and children)
    filterOptions.forEach(option => {
        option.addEventListener('click', function () {
            const filterType = this.getAttribute('data-filter');
            userRows.forEach(row => {
                const memberType = row.getAttribute('data-member');
                const hasChildren = row.getAttribute('data-has-children');
                
                // Membership filter
                if (filterType === 'member' || filterType === 'non-member') {
                    if (memberType === filterType) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }

                // Children filter
                if (filterType === 'has-children' || filterType === 'no-children') {
                    if ((filterType === 'has-children' && hasChildren === 'true') ||
                        (filterType === 'no-children' && hasChildren === 'false')) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        });
    });

    // Expand/collapse child details
    const expandButtons = document.querySelectorAll('.expand-btn');
    expandButtons.forEach(button => {
        button.addEventListener('click', function () {
            const dropdownContent = this.nextElementSibling;
            if (dropdownContent.style.display === "block") {
                dropdownContent.style.display = "none";
                this.textContent = "Expand";
            } else {
                dropdownContent.style.display = "block";
                this.textContent = "Collapse";
            }
        });
    });
});
