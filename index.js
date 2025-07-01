// CrudCrud API endpoint - Replace with your own endpoint
        const API_BASE_URL = 'https://crudcrud.com/api/55b1ecad74b94066b6e1a201d0dc2010/bookmarks';
        
        let bookmarks = [];
        let editingBookmarkId = null;
        let isEditMode = false;

        // DOM elements
        const bookmarkForm = document.getElementById('bookmarkForm');
        const bookmarksList = document.getElementById('bookmarksList');
        const editModeDiv = document.getElementById('editMode');
        const submitBtn = document.getElementById('submitBtn');
        const websiteTitleInput = document.getElementById('websiteTitle');
        const websiteURLInput = document.getElementById('websiteURL');

        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            loadBookmarks();
            setupEventListeners();
        });

        function setupEventListeners() {
            bookmarkForm.addEventListener('submit', handleFormSubmit);
        }

        // Load bookmarks from API
        async function loadBookmarks() {
            try {
                showLoading();
                const response = await fetch(API_BASE_URL);
                
                if (!response.ok) {
                    throw new Error('Failed to load bookmarks');
                }
                
                bookmarks = await response.json();
                displayBookmarks();
            } catch (error) {
                showError('Error loading bookmarks. Please check your API endpoint.');
                console.error('Error:', error);
            }
        }

        // Handle form submission (either add or update)
        async function handleFormSubmit(event) {
            event.preventDefault();
            
            if (isEditMode) {
                await updateBookmark();
            } else {
                await addBookmark();
            }
        }

        // Add new bookmark
        async function addBookmark() {
            const title = websiteTitleInput.value.trim();
            const url = websiteURLInput.value.trim();
            
            if (!title || !url) {
                showError('Please fill in all fields');
                return;
            }

            try {
                const bookmark = {
                    title: title,
                    url: url,
                    createdAt: new Date().toISOString()
                };

                const response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookmark)
                });

                if (!response.ok) {
                    throw new Error('Failed to add bookmark');
                }

                const newBookmark = await response.json();
                bookmarks.unshift(newBookmark);
                displayBookmarks();
                bookmarkForm.reset();
                showSuccess('Bookmark added successfully!');
                
            } catch (error) {
                showError('Error adding bookmark. Please try again.');
                console.error('Error:', error);
            }
        }

        // Display bookmarks
        function displayBookmarks() {
            
            const bookmarksHTML = bookmarks.map(bookmark => `
                <div class="bookmark-card">
                    <div class="bookmark-title">${escapeHtml(bookmark.title)}</div>
                    <a href="${escapeHtml(bookmark.url)}" target="_blank" class="bookmark-url">
                        Visit</a>
                    <div class="bookmark-actions">
                        <button class="btn btn-success" onclick="editBookmark('${bookmark._id}')">
                            Edit
                        </button>
                        <button class="btn btn-danger" onclick="deleteBookmark('${bookmark._id}')">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');

            bookmarksList.innerHTML = bookmarksHTML;
        }

        // Edit bookmark - populate main form
        function editBookmark(id) {
            const bookmark = bookmarks.find(b => b._id === id);
            if (!bookmark) return;

            // Enter edit mode
            isEditMode = true;
            editingBookmarkId = id;
            
            // Show edit mode indicator
            editModeDiv.style.display = 'block';
            
            // Populate the main form
            websiteTitleInput.value = bookmark.title;
            websiteURLInput.value = bookmark.url;
            
            // Change button text
            submitBtn.textContent = 'Update Bookmark';
            submitBtn.className = 'btn btn-success';
            
            // Scroll to form
            document.querySelector('.form-section').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }

        // Update bookmark
        async function updateBookmark() {
            const title = websiteTitleInput.value.trim();
            const url = websiteURLInput.value.trim();
            
            if (!title || !url) {
                showError('Please fill in all fields');
                return;
            }

            try {
                const updatedBookmark = {
                    title: title,
                    url: url
                };

                const response = await fetch(`${API_BASE_URL}/${editingBookmarkId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedBookmark)
                });

                if (!response.ok) {
                    throw new Error('Failed to update bookmark');
                }

                // Update local bookmarks array
                const index = bookmarks.findIndex(b => b._id === editingBookmarkId);
                if (index !== -1) {
                    bookmarks[index] = { ...bookmarks[index], ...updatedBookmark };
                }

                displayBookmarks();
                cancelEdit();
                showSuccess('Bookmark updated successfully!');
                
            } catch (error) {
                showError('Error updating bookmark. Please try again.');
                console.error('Error:', error);
            }
        }

        // Cancel edit mode
        function cancelEdit() {
            isEditMode = false;
            editingBookmarkId = null;
            
            // Hide edit mode indicator
            editModeDiv.style.display = 'none';
            
            // Reset form
            bookmarkForm.reset();
            
            // Reset button
            submitBtn.textContent = 'Add Bookmark';
            submitBtn.className = 'btn btn-primary';
        }

        // Delete bookmark
        async function deleteBookmark(id) {
            if (!confirm('Are you sure you want to delete this bookmark?')) {
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete bookmark');
                }

                bookmarks = bookmarks.filter(bookmark => bookmark._id !== id);
                displayBookmarks();
                showSuccess('Bookmark deleted successfully!');
                
            } catch (error) {
                showError('Error deleting bookmark. Please try again.');
                console.error('Error:', error);
            }
        }

        // Close edit modal
        function closeEditModal() {
            editModal.style.display = 'none';
            editingBookmarkId = null;
            editForm.reset();
        }

        // Utility functions
        function showLoading() {
            bookmarksList.innerHTML = '<div class="loading">Loading bookmarks...</div>';
        }

        function showError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = message;
            
            // Remove existing error messages
            const existingError = document.querySelector('.error');
            if (existingError) {
                existingError.remove();
            }
            
            document.querySelector('.form-section').appendChild(errorDiv);
            
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }

        function showSuccess(message) {
            const successDiv = document.createElement('div');
            successDiv.className = 'success';
            successDiv.textContent = message;
            
            // Remove existing success messages
            const existingSuccess = document.querySelector('.success');
            if (existingSuccess) {
                existingSuccess.remove();
            }
            
            document.querySelector('.form-section').appendChild(successDiv);
            
            setTimeout(() => {
                successDiv.remove();
            }, 3000);
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
