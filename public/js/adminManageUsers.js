document.addEventListener('DOMContentLoaded', async function () {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const userList = document.getElementById('user-list');
    const sortOptions = document.querySelectorAll('.sort-option');
    const filterOptions = document.querySelectorAll('.filter-option');

    // Fetch user data from backend
    async function fetchUserData() {
        try {
            const response = await fetch('/auth/get-users');
            const data = await response.json();

            if (response.ok) {
                renderUserTable(data.parentData, data.childData);
            } else {
                console.error('Failed to fetch user data:', data.message);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    // Render user data in the table
    function renderUserTable(parents, children) {
        userList.innerHTML = ''; // Clear existing data
        parents.forEach(parent => {
            const row = document.createElement('tr');
            row.setAttribute('data-member', parent.Membership.toLowerCase());
            row.setAttribute('data-has-children', parent.HasChildren);

            row.innerHTML = `
                <td>${parent.FirstName} ${parent.LastName}</td>
                <td>${new Date(parent.DateOfBirth).toLocaleDateString()}</td>
                <td>${parent.Email}</td>
                <td>${parent.ContactNumber}</td>
                <td>${new Date(parent.DateJoined).toLocaleDateString()}</td>
                <td>${parent.Membership}</td>
                <td>${parent.Dietary || 'N/A'}</td>
                <td class="text-end">
                    ${parent.HasChildren === 'true' ? `
                        <button class="btn expand-btn btn-footer-color">Expand</button>
                        <div class="dropdown-content">
                            ${children.filter(child => child.ParentID === parent.ParentID).map(child => `
                                <div class="child-info-box">
                                    <p><strong>Child:</strong> ${child.FirstName} ${child.LastName}</p>
                                    <p><strong>DOB:</strong> ${new Date(child.DateOfBirth).toLocaleDateString()}</p>
                                    <p><strong>School:</strong> ${child.School || 'N/A'}</p>
                                    <p><strong>Level:</strong> ${child.Level || 'N/A'}</p>
                                    <p><strong>Dietary:</strong> ${child.Dietary || 'N/A'}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </td>
            `;
            userList.appendChild(row);
        });

        // Add expand/collapse event listeners for child details
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
    }

    // Search functionality
    searchButton.addEventListener('click', function () {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = document.querySelectorAll('#user-list tr');
        rows.forEach(row => {
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
            const rowsArray = Array.from(document.querySelectorAll('#user-list tr'));

            rowsArray.sort((a, b) => {
                if (sortBy === 'name') {
                    return a.cells[0].textContent.localeCompare(b.cells[0].textContent);
                } else if (sortBy === 'dateJoined') {
                    const dateA = new Date(a.cells[4].textContent);
                    const dateB = new Date(b.cells[4].textContent);
                    return dateA - dateB;
                }
            });

            rowsArray.forEach(row => userList.appendChild(row));
        });
    });

    // Filter functionality (membership and children)
    filterOptions.forEach(option => {
        option.addEventListener('click', function () {
            const filterType = this.getAttribute('data-filter');
            const rows = document.querySelectorAll('#user-list tr');

            rows.forEach(row => {
                const memberType = row.getAttribute('data-member');
                const hasChildren = row.getAttribute('data-has-children');

                if (filterType === 'member' || filterType === 'non-member') {
                    if (memberType === filterType) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }

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

    // Initial fetch of user data
    await fetchUserData();
});
