// script.js

document.addEventListener('DOMContentLoaded', () => {
    const markdownInput = document.getElementById('markdown-input');
    const markdownDropzone = document.getElementById('markdown-dropzone');
    const bgImagesInput = document.getElementById('bg-images');
    const imageDropzone = document.getElementById('image-dropzone');
    const selectImagesBtn = document.getElementById('select-images-btn');
    const imagePreview = document.getElementById('image-preview');
    const generateBtn = document.getElementById('generate-btn');
    const manualPreview = document.getElementById('manual-preview');
    const downloadImagesBtn = document.getElementById('download-images-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const textColorInput = document.getElementById('text-color');
    const shadowCheckbox = document.getElementById('enable-shadow');
    const shadowColorInput = document.getElementById('shadow-color');
    const shadowSpreadInput = document.getElementById('shadow-spread');
    const overlayCheckbox = document.getElementById('enable-overlay');
    const overlayOpacityInput = document.getElementById('overlay-opacity');
    const fontSizeInput = document.getElementById('font-size');
    const fontFamilySelect = document.getElementById('font-family');
    const lineSpacingInput = document.getElementById('line-spacing');
    const linkColorInput = document.getElementById('link-color');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const currentPageSpan = document.getElementById('current-page');

    let backgroundImages = [];
    let pages = [];
    let currentPageIndex = 0;

    // Helper function to validate elements
    function validateElements() {
        const elements = [
            markdownInput,
            markdownDropzone,
            bgImagesInput,
            imageDropzone,
            selectImagesBtn,
            imagePreview,
            generateBtn,
            manualPreview,
            downloadImagesBtn,
            downloadPdfBtn,
            textColorInput,
            shadowCheckbox,
            shadowColorInput,
            shadowSpreadInput,
            overlayCheckbox,
            overlayOpacityInput,
            fontSizeInput,
            fontFamilySelect,
            lineSpacingInput,
            linkColorInput,
            prevPageBtn,
            nextPageBtn,
            currentPageSpan
        ];

        elements.forEach(elem => {
            if (!elem) {
                console.error(`Element not found: ${elem}`);
            }
        });
    }

    // Call validateElements on load
    validateElements();

    // Handle Markdown Drop Zone
    markdownDropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        markdownDropzone.classList.add('dragover');
    });

    markdownDropzone.addEventListener('dragleave', (event) => {
        event.preventDefault();
        markdownDropzone.classList.remove('dragover');
    });

    markdownDropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        markdownDropzone.classList.remove('dragover');
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    markdownInput.value = e.target.result;
                }
                reader.readAsText(file);
            } else {
                alert('Please drop a valid Markdown (.md) file.');
            }
        }
    });

    // Handle Image Drop Zone
    imageDropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        imageDropzone.classList.add('dragover');
    });

    imageDropzone.addEventListener('dragleave', (event) => {
        event.preventDefault();
        imageDropzone.classList.remove('dragover');
    });

    imageDropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        imageDropzone.classList.remove('dragover');
        const files = event.dataTransfer.files;
        handleImageFiles(files);
    });

    // Handle Select Images Button Click
    selectImagesBtn.addEventListener('click', () => {
        bgImagesInput.click();
    });

    // Handle Background Image Upload via File Input
    bgImagesInput.addEventListener('change', (event) => {
        const files = event.target.files;
        handleImageFiles(files);
    });

    // Function to handle image files with cropping to A4 aspect ratio
    function handleImageFiles(files) {
        for (let file of files) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const croppedDataUrl = cropImageToA4(img);
                        const croppedImg = document.createElement('img');
                        croppedImg.src = croppedDataUrl;
                        croppedImg.title = `Image ${backgroundImages.length + 1}`;
                        imagePreview.appendChild(croppedImg);
                        backgroundImages.push(croppedDataUrl);
                    }
                    img.src = e.target.result;
                }
                reader.readAsDataURL(file);
            } else {
                alert('Only image files (PNG, JPEG) are allowed.');
            }
        }
    }

    // Function to crop image to A4 aspect ratio (210mm x 297mm) at 96 DPI (794x1123px)
    function cropImageToA4(img) {
        const a4Width = 794;
        const a4Height = 1123;
        const a4Aspect = a4Width / a4Height;
        const imgAspect = img.width / img.height;

        let cropWidth, cropHeight, offsetX, offsetY;

        if (imgAspect > a4Aspect) {
            // Image is wider than A4 aspect ratio
            cropHeight = img.height;
            cropWidth = cropHeight * a4Aspect;
            offsetX = (img.width - cropWidth) / 2;
            offsetY = 0;
        } else {
            // Image is taller than A4 aspect ratio
            cropWidth = img.width;
            cropHeight = cropWidth / a4Aspect;
            offsetX = 0;
            offsetY = (img.height - cropHeight) / 2;
        }

        // Create canvas to draw the cropped image
        const canvas = document.createElement('canvas');
        canvas.width = a4Width;
        canvas.height = a4Height;
        const ctx = canvas.getContext('2d');

        // Draw the cropped area onto the canvas, scaling to A4 size
        ctx.drawImage(img, offsetX, offsetY, cropWidth, cropHeight, 0, 0, a4Width, a4Height);

        return canvas.toDataURL('image/png');
    }

    // Handle Generate Manual
    generateBtn.addEventListener('click', () => {
        const markdownText = markdownInput.value;
        if (!markdownText.trim()) {
            alert('Please enter some markdown text.');
            return;
        }

        // Check if no images are uploaded; if so, use a single black background
        if (backgroundImages.length === 0) {
            backgroundImages.push(null); // Using null to denote black background
        }

        // Split markdown into pages based on '---'
        pages = markdownText.split(/^---$/m).map(page => page.trim()).filter(page => page.length > 0);

        if (pages.length === 0) {
            alert('No content found in markdown.');
            return;
        }

        // Clear previous previews
        manualPreview.innerHTML = '';
        currentPageIndex = 0;

        // Create page data with rotated background images
        const pageData = pages.map((pageContent, index) => {
            // Convert Markdown to HTML and remove {#...} tags
            const cleanContent = pageContent.replace(/\s*\{#.*?\}/g, '');
            const htmlContent = marked.parse(cleanContent);

            return {
                content: htmlContent,
                bgImage: backgroundImages[index % backgroundImages.length] // Rotate images or use null for black
            };
        });

        // Render initial preview
        renderPreviewPage(pageData, currentPageIndex);

        // Enable navigation buttons if multiple pages
        if (pageData.length > 1) {
            nextPageBtn.disabled = false;
        } else {
            nextPageBtn.disabled = true;
        }

        // Store pages globally for download functionality
        manualPreview.dataset.pages = JSON.stringify(pageData);
    });

    // Render a specific preview page
    function renderPreviewPage(pageData, index) {
        if (!pageData || index < 0 || index >= pageData.length) {
            console.error('Invalid page data or index.');
            return;
        }

        manualPreview.innerHTML = ''; // Clear current preview

        const page = pageData[index];

        // Create page preview
        const pageDiv = document.createElement('div');
        pageDiv.classList.add('page-preview');

        // Set background image or fallback to black
        if (page.bgImage) {
            const bgImg = document.createElement('img');
            bgImg.src = page.bgImage;
            bgImg.classList.add('background');
            pageDiv.appendChild(bgImg);
        } else {
            // If no background image, ensure background is black
            pageDiv.style.backgroundColor = '#000000';
        }

        // Create content div
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('content');

        // Apply dynamic styles
        contentDiv.style.color = textColorInput.value;
        contentDiv.style.fontSize = `${fontSizeInput.value}px`;
        contentDiv.style.fontFamily = fontFamilySelect.value;
        contentDiv.style.lineHeight = lineSpacingInput.value;

        // Apply link color
        contentDiv.style.setProperty('--link-color', linkColorInput.value);

        // Handle shadow
        if (shadowCheckbox.checked) {
            const shadowColor = shadowColorInput.value;
            const shadowSpread = shadowSpreadInput.value;
            contentDiv.style.setProperty('--shadow-color', shadowColor);
            contentDiv.style.setProperty('--shadow-spread', shadowSpread);
            contentDiv.classList.add('shadow');
        } else {
            contentDiv.classList.remove('shadow');
        }

        // Handle overlay
        if (overlayCheckbox.checked) {
            const opacity = overlayOpacityInput.value;
            contentDiv.style.setProperty('--overlay-opacity', opacity);
            contentDiv.classList.add('overlay');
        } else {
            contentDiv.classList.remove('overlay');
        }

        // Set inner HTML
        contentDiv.innerHTML = page.content;

        // Replace link colors
        const links = contentDiv.querySelectorAll('a');
        links.forEach(link => {
            link.style.color = linkColorInput.value;
        });

        pageDiv.appendChild(contentDiv);

        // Add page number if not the first page
        if (index > 0) {
            const pageNumberDiv = document.createElement('div');
            pageNumberDiv.classList.add('page-number');
            pageNumberDiv.textContent = `Page ${index}`;
            pageDiv.appendChild(pageNumberDiv);
        }

        manualPreview.appendChild(pageDiv);
        manualPreview.style.display = 'block'; // Make sure preview is visible

        // Update current page display
        const displayPageNumber = index === 0 ? 'Cover Page' : `Page ${index}`;
        currentPageSpan.textContent = `${displayPageNumber} of ${pageData.length}`;
    }

    // Handle Next Page
    nextPageBtn.addEventListener('click', () => {
        const pageData = JSON.parse(manualPreview.dataset.pages || '[]');
        if (currentPageIndex < pageData.length - 1) {
            currentPageIndex++;
            renderPreviewPage(pageData, currentPageIndex);
            prevPageBtn.disabled = false;
            if (currentPageIndex === pageData.length - 1) {
                nextPageBtn.disabled = true;
            }
        }
    });

    // Handle Previous Page
    prevPageBtn.addEventListener('click', () => {
        const pageData = JSON.parse(manualPreview.dataset.pages || '[]');
        if (currentPageIndex > 0) {
            currentPageIndex--;
            renderPreviewPage(pageData, currentPageIndex);
            nextPageBtn.disabled = false;
            if (currentPageIndex === 0) {
                prevPageBtn.disabled = true;
            }
        }
    });

    // Handle Download as Images
    downloadImagesBtn.addEventListener('click', async () => {
        const pageData = JSON.parse(manualPreview.dataset.pages || '[]');
        if (pageData.length === 0) {
            alert('Please generate the manual first.');
            return;
        }

        for (let i = 0; i < pageData.length; i++) {
            await renderFullPage(pageData[i], i).then(canvas => {
                const link = document.createElement('a');
                link.download = `page_${i + 1}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).catch(err => {
                console.error('Error capturing page:', err);
            });
        }

        alert('Pages have been downloaded as images.');
    });

    // Handle Download as PDF
    downloadPdfBtn.addEventListener('click', async () => {
        const { jsPDF } = window.jspdf;
        const pageData = JSON.parse(manualPreview.dataset.pages || '[]');
        if (pageData.length === 0) {
            alert('Please generate the manual first.');
            return;
        }

        const pdf = new jsPDF('p', 'mm', 'a4');

        for (let i = 0; i < pageData.length; i++) {
            await renderFullPage(pageData[i], i).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                if (i > 0) {
                    pdf.addPage();
                }
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297); // A4 size in mm
            }).catch(err => {
                console.error('Error capturing page:', err);
            });
        }

        pdf.save('manual.pdf');
    });

    // Helper function to render a full page and return canvas
    function renderFullPage(page, index) {
        return new Promise((resolve, reject) => {
            const tempDiv = document.createElement('div');
            tempDiv.classList.add('page-preview');

            // Set background image or fallback to black
            if (page.bgImage) {
                const bgImg = document.createElement('img');
                bgImg.src = page.bgImage;
                bgImg.classList.add('background');
                tempDiv.appendChild(bgImg);
            } else {
                // If no background image, ensure background is black
                tempDiv.style.backgroundColor = '#000000';
            }

            // Create content div
            const contentDiv = document.createElement('div');
            contentDiv.classList.add('content');

            // Apply dynamic styles
            contentDiv.style.color = textColorInput.value;
            contentDiv.style.fontSize = `${fontSizeInput.value}px`;
            contentDiv.style.fontFamily = fontFamilySelect.value;
            contentDiv.style.lineHeight = lineSpacingInput.value;

            // Apply link color
            contentDiv.style.setProperty('--link-color', linkColorInput.value);

            // Handle shadow
            if (shadowCheckbox.checked) {
                const shadowColor = shadowColorInput.value;
                const shadowSpread = shadowSpreadInput.value;
                contentDiv.style.setProperty('--shadow-color', shadowColor);
                contentDiv.style.setProperty('--shadow-spread', shadowSpread);
                contentDiv.classList.add('shadow');
            } else {
                contentDiv.classList.remove('shadow');
            }

            // Handle overlay
            if (overlayCheckbox.checked) {
                const opacity = overlayOpacityInput.value;
                contentDiv.style.setProperty('--overlay-opacity', opacity);
                contentDiv.classList.add('overlay');
            } else {
                contentDiv.classList.remove('overlay');
            }

            // Set inner HTML
            contentDiv.innerHTML = page.content;

            // Replace link colors
            const links = contentDiv.querySelectorAll('a');
            links.forEach(link => {
                link.style.color = linkColorInput.value;
            });

            tempDiv.appendChild(contentDiv);

            // Add page number if not the first page
            if (index > 0) {
                const pageNumberDiv = document.createElement('div');
                pageNumberDiv.classList.add('page-number');
                pageNumberDiv.textContent = `Page ${index}`;
                tempDiv.appendChild(pageNumberDiv);
            }

            // Append tempDiv to body temporarily for rendering
            document.body.appendChild(tempDiv);

            // Use html2canvas to capture the tempDiv
            html2canvas(tempDiv, { scale: 2 }).then(canvas => {
                document.body.removeChild(tempDiv);
                resolve(canvas);
            }).catch(err => {
                document.body.removeChild(tempDiv);
                reject(err);
            });
        });
    }
});
