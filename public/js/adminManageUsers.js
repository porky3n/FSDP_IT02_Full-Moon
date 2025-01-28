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
            const membershipStartDate = parent.MembershipStartDate
                ? new Date(parent.MembershipStartDate).toLocaleDateString()
                : 'N/A';
    
            let membershipEndDate = 'N/A';
            if (parent.MembershipStartDate) {
                const endDate = new Date(parent.MembershipStartDate);
                endDate.setFullYear(endDate.getFullYear() + 1);
                membershipEndDate = endDate.toLocaleDateString();
            }
    
            // Create parent row
            const row = document.createElement('tr');
            row.setAttribute('data-member', parent.Membership.toLowerCase());
            row.setAttribute('data-has-children', parent.HasChildren);
    
            row.innerHTML = `
                <td>${parent.FirstName} ${parent.LastName}</td>
                <td>${parent.Gender === 'M' ? 'Male' : 'Female'}</td>
                <td>${new Date(parent.DateOfBirth).toLocaleDateString()}</td>
                <td>${parent.Email}</td>
                <td>${parent.ContactNumber}</td>
                <td>${new Date(parent.DateJoined).toLocaleDateString()}</td>
                <td>${parent.Membership}</td>
                <td>${membershipStartDate}</td>
                <td>${membershipEndDate}</td>
                <td>${parent.Dietary || 'N/A'}</td>
                <td>${parent.ProfileDetails || 'N/A'}</td>
                <td class="text-end">
                    <button class="btn btn-primary btn-sm edit-btn" data-parent-id="${parent.ParentID}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-parent-id="${parent.ParentID}">Delete</button>
                    ${parent.HasChildren === 'true' ? `
                        <button class="btn btn-secondary btn-sm expand-btn">Expand</button>
                        <div class="dropdown-content" style="display: none;">
                            ${children.filter(child => child.ParentID === parent.ParentID).map(child => `
                                <div class="child-info-box" data-child-id="${child.ChildID}">
                                    <p><strong>Name:</strong> ${child.FirstName} ${child.LastName}</p>
                                    <p><strong>DOB:</strong> ${new Date(child.DateOfBirth).toLocaleDateString()}</p>
                                    <p><strong>Gender:</strong> ${child.Gender === 'M' ? 'Male' : 'Female'}</p>
                                    <p><strong>School:</strong> ${child.School || 'N/A'}</p>
                                    <p><strong>Dietary:</strong> ${child.Dietary || 'N/A'}</p>
                                    <p><strong>Health Details:</strong> ${child.HealthDetails || 'N/A'}</p>
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
    
        // Add expand button functionality
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

        // Search functionality
        searchInput.addEventListener('input', filterBySearch);

        // Filter options
        filterOptions.forEach(option => {
            option.addEventListener('click', filterByOption);
        });

        document.querySelectorAll('.sort-option').forEach(option => {
            option.addEventListener('click', sortByOption);
        });
        
    }
    async function openEditModal(parentId) {
        try {
            const response = await fetch(`/auth/get-parent/${parentId}`);
            const parent = await response.json();
    
            if (response.ok) {
                // Populate parent data
                document.getElementById('editParentID').value = parent.ParentID;
                document.getElementById('editFirstName').value = parent.FirstName;
                document.getElementById('editLastName').value = parent.LastName;
                document.getElementById('editDOB').value = new Date(parent.DateOfBirth).toISOString().split('T')[0];
                document.getElementById('editContactNumber').value = parent.ContactNumber;
                document.getElementById('editDietary').value = parent.Dietary || '';
                document.getElementById('editGender').value = parent.Gender || 'M';
                document.getElementById('editProfileDetails').value = parent.ProfileDetails || '';
                document.getElementById('editMembership').value = parent.Membership || 'Non-Membership';
    
                const startDateField = document.getElementById('editMembershipStartDate');
                const endDateField = document.getElementById('editMembershipEndDate');
    
                const startDate = parent.StartDate
                    ? new Date(parent.StartDate).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0];
    
                startDateField.value = startDate;
    
                // Calculate End Date: 1 year after Start Date
                const defaultEndDate = new Date(startDate);
                defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 1);
                endDateField.value = defaultEndDate.toISOString().split('T')[0];
                endDateField.setAttribute('readonly', true); // Make End Date uneditable
    
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
    
        const payload = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            dob: formData.get('dob'),
            contactNumber: formData.get('contactNumber'),
            dietary: formData.get('dietary'),
            gender: formData.get('gender'),
            profileDetails: formData.get('profileDetails'),
            membership: formData.get('membership'),
            membershipStartDate: formData.get('membershipStartDate'),
            membershipEndDate: formData.get('membershipEndDate'), // Include editable end date
        };
    
        try {
            const response = await fetch(`/auth/update-parent/${parentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
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
                // Set values in the modal, ensuring no property is mismatched
                document.getElementById('editChildID').value = child.ChildID;
                document.getElementById('editChildFirstName').value = child.FirstName || '';
                document.getElementById('editChildLastName').value = child.LastName || '';
                document.getElementById('editChildDOB').value = new Date(child.DateOfBirth).toISOString().split('T')[0];
                document.getElementById('editChildSchool').value = child.School || '';
                document.getElementById('editChildDietary').value = child.Dietary || '';
                document.getElementById('editChildRelationship').value = child.Relationship || '';
                document.getElementById('editChildHealthDetails').value = child.HealthDetails || ''; // Corrected field
                document.getElementById('editChildGender').value = child.Gender || 'M';
                document.getElementById('editChildProfileDetails').value = child.ProfileDetails || ''; // Corrected field
    
                // Show the modal
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
    
        // Ensure properties match the backend schema
        const payload = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            dob: formData.get('dob'),
            school: formData.get('school'),
            dietary: formData.get('dietary'),
            relationship: formData.get('relationship'),
            healthDetails: formData.get('healthDetails'), // Updated field
            gender: formData.get('gender'),
            profileDetails: formData.get('profileDetails') // Updated field
        };
    
        try {
            const response = await fetch(`/auth/update-child/${childId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
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
                alert('Parent deleted successfully. Please refresh.');
                document.querySelector(`tr[data-parent-id="${parentId}"]`).remove();
                location.reload();
            } else {
                alert('Deletion not allowed. Parent has existing programme booking & payment records.');
            }
        } catch (error) {
            console.error('Deletion not allowed. Parent has existing programme booking & payment records.', error);
        }
    }

    async function deleteChild(childId) {
        try {
            const response = await fetch(`/auth/delete-child/${childId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Child deleted successfully. Please refresh.');
                document.querySelector(`[data-child-id="${childId}"]`).closest('.child-info-box').remove();
                location.reload();
            } else {
                alert('Deletion not allowed. Parent/Child has existing programme booking & payment records.');
            }
        } catch (error) {
            console.error('Deletion not allowed. Parent/Child has existing programme booking & payment records.', error);
            alert('Deletion not allowed. Parent/Child has existing programme booking & payment records.');
        }
    }

    function sortByOption() {
        const sortType = this.getAttribute('data-sort'); // Get the selected sort option (name or dateJoined)
        const rows = Array.from(document.querySelectorAll('#user-list tr')); // Convert NodeList to an array
    
        rows.sort((a, b) => {
            if (sortType === 'name') {
                // Sort by Name (A-Z)
                const nameA = a.querySelector('td:first-child').textContent.toLowerCase();
                const nameB = b.querySelector('td:first-child').textContent.toLowerCase();
                return nameA.localeCompare(nameB);
            } else if (sortType === 'dateJoined') {
                // Sort by Date Joined
                const dateA = new Date(a.querySelector('td:nth-child(6)').textContent); // Date Joined is in the 6th column
                const dateB = new Date(b.querySelector('td:nth-child(6)').textContent);
                return dateA - dateB; // Sort by ascending order
            }
            return 0; // Default (no sorting)
        });
    
        // Re-render sorted rows
        const userList = document.getElementById('user-list');
        userList.innerHTML = ''; // Clear the current table rows
        rows.forEach(row => userList.appendChild(row)); // Append sorted rows back to the table
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
        const filterType = this.getAttribute('data-filter'); // The filter type selected (e.g., 'gold', 'silver')
        const rows = document.querySelectorAll('#user-list tr');
    
        rows.forEach(row => {
            const memberType = row.getAttribute('data-member'); // Membership type of the row
            const hasChildren = row.getAttribute('data-has-children'); // Whether the parent has children
    
            // Handle membership filtering
            if (['gold', 'silver', 'bronze', 'non-membership'].includes(filterType)) {
                row.style.display = (memberType === filterType) ? '' : 'none';
            }
    
            // Handle children filtering
            if (filterType === 'has-children' || filterType === 'no-children') {
                row.style.display = (
                    (filterType === 'has-children' && hasChildren === 'true') ||
                    (filterType === 'no-children' && hasChildren === 'false')
                ) ? '' : 'none';
            }
        });
    }
    

    await fetchUserData();
});
