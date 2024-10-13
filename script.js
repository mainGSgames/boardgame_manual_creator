// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Markdown Input Elements
    const markdownInput = document.getElementById('markdown-input');
    const markdownDropzone = document.getElementById('markdown-dropzone');

    // Cover Image Elements
    const coverImageInput = document.getElementById('cover-image-input');
    const coverImageDropzone = document.getElementById('cover-image-dropzone');
    const selectCoverImageBtn = document.getElementById('select-cover-image-btn');
    const coverImagePreview = document.getElementById('cover-image-preview');

    // Background Images Elements
    const bgImagesInput = document.getElementById('bg-images');
    const bgImageDropzone = document.getElementById('bg-image-dropzone');
    const selectBgImagesBtn = document.getElementById('select-bg-images-btn');
    const bgImagePreview = document.getElementById('bg-image-preview');

    // Frame Image Elements
    const frameImageInput = document.getElementById('frame-image-input');
    const frameImageDropzone = document.getElementById('frame-image-dropzone');
    const selectFrameImageBtn = document.getElementById('select-frame-image-btn');
    const frameImagePreview = document.getElementById('frame-image-preview');

    // Overlay Options
    const overlayOpacityInput = document.getElementById('overlay-opacity');

    // Text Options
    const textColorInput = document.getElementById('text-color');
    const fontSizeInput = document.getElementById('font-size');
    const fontFamilySelect = document.getElementById('font-family');
    const lineSpacingInput = document.getElementById('line-spacing');
    const linkColorInput = document.getElementById('link-color');

    // Buttons
    const generateBtn = document.getElementById('generate-btn');
    const manualPreview = document.getElementById('manual-preview');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const currentPageSpan = document.getElementById('current-page');
    const downloadImagesBtn = document.getElementById('download-images-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const downloadOptimizedPdfBtn = document.getElementById('download-optimized-pdf-btn'); // New Button

    // Data Variables
    let coverImage = null; // Single image
    let backgroundImages = []; // Array of images
    let frameImage = null; // Single image
    let pages = [];
    let currentPageIndex = 0;

    // Helper function to validate elements
    function validateElements() {
        const elements = [
            markdownInput,
            markdownDropzone,
            coverImageInput,
            coverImageDropzone,
            selectCoverImageBtn,
            coverImagePreview,
            bgImagesInput,
            bgImageDropzone,
            selectBgImagesBtn,
            bgImagePreview,
            frameImageInput,
            frameImageDropzone,
            selectFrameImageBtn,
            frameImagePreview,
            overlayOpacityInput,
            textColorInput,
            fontSizeInput,
            fontFamilySelect,
            lineSpacingInput,
            linkColorInput,
            generateBtn,
            manualPreview,
            prevPageBtn,
            nextPageBtn,
            currentPageSpan,
            downloadImagesBtn,
            downloadPdfBtn,
            downloadOptimizedPdfBtn // Validate new button
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

    // Handle Cover Image Drop Zone
    coverImageDropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        coverImageDropzone.classList.add('dragover');
    });

    coverImageDropzone.addEventListener('dragleave', (event) => {
        event.preventDefault();
        coverImageDropzone.classList.remove('dragover');
    });

    coverImageDropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        coverImageDropzone.classList.remove('dragover');
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                handleCoverImageFile(file);
            } else {
                alert('Only image files (PNG, JPEG) are allowed for cover image.');
            }
        }
    });

    // Handle Select Cover Image Button Click
    selectCoverImageBtn.addEventListener('click', () => {
        coverImageInput.click();
    });

    // Handle Cover Image Upload via File Input
    coverImageInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                handleCoverImageFile(file);
            } else {
                alert('Only image files (PNG, JPEG) are allowed for cover image.');
            }
        }
    });

    // Function to handle cover image file
    function handleCoverImageFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const croppedDataUrl = cropImageToA4(img);
                coverImage = croppedDataUrl;
                displayImagePreview(coverImagePreview, croppedDataUrl);
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }

    // Handle Background Images Drop Zone
    bgImageDropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        bgImageDropzone.classList.add('dragover');
    });

    bgImageDropzone.addEventListener('dragleave', (event) => {
        event.preventDefault();
        bgImageDropzone.classList.remove('dragover');
    });

    bgImageDropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        bgImageDropzone.classList.remove('dragover');
        const files = event.dataTransfer.files;
        handleBgImageFiles(files);
    });

    // Handle Select Background Images Button Click
    selectBgImagesBtn.addEventListener('click', () => {
        bgImagesInput.click();
    });

    // Handle Background Images Upload via File Input
    bgImagesInput.addEventListener('change', (event) => {
        const files = event.target.files;
        handleBgImageFiles(files);
    });

    // Function to handle background image files with cropping to A4 aspect ratio
    function handleBgImageFiles(files) {
        for (let file of files) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const croppedDataUrl = cropImageToA4(img);
                        backgroundImages.push(croppedDataUrl);
                        displayImagePreview(bgImagePreview, croppedDataUrl, true); // sortable = true
                    }
                    img.src = e.target.result;
                }
                reader.readAsDataURL(file);
            } else {
                alert('Only image files (PNG, JPEG) are allowed for background images.');
            }
        }
    }

    // Handle Frame Image Drop Zone
    frameImageDropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        frameImageDropzone.classList.add('dragover');
    });

    frameImageDropzone.addEventListener('dragleave', (event) => {
        event.preventDefault();
        frameImageDropzone.classList.remove('dragover');
    });

    frameImageDropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        frameImageDropzone.classList.remove('dragover');
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'image/png') {
                handleFrameImageFile(file);
            } else {
                alert('Only PNG image files are allowed for frame image.');
            }
        }
    });

    // Handle Select Frame Image Button Click
    selectFrameImageBtn.addEventListener('click', () => {
        frameImageInput.click();
    });

    // Handle Frame Image Upload via File Input
    frameImageInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'image/png') {
                handleFrameImageFile(file);
            } else {
                alert('Only PNG image files are allowed for frame image.');
            }
        }
    });

    // Function to handle frame image file
    function handleFrameImageFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // No cropping for frame image
                frameImage = e.target.result;
                displayImagePreview(frameImagePreview, frameImage);
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }

    // Function to display image preview
    function displayImagePreview(previewContainer, dataUrl, isSortable = false) {
        if (isSortable) {
            // For sortable background images, append multiple images
            const img = document.createElement('img');
            img.src = dataUrl;
            img.draggable = true;
            // Implement drag and drop for reordering
            img.addEventListener('dragstart', handleDragStart);
            img.addEventListener('dragover', handleDragOver);
            img.addEventListener('drop', handleDrop);
            img.addEventListener('dragend', handleDragEnd);
            previewContainer.appendChild(img);
        } else {
            // For single images like cover and frame, replace existing preview
            previewContainer.innerHTML = ''; // Clear previous previews
            const img = document.createElement('img');
            img.src = dataUrl;
            previewContainer.appendChild(img);
        }
    }

    // Drag and Drop Reordering Handlers for Background Images
    let dragSrcEl = null;

    function handleDragStart(e) {
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.outerHTML);
        this.classList.add('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDrop(e) {
        e.stopPropagation();
        if (dragSrcEl !== this) {
            // Replace the dropped element with the dragged one
            dragSrcEl.outerHTML = this.outerHTML;
            this.outerHTML = e.dataTransfer.getData('text/html');

            // Reattach event listeners
            initializeSortable();

            // Update backgroundImages array based on new order
            const srcs = Array.from(bgImagePreview.querySelectorAll('img')).map(img => img.src);
            backgroundImages = srcs;
        }
        return false;
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
    }

    // Initialize drag and drop handlers for existing images
    function initializeSortable() {
        const imgs = bgImagePreview.querySelectorAll('img');
        imgs.forEach(img => {
            img.addEventListener('dragstart', handleDragStart);
            img.addEventListener('dragover', handleDragOver);
            img.addEventListener('drop', handleDrop);
            img.addEventListener('dragend', handleDragEnd);
        });
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

        if (!coverImage) {
            alert('Please upload a cover image.');
            return;
        }

        // Check if no background images are uploaded; if so, use a single black background
        if (backgroundImages.length === 0) {
            backgroundImages.push(null); // Using null to denote black background
        }

        // Split markdown into pages based on '---'
        const markdownPages = markdownText.split(/^---$/m).map(page => page.trim()).filter(page => page.length > 0);

        // Assign background images to content pages
        // If fewer background images than pages, rotate or use last image
        const contentPages = markdownPages.map((pageContent, index) => {
            return {
                content: pageContent,
                bgImage: backgroundImages[index % backgroundImages.length] // Rotate images or use null for black
            };
        });

        // Combine cover page and content pages
        pages = [
            {
                content: '', // No text on cover page
                bgImage: coverImage
            },
            ...contentPages
        ];

        // Reset current page index
        currentPageIndex = 0;

        // Render initial preview
        renderPreviewPage(pages, currentPageIndex);

        // Enable navigation buttons if multiple pages
        if (pages.length > 1) {
            nextPageBtn.disabled = false;
            prevPageBtn.disabled = true;
        } else {
            nextPageBtn.disabled = true;
            prevPageBtn.disabled = true;
        }

        // Store pages globally for download functionality
        manualPreview.dataset.pages = JSON.stringify(pages);
        manualPreview.dataset.frameImage = frameImage || ''; // Store frame image
    });

    // Render a specific preview page
    function renderPreviewPage(pages, index) {
        if (!pages || index < 0 || index >= pages.length) {
            console.error('Invalid page data or index.');
            return;
        }

        manualPreview.innerHTML = ''; // Clear current preview

        const page = pages[index];

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

        // Create frame image if exists and not cover page
        if (frameImage && index !== 0) {
            const frameImg = document.createElement('img');
            frameImg.src = frameImage;
            frameImg.classList.add('frame');
            pageDiv.appendChild(frameImg);
        }

        // Create overlay div only for content pages (not cover page)
        let overlayDiv = null;
        if (index !== 0) {
            overlayDiv = document.createElement('div');
            overlayDiv.classList.add('overlay');
            overlayDiv.style.backgroundColor = `rgba(0, 0, 0, ${overlayOpacityInput.value})`;
            pageDiv.appendChild(overlayDiv);
        }

        // Create content div only if not cover page
        if (index !== 0) {
            const contentDiv = document.createElement('div');
            contentDiv.classList.add('content');

            // Apply dynamic styles
            contentDiv.style.color = textColorInput.value;
            contentDiv.style.fontSize = `${fontSizeInput.value}px`;
            contentDiv.style.fontFamily = fontFamilySelect.value;
            contentDiv.style.setProperty('--link-color', linkColorInput.value);
            contentDiv.style.lineHeight = `${lineSpacingInput.value}`;

            // Convert Markdown to HTML and remove {#...} tags
            const cleanContent = page.content.replace(/\s*\{#.*?\}/g, '');
            let htmlContent = marked.parse(cleanContent);

            contentDiv.innerHTML = htmlContent;

            // Replace link colors
            const links = contentDiv.querySelectorAll('a');
            links.forEach(link => {
                link.style.color = linkColorInput.value;
            });

            // Handle shadow
            const shadowSpread = 4; // Fixed shadow spread (can be made configurable)
            contentDiv.style.textShadow = `0px 0px ${shadowSpread}px rgba(0,0,0,1)`;

            // Append content
            pageDiv.appendChild(contentDiv);

            // Adjust line spacing if necessary
            adjustLineSpacing(contentDiv, parseFloat(lineSpacingInput.value), 1.2); // compressed line spacing 1.2
        }

        // Add page number if not cover page
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
        currentPageSpan.textContent = `${displayPageNumber} of ${pages.length}`;
    }

    // Function to adjust line spacing based on content height
    function adjustLineSpacing(contentDiv, currentLineSpacing, compressedLineSpacing) {
        // Clone the content div to measure height
        const clone = contentDiv.cloneNode(true);
        clone.style.visibility = 'hidden';
        clone.style.position = 'absolute';
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.width = contentDiv.offsetWidth + 'px';
        clone.style.lineHeight = currentLineSpacing;
        document.body.appendChild(clone);

        const contentHeight = clone.scrollHeight;
        const pageContentHeight = contentDiv.offsetHeight;

        // Remove the clone
        document.body.removeChild(clone);

        if (contentHeight > (pageContentHeight * (2 / 3))) {
            // Apply compressed line spacing
            contentDiv.style.lineHeight = compressedLineSpacing;
        } else {
            // Apply default line spacing
            contentDiv.style.lineHeight = currentLineSpacing;
        }
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
        const frameImg = manualPreview.dataset.frameImage;
        if (pageData.length === 0) {
            alert('Please generate the manual first.');
            return;
        }

        for (let i = 0; i < pageData.length; i++) {
            await renderFullPage(pageData[i], i, frameImg).then(canvas => {
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
        const frameImg = manualPreview.dataset.frameImage;
        if (pageData.length === 0) {
            alert('Please generate the manual first.');
            return;
        }

        const pdf = new jsPDF('p', 'mm', 'a4');

        for (let i = 0; i < pageData.length; i++) {
            await renderFullPage(pageData[i], i, frameImg).then(canvas => {
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

    // Handle Download as Optimized PDF (New Functionality)
    downloadOptimizedPdfBtn.addEventListener('click', async () => {
        const { jsPDF } = window.jspdf;
        const pageData = JSON.parse(manualPreview.dataset.pages || '[]');
        const frameImg = manualPreview.dataset.frameImage;
        if (pageData.length === 0) {
            alert('Please generate the manual first.');
            return;
        }

        const pdf = new jsPDF('p', 'mm', 'a4');

        for (let i = 0; i < pageData.length; i++) {
            await renderFullPage(pageData[i], i, frameImg).then(canvas => {
                const imgData = canvas.toDataURL('image/jpeg', 0.6); // Use JPEG with 60% quality
                if (i > 0) {
                    pdf.addPage();
                }
                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297); // A4 size in mm
            }).catch(err => {
                console.error('Error capturing page:', err);
            });
        }

        pdf.save('manual_optimized.pdf');
    });

    // Helper function to render a full page and return canvas
    function renderFullPage(page, index, frameImg) {
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

            // Create frame image if exists and not cover page
            if (frameImg && index !== 0) {
                const frameImageElem = document.createElement('img');
                frameImageElem.src = frameImg;
                frameImageElem.classList.add('frame');
                tempDiv.appendChild(frameImageElem);
            }

            // Create overlay div only for content pages (not cover page)
            if (index !== 0) {
                const overlayDiv = document.createElement('div');
                overlayDiv.classList.add('overlay');
                overlayDiv.style.backgroundColor = `rgba(0, 0, 0, ${overlayOpacityInput.value})`;
                tempDiv.appendChild(overlayDiv);
            }

            // Create content div only if not cover page
            if (index !== 0) {
                const contentDiv = document.createElement('div');
                contentDiv.classList.add('content');

                // Apply dynamic styles
                contentDiv.style.color = textColorInput.value;
                contentDiv.style.fontSize = `${fontSizeInput.value}px`;
                contentDiv.style.fontFamily = fontFamilySelect.value;
                contentDiv.style.setProperty('--link-color', linkColorInput.value);
                contentDiv.style.lineHeight = `${lineSpacingInput.value}`;

                // Convert Markdown to HTML and remove {#...} tags
                const cleanContent = page.content.replace(/\s*\{#.*?\}/g, '');
                let htmlContent = marked.parse(cleanContent);

                contentDiv.innerHTML = htmlContent;

                // Replace link colors
                const links = contentDiv.querySelectorAll('a');
                links.forEach(link => {
                    link.style.color = linkColorInput.value;
                });

                // Handle shadow
                const shadowSpread = 4; // Fixed shadow spread (can be made configurable)
                contentDiv.style.textShadow = `0px 0px ${shadowSpread}px rgba(0,0,0,1)`;

                // Append content
                tempDiv.appendChild(contentDiv);

                // Adjust line spacing if necessary
                adjustLineSpacing(contentDiv, parseFloat(lineSpacingInput.value), 1.2); // compressed line spacing 1.2
            }

            // Add page number if not cover page
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

    // Optimized Render Function for Lower Resolution and JPEG Compression
    function renderFullPageOptimized(page, index, frameImg) {
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

            // Create frame image if exists and not cover page
            if (frameImg && index !== 0) {
                const frameImageElem = document.createElement('img');
                frameImageElem.src = frameImg;
                frameImageElem.classList.add('frame');
                tempDiv.appendChild(frameImageElem);
            }

            // Create overlay div only for content pages (not cover page)
            if (index !== 0) {
                const overlayDiv = document.createElement('div');
                overlayDiv.classList.add('overlay');
                overlayDiv.style.backgroundColor = `rgba(0, 0, 0, ${overlayOpacityInput.value})`;
                tempDiv.appendChild(overlayDiv);
            }

            // Create content div only if not cover page
            if (index !== 0) {
                const contentDiv = document.createElement('div');
                contentDiv.classList.add('content');

                // Apply dynamic styles
                contentDiv.style.color = textColorInput.value;
                contentDiv.style.fontSize = `${fontSizeInput.value}px`;
                contentDiv.style.fontFamily = fontFamilySelect.value;
                contentDiv.style.setProperty('--link-color', linkColorInput.value);
                contentDiv.style.lineHeight = `${lineSpacingInput.value}`;

                // Convert Markdown to HTML and remove {#...} tags
                const cleanContent = page.content.replace(/\s*\{#.*?\}/g, '');
                let htmlContent = marked.parse(cleanContent);

                contentDiv.innerHTML = htmlContent;

                // Replace link colors
                const links = contentDiv.querySelectorAll('a');
                links.forEach(link => {
                    link.style.color = linkColorInput.value;
                });

                // Handle shadow
                const shadowSpread = 4; // Fixed shadow spread (can be made configurable)
                contentDiv.style.textShadow = `0px 0px ${shadowSpread}px rgba(0,0,0,1)`;

                // Append content
                tempDiv.appendChild(contentDiv);

                // Adjust line spacing if necessary
                adjustLineSpacing(contentDiv, parseFloat(lineSpacingInput.value), 1.2); // compressed line spacing 1.2
            }

            // Add page number if not cover page
            if (index > 0) {
                const pageNumberDiv = document.createElement('div');
                pageNumberDiv.classList.add('page-number');
                pageNumberDiv.textContent = `Page ${index}`;
                tempDiv.appendChild(pageNumberDiv);
            }

            // Append tempDiv to body temporarily for rendering
            document.body.appendChild(tempDiv);

            // Use html2canvas to capture the tempDiv at lower scale for optimized PDF
            html2canvas(tempDiv, { scale: 1.5 }).then(canvas => {
                document.body.removeChild(tempDiv);
                resolve(canvas);
            }).catch(err => {
                document.body.removeChild(tempDiv);
                reject(err);
            });
        });
    }

});
