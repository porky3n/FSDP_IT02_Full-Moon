document.addEventListener('DOMContentLoaded', async function () {
    const userList = document.getElementById('user-list');
    const searchInput = document.getElementById('searchInput');
    const filterOptions = document.querySelectorAll('.filter-option');

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
                    <button class="btn btn-primary btn-sm edit-btn" data-parent-id="${parent.ParentID}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-parent-id="${parent.ParentID}">Delete</button>
                    ${parent.HasChildren === 'true' ? `
                        <button class="btn expand-btn btn-footer-color">Expand</button>
                        <div class="dropdown-content" style="display: none;">
                            ${children.filter(child => child.ParentID === parent.ParentID).map(child => `
                                <div class="child-info-box" data-child-id="${child.ChildID}">
                                    <p><strong>Child:</strong> ${child.FirstName} ${child.LastName}</p>
                                    <p><strong>DOB:</strong> ${new Date(child.DateOfBirth).toLocaleDateString()}</p>
                                    <p><strong>School:</strong> ${child.School || 'N/A'}</p>
                                    <p><strong>Dietary:</strong> ${child.Dietary || 'N/A'}</p>
                                    <button class="btn btn-primary btn-sm edit-child-btn" data-child-id="${child.ChildID}">Edit</button>
                                    <button class="btn btn-danger btn-sm delete-child-btn" data-child-id="${child.ChildID}">Delete</button>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </td>
            `;
            userList.appendChild(row);
        });

        addEventListeners();
    }

    function addEventListeners() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const parentId = this.getAttribute('data-parent-id');
                openEditModal(parentId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const parentId = this.getAttribute('data-parent-id');
                confirmDelete(parentId, 'parent');
            });
        });

        document.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const dropdownContent = this.nextElementSibling;
                if (dropdownContent.style.display === 'block') {
                    dropdownContent.style.display = 'none';
                    this.textContent = 'Expand';
                } else {
                    dropdownContent.style.display = 'block';
                    this.textContent = 'Collapse';
                }
            });
        });

        document.querySelectorAll('.edit-child-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const childId = this.getAttribute('data-child-id');
                openEditChildModal(childId);
            });
        });

        document.querySelectorAll('.delete-child-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const childId = this.getAttribute('data-child-id');
                confirmDelete(childId, 'child');
            });
        });

        document.getElementById('editParentForm').addEventListener('submit', handleEditParent);
        document.getElementById('editChildForm').addEventListener('submit', handleEditChild);

        searchInput.addEventListener('input', filterBySearch);
        filterOptions.forEach(option => {
            option.addEventListener('click', filterByOption);
        });
    }

    function filterBySearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = document.querySelectorAll('#user-list tr');

        rows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            row.style.display = rowText.includes(searchTerm) ? '' : 'none';
        });
    }

    function filterByOption() {
        const filterType = this.getAttribute('data-filter');
        const rows = document.querySelectorAll('#user-list tr');

        rows.forEach(row => {
            const memberType = row.getAttribute('data-member');
            const hasChildren = row.getAttribute('data-has-children');

            if (filterType === 'member' || filterType === 'non-member') {
                row.style.display = (memberType === filterType) ? '' : 'none';
            }

            if (filterType === 'has-children' || filterType === 'no-children') {
                row.style.display = (
                    (filterType === 'has-children' && hasChildren === 'true') ||
                    (filterType === 'no-children' && hasChildren === 'false')
                ) ? '' : 'none';
            }
        });
    }

    async function openEditModal(parentId) {
        try {
            const response = await fetch(`/auth/get-parent/${parentId}`);
            const parent = await response.json();

            if (response.ok) {
                document.getElementById('editParentID').value = parent.ParentID;
                document.getElementById('editFirstName').value = parent.FirstName;
                document.getElementById('editLastName').value = parent.LastName;
                document.getElementById('editDOB').value = new Date(parent.DateOfBirth).toISOString().split('T')[0];
                document.getElementById('editContactNumber').value = parent.ContactNumber;
                document.getElementById('editDietary').value = parent.Dietary || '';

                const editModal = new bootstrap.Modal(document.getElementById('editParentModal'));
                editModal.show();
            } else {
                alert('Failed to fetch parent data');
            }
        } catch (error) {
            console.error('Error fetching parent data:', error);
        }
    }

    async function handleEditParent(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const parentId = formData.get('parentID');

        try {
            const response = await fetch(`/auth/update-parent/${parentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            if (response.ok) {
                alert('Parent updated successfully');
                location.reload();
            } else {
                alert('Failed to update parent');
            }
        } catch (error) {
            console.error('Error updating parent:', error);
        }
    }

    async function openEditChildModal(childId) {
        try {
            const response = await fetch(`/auth/get-child/${childId}`);
            const child = await response.json();

            if (response.ok) {
                document.getElementById('editChildID').value = child.ChildID;
                document.getElementById('editChildFirstName').value = child.FirstName;
                document.getElementById('editChildLastName').value = child.LastName;
                document.getElementById('editChildDOB').value = new Date(child.DateOfBirth).toISOString().split('T')[0];
                document.getElementById('editChildSchool').value = child.School || '';
                document.getElementById('editChildDietary').value = child.Dietary || '';

                const editChildModal = new bootstrap.Modal(document.getElementById('editChildModal'));
                editChildModal.show();
            } else {
                alert('Failed to fetch child data');
            }
        } catch (error) {
            console.error('Error fetching child data:', error);
        }
    }

    async function handleEditChild(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const childId = formData.get('childID');

        try {
            const response = await fetch(`/auth/update-child/${childId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            if (response.ok) {
                alert('Child updated successfully');
                location.reload();
            } else {
                alert('Failed to update child');
            }
        } catch (error) {
            console.error('Error updating child:', error);
        }
    }

    function confirmDelete(identifier, type) {
        if (confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
            if (type === 'parent') {
                deleteParent(identifier);
            } else if (type === 'child') {
                deleteChild(identifier);
            }
        }
    }

    async function deleteParent(parentId) {
        try {
            const response = await fetch(`/auth/delete-parent`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ parentId })
            });

            if (response.ok) {
                alert('Parent deleted successfully');
                document.querySelector(`tr[data-parent-id="${parentId}"]`).remove();
            } else {
                alert('Failed to delete parent');
            }
        } catch (error) {
            console.error('Error deleting parent:', error);
        }
    }

    async function deleteChild(childId) {
        try {
            const response = await fetch(`/auth/delete-child/${childId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Child deleted successfully');
                document.querySelector(`[data-child-id="${childId}"]`).closest('.child-info-box').remove();
            } else {
                alert('Failed to delete child');
            }
        } catch (error) {
            console.error('Error deleting child:', error);
            alert('An error occurred. Please try again later.');
        }
    }

    await fetchUserData();
});
