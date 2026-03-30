// publish.js
document.addEventListener('DOMContentLoaded', function () {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const uploadError = document.getElementById('uploadError');
    const submitBtn = document.getElementById('submitBtn');
    const publishForm = document.getElementById('publishForm');

    let uploadedFiles = [];
    const MAX_IMAGES = 5;
    const MAX_SIZE = 5 * 1024 * 1024;

    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    function highlight() {
        uploadArea.style.borderColor = '#409eff';
    }
    function unhighlight() {
        uploadArea.style.borderColor = '#ccc';
    }

    uploadArea.addEventListener('drop', handleDrop, false);
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });

    function handleFiles(files) {
        uploadError.style.display = 'none';
        Array.from(files).forEach(file => {
            if (uploadedFiles.length >= MAX_IMAGES) {
                uploadError.textContent = `Maximum ${MAX_IMAGES} images can be uploaded`;
                uploadError.style.display = 'block';
                return;
            }
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                uploadError.textContent = `File ${file.name} is not JPG/PNG format`;
                uploadError.style.display = 'block';
                return;
            }
            if (file.size > MAX_SIZE) {
                uploadError.textContent = `File ${file.name} exceeds 5MB limit`;
                uploadError.style.display = 'block';
                return;
            }
            uploadedFiles.push(file);
            createPreview(file);
        });
    }

    // 👇 这里已经把预览图改小为 80px × 80px
    function createPreview(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.dataset.index = uploadedFiles.length - 1;

            const img = document.createElement('img');
            img.src = e.target.result;
            // 预览图大小
            img.style.width = '80px';
            img.style.height = '80px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '4px';

            const delBtn = document.createElement('button');
            delBtn.className = 'del-btn';
            delBtn.innerHTML = '&times;';
            delBtn.style.position = 'absolute';
            delBtn.style.top = '-6px';
            delBtn.style.right = '-6px';
            delBtn.style.width = '18px';
            delBtn.style.height = '18px';
            delBtn.style.background = '#ff4949';
            delBtn.style.color = '#fff';
            delBtn.style.border = 'none';
            delBtn.style.borderRadius = '50%';
            delBtn.style.fontSize = '12px';
            delBtn.style.cursor = 'pointer';
            delBtn.style.display = 'flex';
            delBtn.style.alignItems = 'center';
            delBtn.style.justifyContent = 'center';

            previewItem.style.position = 'relative';
            previewItem.appendChild(img);
            previewItem.appendChild(delBtn);
            previewArea.appendChild(previewItem);

            delBtn.addEventListener('click', () => {
                const index = previewItem.dataset.index;
                uploadedFiles.splice(index, 1);
                previewItem.remove();
                updatePreviewIndexes();
            });
        };
        reader.readAsDataURL(file);
    }

    function updatePreviewIndexes() {
        document.querySelectorAll('.preview-item').forEach((item, index) => {
            item.dataset.index = index;
        });
    }

    submitBtn.addEventListener('click', async () => {
        const title = document.getElementById('goods-title').value.trim();
        const category = document.getElementById('goods-category').value;
        const price = document.getElementById('goods-price').value;
        const desc = document.getElementById('goods-desc').value.trim();
        const contact = document.getElementById('contact-way').value.trim();

        if (!title) {
            alert('Please enter product title');
            return;
        }
        if (!category) {
            alert('Please select product category');
            return;
        }
        if (price === '') {
            alert('Please enter product price');
            return;
        }
        if (!desc) {
            alert('Please enter product description');
            return;
        }
        if (!contact) {
            alert('Please enter contact information');
            return;
        }
        if (uploadedFiles.length === 0) {
            alert('Please upload at least one product image');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('price', price);
        formData.append('description', desc);
        formData.append('contact', contact);

        uploadedFiles.forEach((file) => {
            formData.append('images', file);
        });

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Publishing...';

            const response = await fetch('http://your-backend-api.com/publish', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                alert('Publish success!');
                publishForm.reset();
                uploadedFiles = [];
                previewArea.innerHTML = '';
            } else {
                alert(`Publish failed: ${result.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Network error, please try again later');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'publish';
        }
    });
});