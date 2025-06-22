

class Library {
    constructor() {
        this.books = [];
        this.nextId = 1;
        this.init();
    }

    init() {

        this.loadFromStorage();
        this.bindEvents();
        this.renderBooks();

        if (this.books.length === 0) {
            this.addSampleBooks();
        }
    }

    bindEvents() {

        document.getElementById('newBookBtn').addEventListener('click', () => {
            this.showPopUp();
        });
        document.getElementById('closePopUp').addEventListener('click', () => {
            this.hidePopUp();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hidePopUp();
        });

        document.getElementById('bookForm').addEventListener('submit', (e) => {
            e.preventDefault(); 
            this.addBook();
        });

        document.getElementById('bookPopUp').addEventListener('click', (e) => {
            if (e.target.id === 'bookPopUp') {
                this.hidePopUp();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hidePopUp();
            }
        });
    }


    showPopUp() {
        const popUp = document.getElementById('bookPopUp');
        popUp.classList.add('show'); // This adds a CSS class to make it visible.
        document.body.style.overflow = 'hidden'; // Prevents scrolling the page while modal is open.
        
        // Focus on the first input field for better user experience.
        setTimeout(() => {
            document.getElementById('bookTitle').focus();
        }, 100); 
    }

    // hideModal() closes the popup and resets things.
    hidePopUp() {
        const popUp = document.getElementById('bookPopUp');
        popUp.classList.remove('show');
        document.body.style.overflow = 'auto'; 
        
        // Clear the form fields.
        document.getElementById('bookForm').reset();
    }

    // addBook() takes the form data and adds a new book to the list.
    addBook() {
        const form = document.getElementById('bookForm');
        const formData = new FormData(form); 
      
        // Create a book object with the data. 
        const book = {
            id: this.nextId++, 
            title: formData.get('title').trim(), // Get the title and remove extra spaces.
            author: formData.get('author').trim(),
            pages: parseInt(formData.get('pages')) || 0, // Convert to number, default to 0.
            
            read: formData.get('read') === 'on', // Checkbox: true if checked.
        };

        // Check if required fields are filled.
        if (!book.title || !book.author) {
            this.showNotification('Please fill in all required fields', 'error');
            return; // Stop if invalid.
        }

        // Add the book to the array.
        this.books.push(book);
        // Save to browser storage.
        this.saveToStorage();
        // Redraw the books on the page.
        this.renderBooks();
        
        
        this.hidePopUp();
        
        // Show a success message.
        this.showNotification(`"${book.title}" has been added to your library!`, 'success');
    }

    // deleteBook() removes a book by ID.
    deleteBook(id) {
        const book = this.books.find(b => b.id === id); 
        if (!book) return;

        // Ask for confirmation.
        if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
            // Filter out the book from the array.
            this.books = this.books.filter(b => b.id !== id);
            this.saveToStorage();
            this.renderBooks();
            
            this.showNotification(`"${book.title}" has been removed from your library`, 'info');
        }
    }

    // toggleReadStatus() flips the read/unread status of a book.
    toggleReadStatus(id) {
        const book = this.books.find(b => b.id === id);
        if (!book) return;

        book.read = !book.read; // Flip the boolean (true/false).
        this.saveToStorage();
        this.renderBooks();
        
        const status = book.read ? 'read' : 'unread';
        this.showNotification(`"${book.title}" marked as ${status}`, 'success');
    }

    // renderBooks() updates the HTML to show all books.
    renderBooks() {
        const container = document.getElementById('booksGrid');
        
        if (this.books.length === 0) {
            container.innerHTML = this.getEmptyStateHTML(); // Show a message if no books.
            return;
        }

        // Generate HTML for each book and join them.
        container.innerHTML = this.books.map(book => this.getBookCardHTML(book)).join('');
    }

    // returns the HTML string for one book card.
    getBookCardHTML(book) {
        // Determine classes and texts based on read status.
        const readStatusClass = book.read ? 'read' : 'unread';
        const readStatusText = book.read ? 'Read' : 'Not Read';
        const readStatusIcon = book.read ? 'fas fa-check-circle' : 'fas fa-clock';
        const toggleButtonClass = book.read ? 'btn-secondary' : 'btn-success';
        const toggleButtonText = book.read ? 'Mark Unread' : 'Mark Read';
        const toggleButtonIcon = book.read ? 'fas fa-undo' : 'fas fa-check';

        // This is a template string (using backticks) to build the HTML.
        return `
            <div class="book-card">
                <div class="read-status ${readStatusClass}">
                    <i class="${readStatusIcon}"></i>
                    ${readStatusText}
                </div>
                <h3 class="book-title">${this.escapeHtml(book.title)}</h3>
                <div class="book-info">
                    <p><strong>Author:</strong> ${this.escapeHtml(book.author)}</p>
                    ${book.pages > 0 ? `<p><strong>Pages:</strong> ${book.pages}</p>` : ''}
                    ${book.genre !== 'Unknown' ? `<p><strong>Genre:</strong> ${this.escapeHtml(book.genre)}</p>` : ''}
                </div>
                <div class="book-actions">
                    <button class="btn ${toggleButtonClass}" onclick="library.toggleReadStatus(${book.id})">
                        <i class="${toggleButtonIcon}"></i>
                        ${toggleButtonText}
                    </button>
                    <button class="btn btn-danger" onclick="library.deleteBook(${book.id})">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    // returns HTML for when there are no books.
    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <h3>Your library is empty</h3>
                <p>Start building your personal library by adding your first book!</p>
                <button class="btn btn-primary" onclick="library.showPopUp()">
                    <i class="fas fa-plus"></i>
                    Add Your First Book
                </button>
            </div>
        `;
    }

   
    // addSampleBooks() adds some example books if the library is empty.
    addSampleBooks() {
        // This is an array of book objects.
        const sampleBooks = [
            {
                id: this.nextId++,
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                pages: 180,
                
                read: true,
            },
            // ... (other books omitted for brevity, but they follow the same pattern)
            {
                id: this.nextId++,
                title: "Dune",
                author: "Frank Herbert",
                pages: 688,
                read: false,
                
            }
        ];

        this.books = sampleBooks;
        this.saveToStorage();
    }

    //  saves the books to the browser's localStorage, which persists data even after closing the browser.
    saveToStorage() {
        try {
            // Convert the array to a string and save.
            localStorage.setItem('libraryBooks', JSON.stringify(this.books));
            localStorage.setItem('libraryNextId', this.nextId.toString());
        } catch (error) {
            console.error('Failed to save to localStorage:', error); // Log error to console.
            this.showNotification('Failed to save changes', 'error');
        }
    }

    // loadFromStorage() loads the saved data when the page loads.
    loadFromStorage() {
        try {
            const savedBooks = localStorage.getItem('libraryBooks');
            const savedNextId = localStorage.getItem('libraryNextId');
            
            if (savedBooks) {
                this.books = JSON.parse(savedBooks); // Convert string back to array.
            }
            
            if (savedNextId) {
                this.nextId = parseInt(savedNextId);
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            this.books = [];
            this.nextId = 1;
        }
    }

    // showNotification() displays a temporary message on the screen.
    showNotification(message, type = 'info') {
        // Create a new HTML element for the notification.
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles if not already present (this defines how the notification looks).
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    max-width: 400px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                .notification.show {
                    transform: translateX(0);
                }
                .notification-success { background: #10b981; }
                .notification-error { background: #ef4444; }
                .notification-info { background: #3b82f6; }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
            `;
            document.head.appendChild(styles);
        }

        // Add to the page and show it.
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after 3 seconds.
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    //  chooses an icon based on the type.
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'info': return 'fa-info-circle';
            default: return 'fa-info-circle';
        }
    }

    // escapeHtml() makes sure text is safe to display in HTML by escaping special characters.
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML; // This converts < to <, etc.
    }

    // exportLibrary() allows downloading the books as a JSON file.
    exportLibrary() {
        const dataStr = JSON.stringify(this.books, null, 2); // Pretty-print the JSON.
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'my-library.json';
        link.click(); // Simulate a click to download.
        
        URL.revokeObjectURL(url);
        this.showNotification('Library exported successfully!', 'success');
    }

    // importLibrary() reads a JSON file and loads the books.
    importLibrary(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedBooks = JSON.parse(e.target.result);
                if (Array.isArray(importedBooks)) {
                    this.books = importedBooks;
                    this.nextId = Math.max(...this.books.map(b => b.id), 0) + 1;
                    this.saveToStorage();
                    this.renderBooks();
                    this.updateStats();
                    this.showNotification('Library imported successfully!', 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showNotification('Failed to import library. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// This code runs when the page is fully loaded.
let library; // Declare a variable to hold the Library object.
document.addEventListener('DOMContentLoaded', () => {
    library = new Library(); // Create the Library instance.
});

// Add a keyboard shortcut: Ctrl+N to open the add book modal.
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        library.showPopUp();
    }
});