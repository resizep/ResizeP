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
        this.loadPremiumSizes();
        this.checkAuthState();
    }

    initializeCanvas() {
        this.canvas = new fabric.Canvas('mainCanvas', {
            width: 800,
            height: 600,
            backgroundColor: '#ffffff'
        });
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
        document.addEventListener('click', () => {
            document.getElementById('dropdownMenu').classList.remove('show');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.style.background = '#f0e6ff';
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.style.background = '';
        
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
        
        reader.onload = (e) => {
            fabric.Image.fromURL(e.target.result, (img) => {
                // Clear canvas
                this.canvas.clear();
                
                // Calculate scale to fit canvas
                const scale = Math.min(
                    800 / img.width,
                    600 / img.height,
                    1
                );
                
                img.scale(scale);
                
                // Center image
                img.set({
                    left: (800 - img.width * scale) / 2,
                    top: (600 - img.height * scale) / 2,
                    selectable: true,
                    hasControls: true
                });
                
                this.canvas.add(img);
                this.currentImage = img;
                
                // Store original size
                this.originalSize = {
                    width: img.width,
                    height: img.height
                };
                
                this.updateSizeInfo();
            });
        };
        
        reader.readAsDataURL(file);
    }

    resizeImage() {
        if (!this.currentImage) {
            alert('Please upload an image first!');
            return;
        }

        const width = parseInt(document.getElementById('customWidth').value);
        const height = parseInt(document.getElementById('customHeight').value);

        if (!width || !height) {
            alert('Please enter valid width and height!');
            return;
        }

        // Resize canvas
        this.canvas.setDimensions({
            width: width,
            height: height
        });

        // Scale image to fit new canvas size
        const img = this.currentImage;
        const scaleX = width / this.originalSize.width;
        const scaleY = height / this.originalSize.height;
        const scale = Math.min(scaleX, scaleY);

        img.scale(scale);
        img.set({
            left: (width - img.width * scale) / 2,
            top: (height - img.height * scale) / 2
        });

        this.canvas.renderAll();
        this.updateSizeInfo();
    }

    downloadImage() {
        if (!this.currentImage) {
            alert('Please upload an image first!');
            return;
        }

        const quality = parseFloat(document.getElementById('qualitySelect').value);
        const dataURL = this.canvas.toDataURL({
            format: 'png',
            quality: quality
        });

        const link = document.createElement('a');
        link.download = `resized-image-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
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

    loadPremiumSizes() {
        const premiumSizes = [
            { name: 'Instagram Story (1080x1920)', value: '1080x1920' },
            { name: 'Facebook Cover (820x312)', value: '820x312' },
            { name: 'Twitter Header (1500x500)', value: '1500x500' },
            { name: 'LinkedIn Post (1200x627)', value: '1200x627' },
            { name: 'Pinterest Pin (1000x1500)', value: '1000x1500' },
            { name: 'TikTok Video (1080x1920)', value: '1080x1920' },
            { name: 'WhatsApp Status (1080x1920)', value: '1080x1920' },
            { name: 'YouTube Channel Art (2560x1440)', value: '2560x1440' },
            { name: 'Twitch Banner (1200x380)', value: '1200x380' },
            { name: 'Discord Banner (960x540)', value: '960x540' }
        ];

        const premiumGroup = document.getElementById('premiumSizes');
        premiumSizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size.value;
            option.textContent = size.name;
            premiumGroup.appendChild(option);
        });
    }

    checkAuthState() {
        // This will be integrated with Firebase Auth
        const user = this.getCurrentUser();
        this.isLoggedIn = !!user;
        this.updateUIForAuthState();
    }

    getCurrentUser() {
        // Placeholder - will be implemented with Firebase
        return localStorage.getItem('resizeP_user');
    }

    updateUIForAuthState() {
        const premiumSizes = document.getElementById('premiumSizes');
        const saveProjectBtn = document.getElementById('saveProjectBtn');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (this.isLoggedIn) {
            premiumSizes.style.display = 'block';
            saveProjectBtn.style.display = 'block';
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
        } else {
            premiumSizes.style.display = 'none';
            saveProjectBtn.style.display = 'none';
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
        }
    }

    saveProject() {
        if (!this.isLoggedIn) {
            alert('Please login to save projects!');
            return;
        }

        const projectData = {
            canvasData: this.canvas.toJSON(),
            timestamp: new Date().toISOString(),
            size: {
                width: this.canvas.width,
                height: this.canvas.height
            }
        };

        // Save to localStorage (will be replaced with Firebase)
        const projects = JSON.parse(localStorage.getItem('resizeP_projects') || '[]');
        projects.push(projectData);
        localStorage.setItem('resizeP_projects', JSON.stringify(projects));

        alert('Project saved successfully!');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ResizePApp();
});
// New upload button functionality
setupNewUploadButton() {
    const uploadNewBtn = document.getElementById('uploadNewBtn');
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');

    uploadNewBtn.addEventListener('click', () => {
        imageInput.click();
    });

    // Show/hide new upload button based on image state
    this.canvas.on('object:added', () => {
        uploadNewBtn.style.display = 'block';
        uploadArea.style.display = 'none';
    });

    this.canvas.on('object:removed', () => {
        if (this.canvas.getObjects().length === 0) {
            uploadNewBtn.style.display = 'none';
            uploadArea.style.display = 'block';
        }
    });
}
