// This code will run at client side.
const deleteProduct = async (event) => {
    const btn = event.target;
    const productId = btn.dataset.id;
    const csrfToken = btn.dataset.csrf;



    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`/admin/product/${productId}`, {
                method: 'DELETE',
                headers: {
                    'CSRF-Token': csrfToken
                }
            });

            if (response.ok) {
                // Remove product from DOM
                const productElement = btn.closest('li');
                productElement.parentNode.removeChild(productElement);

                const data = await response.json();
                console.log("Message recieved: ",data);
                console.log('Product deleted successfully');
            } else {
                console.error('Error deleting product');
            }
        } catch (err) {
            console.error('Failed to delete product:', err);
        }
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', deleteProduct);
    });
});

