// Main application functionality
class ResizePApp {
    constructor() {
        this.canvas = null;
        this.currentImage = null;
        this.originalSize = { width: 0, height: 0 };
        this.isLoggedIn = false;
        this.init();
    }

    init() {
        this.initializeCanvas();
        this.setupEventListeners();
        this.setupNewUploadButton();
        this.checkAuthState();
        this.setupUserMenu();
    }

    initializeCanvas() {
        this.canvas = new fabric.Canvas('mainCanvas', {
            width: 800,
            height: 600,
            backgroundColor: '#ffffff'
        });
        
        // Hide canvas initially, show placeholder
        this.canvas.getElement().style.display = 'none';
    }

    setupEventListeners() {
        // File upload
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');

        uploadArea.addEventListener('click', () => imageInput.click());
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        imageInput.addEventListener('change', (e) => this.handleImageUpload(e));

        // Resize functionality
        document.getElementById('resizeBtn').addEventListener('click', () => this.resizeImage());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadImage());
        document.getElementById('saveProjectBtn').addEventListener('click', () => this.saveProject());

        // Size presets
        document.getElementById('sizePresets').addEventListener('change', (e) => {
            if (e.target.value) {
                const [width, height] = e.target.value.split('x').map(Number);
                document.getElementById('customWidth').value = width;
                document.getElementById('customHeight').value = height;
                this.applyPresetSize(width, height);
            }
        });

        // Custom size inputs
        document.getElementById('customWidth').addEventListener('input', () => this.updateCustomSize());
        document.getElementById('customHeight').addEventListener('input', () => this.updateCustomSize());

        // Menu toggle
        document.getElementById('menuToggle').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('dropdownMenu').classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-menu')) {
                document.getElementById('dropdownMenu').classList.remove('show');
                document.getElementById('userDropdown').classList.remove('show');
            }
        });
    }

    setupUserMenu() {
        const userToggle = document.getElementById('userToggle');
        const userDropdown = document.getElementById('userDropdown');

        if (userToggle) {
            userToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
        }
    }

    setupNewUploadButton() {
        const uploadNewBtn = document.getElementById('uploadNewBtn');
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');

        uploadNewBtn.addEventListener('click', () => {
            imageInput.click();
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.style.background = 'var(--primary-light)';
        e.currentTarget.style.borderColor = 'var(--primary-dark)';
    }

    handleDrop(e) {
        e.preventDefault();
        const uploadArea = e.currentTarget;
        uploadArea.style.background = '';
        uploadArea.style.borderColor = 'var(--primary-color)';
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            this.loadImage(files[0]);
        }
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        const reader = new FileReader();
        const uploadNewBtn = document.getElementById('uploadNewBtn');
        const uploadArea = document.getElementById('uploadArea');
        const canvasPlaceholder = document.getElementById('canvasPlaceholder');
        const mainCanvas = document.getElementById('mainCanvas');
        
        reader.onload = (e) => {
            fabric.Image.fromURL(e.target.result, (img) => {
                // Clear canvas
                this.canvas.clear();
                
                // Show canvas, hide placeholder
                mainCanvas.style.display = 'block';
                canvasPlaceholder.style.display = 'none';
                
                // Calculate scale to fit canvas (maintain aspect ratio)
                const maxWidth = 800;
                const maxHeight = 600;
                const scale = Math.min(
                    maxWidth / img.width,
                    maxHeight / img.height,
                    1
                );
                
                img.scale(scale);
                
                // Center image
                img.set({
                    left: (maxWidth - img.width * scale) / 2,
                    top: (maxHeight - img.height * scale) / 2,
                    selectable: true,
                    hasControls: true,
                    lockRotation: true,
                    lockScalingFlip: true
                });
                
                this.canvas.add(img);
                this.currentImage = img;
                
                // Store original size
                this.originalSize = {
                    width: Math.round(img.width),
                    height: Math.round(img.height)
                };
                
                // Update custom size inputs with original dimensions
                document.getElementById('customWidth').value = this.originalSize.width;
                document.getElementById('customHeight').value = this.originalSize.height;
                
                // Show new upload button, hide upload area
                uploadNewBtn.style.display = 'block';
                uploadArea.style.display = 'none';
                
                this.updateSizeInfo();
                
                // Clear preset selection
                document.getElementById('sizePresets').value = '';
            });
        };
        
        reader.readAsDataURL(file);
    }

    applyPresetSize(width, height) {
        if (!this.currentImage) {
            alert('Please upload an image first!');
            return;
        }

        // Update custom inputs
        document.getElementById('customWidth').value = width;
        document.getElementById('customHeight').value = height;

        this.resizeImage();
    }

    resizeImage() {
        if (!this.currentImage) {
            alert('Please upload an image first!');
            return;
        }

        const width = parseInt(document.getElementById('customWidth').value);
        const height = parseInt(document.getElementById('customHeight').value);

        if (!width || !height || width < 1 || height < 1) {
            alert('Please enter valid width and height (minimum 1px)!');
            return;
        }

        // IMPORTANT: Canvas container size remains fixed
        // Only the internal canvas dimensions change
        const container = document.getElementById('canvasContainer');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Set canvas dimensions for rendering
        this.canvas.setDimensions({
            width: width,
            height: height
        });

        // Scale image to fit new dimensions while maintaining aspect ratio
        const img = this.currentImage;
        const scaleX = width / this.originalSize.width;
        const scaleY = height / this.originalSize.height;
        const scale = Math.min(scaleX, scaleY);

        // Reset image to original size first
        img.scale(1);
        img.set({
            width: this.originalSize.width,
            height: this.originalSize.height
        });

        // Apply new scale
        img.scale(scale);
        
        // Center image in new canvas
        img.set({
            left: (width - this.originalSize.width * scale) / 2,
            top: (height - this.originalSize.height * scale) / 2
        });

        this.canvas.renderAll();
        this.updateSizeInfo();

        // Show success message
        this.showNotification('Image resized successfully!', 'success');
    }

    downloadImage() {
        if (!this.currentImage) {
            alert('Please upload an image first!');
            return;
        }

        const quality = parseFloat(document.getElementById('qualitySelect').value);
        const width = parseInt(document.getElementById('customWidth').value);
        const height = parseInt(document.getElementById('customHeight').value);
        
        // Create temporary canvas for download
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        // Fill background with white
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, width, height);
        
        // Draw the resized image
        const dataURL = this.canvas.toDataURL({
            format: 'png',
            quality: quality,
            multiplier: 1
        });
        
        const img = new Image();
        img.onload = () => {
            tempCtx.drawImage(img, 0, 0, width, height);
            
            const downloadURL = tempCanvas.toDataURL({
                format: 'png',
                quality: quality
            });
            
            const link = document.createElement('a');
            link.download = `resized-image-${width}x${height}-${Date.now()}.png`;
            link.href = downloadURL;
            link.click();
            
            this.showNotification('Image downloaded successfully!', 'success');
        };
        img.src = dataURL;
    }

    updateSizeInfo() {
        const originalSizeElement = document.getElementById('originalSize');
        const currentSizeElement = document.getElementById('currentSize');

        if (this.originalSize.width && this.originalSize.height) {
            originalSizeElement.textContent = 
                `${this.originalSize.width} x ${this.originalSize.height}`;
        }

        if (this.canvas) {
            currentSizeElement.textContent = 
                `${this.canvas.width} x ${this.canvas.height}`;
        }
    }

    updateCustomSize() {
        const width = document.getElementById('customWidth').value;
        const height = document.getElementById('customHeight').value;
        
        if (width && height) {
            document.getElementById('sizePresets').value = '';
        }
    }

    checkAuthState() {
        const user = this.getCurrentUser();
        this.isLoggedIn = !!user;
        this.updateUIForAuthState();
    }

    getCurrentUser() {
        return localStorage.getItem('resizeP_user');
    }

    updateUIForAuthState() {
        const premiumSizes = document.getElementById('premiumSizes');
        const saveProjectBtn = document.getElementById('saveProjectBtn');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userMenu = document.getElementById('userMenu');
        const mobileLoginBtn = document.getElementById('mobileLoginBtn');
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

        if (this.isLoggedIn) {
            premiumSizes.style.display = 'block';
            saveProjectBtn.style.display = 'block';
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            userMenu.style.display = 'block';
            mobileLoginBtn.style.display = 'none';
            mobileLogoutBtn.style.display = 'block';
        } else {
            premiumSizes.style.display = 'none';
            saveProjectBtn.style.display = 'none';
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            userMenu.style.display = 'none';
            mobileLoginBtn.style.display = 'block';
            mobileLogoutBtn.style.display = 'none';
        }
    }

    async saveProject() {
        if (!this.isLoggedIn) {
            alert('Please login to save projects!');
            this.showAuthModal();
            return;
        }

        if (!this.currentImage) {
            alert('Please upload an image first!');
            return;
        }

        try {
            // Simulate project saving
            const projectData = {
                canvasData: this.canvas.toJSON(),
                timestamp: new Date().toISOString(),
                size: {
                    width: this.canvas.width,
                    height: this.canvas.height
                },
                original_size: this.originalSize,
                project_name: `Project_${Date.now()}`
            };

            // Save to localStorage (replace with your backend)
            const projects = JSON.parse(localStorage.getItem('resizeP_projects') || '[]');
            projects.push(projectData);
            localStorage.setItem('resizeP_projects', JSON.stringify(projects));

            this.showNotification('Project saved successfully!', 'success');
            
        } catch (error) {
            console.error('Error saving project:', error);
            this.showNotification('Error saving project. Please try again.', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success)' : 'var(--danger)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 3000;
            font-weight: 600;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    showAuthModal() {
        document.getElementById('authModal').style.display = 'block';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ResizePApp();
});
