const tools = [
  ["PDF Merge", "PDF", "file-plus-2", "Combine multiple PDF files into one document."],
  ["PDF Split", "PDF", "scissors", "Extract selected pages from a PDF file."],
  ["PDF Compress", "PDF", "archive", "Optimize a PDF and download a new copy."],
  ["PDF to Word", "PDF", "file-text", "Export readable PDF text as a Word document."],
  ["PDF to JPG", "PDF", "image", "Export PDF pages as JPG images."],
  ["PDF Rotate", "PDF", "rotate-cw", "Rotate all pages 90 degrees."],
  ["PDF Protect", "PDF", "lock", "Create a password-encrypted file package."],
  ["Word to PDF", "PDF", "file-type", "Turn readable text documents into PDFs."],
  ["JPG to PDF", "PDF", "images", "Combine JPG or PNG images into a PDF."],
  ["PDF Signature", "PDF", "signature", "Draw a signature and place it on a PDF."],
  ["Image Resize", "Image", "maximize", "Resize images by width and height."],
  ["Image Convert", "Image", "repeat", "Convert JPG, PNG and WEBP images."],
  ["Image Crop", "Image", "crop", "Drag to select and crop any area, like Photoshop."],
  ["Blur or Pixelate Area", "Image", "scan", "Blur or pixelate the center area of an image."],
  ["Round Corners", "Image", "square-round-corner", "Add rounded corners and export as PNG."],
  ["Image Protect ZIP", "Image", "shield", "Encrypt an image and package it in a ZIP archive."],
  ["Image Watermark", "Image", "badge", "Add a text or logo watermark and drag it into place."],
  ["Image Grayscale", "Image", "contrast", "Convert an image to grayscale."],
  ["Word Counter", "Text", "whole-word", "Count words, sentences and reading time."],
  ["Character Counter", "Text", "pilcrow", "Count characters with and without spaces."],
  ["Case Converter", "Text", "case-sensitive", "Switch text between common case styles."],
  ["Remove Line Spaces", "Text", "list-x", "Remove blank lines and extra spaces from text."],
  ["Text to Word", "Text", "file-down", "Download text as a Word-compatible document."],
  ["Slug Generator", "Text", "link-2", "Create clean URL slugs from titles."],
  ["Duplicate Line Remover", "Text", "list-minus", "Remove repeated lines from pasted text."],
  ["Line Sorter", "Text", "arrow-down-a-z", "Sort text lines alphabetically."],
  ["QR Code Generator", "Utility", "qr-code", "Create and download a QR code."],
  ["Color Picker", "Utility", "palette", "Pick colors and copy HEX, RGB and HSL values."],
  ["Password Generator", "Utility", "key-round", "Generate passwords and download a ZIP."],
  ["Unit Converter", "Utility", "ruler", "Convert common length, weight and temperature units."],
  ["Invoice Generator", "Utility", "receipt", "Create and download an invoice."],
  ["BMI Calculator", "Utility", "activity", "Calculate body mass index."],
  ["Age Calculator", "Utility", "calendar-days", "Calculate age from date of birth."],
  ["Tip Calculator", "Utility", "badge-dollar-sign", "Split bills and tips quickly."],
  ["URL Encoder/Decoder", "Utility", "link", "Encode or decode URL text."],
  ["Base64 Encoder/Decoder", "Utility", "binary", "Encode or decode Base64 text."],
  ["Random Number Generator", "Utility", "dice-5", "Generate a random number in a range."],
  ["UUID Generator", "Utility", "fingerprint", "Create random UUID values."],
  ["Stopwatch", "Utility", "timer", "Start, stop and reset a stopwatch."],
  ["Countdown Timer", "Utility", "alarm-clock", "Run a simple countdown timer."]
].map(([name, category, icon, desc]) => ({
  id: name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  name,
  category,
  icon,
  desc
}));

const routeAliases = {
  "merge-pdf": "pdf-merge",
  "merger-pdf": "pdf-merge",
  "split-pdf": "pdf-split",
  "compress-pdf": "pdf-compress",
  "rotate-pdf": "pdf-rotate",
  "protect-pdf": "pdf-protect",
  "sign-pdf": "pdf-signature"
};

function toolHref(tool) {
  if (location.protocol === "file:") return `tool.html?tool=${tool.id}`;
  return `/${tool.id}`;
}

function resolveToolIdFromUrl() {
  const queryId = new URLSearchParams(location.search).get("tool");
  if (queryId) return queryId;
  const path = location.pathname.split("/").filter(Boolean).pop() || "";
  const slug = path.replace(/\.html$/, "");
  return routeAliases[slug] || slug;
}

const grid = document.querySelector("#toolGrid");
const search = document.querySelector("#toolSearch");
const filters = document.querySelectorAll(".filter");
const modal = document.querySelector("#toolModal");
const modalBody = document.querySelector("#modalBody");
const toolPage = document.querySelector("#toolPage");
let currentFilter = "all";
let stopwatchTimer = null;
let stopwatchStart = 0;
let stopwatchElapsed = 0;
let countdownTimer = null;

function init() {
  if (grid) {
    updateToolCounts();
    renderGrid();
    search?.addEventListener("input", renderGrid);
    filters.forEach((button) => {
      button.addEventListener("click", () => {
        filters.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        currentFilter = button.dataset.filter;
        renderGrid();
      });
    });
  }
  if (toolPage) renderToolPage();
  document.querySelectorAll("[data-close]").forEach((item) => item.addEventListener("click", closeTool));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTool();
  });
  refreshIcons();
}

function renderGrid() {
  const term = search?.value.trim().toLowerCase() || "";
  const filtered = tools.filter((tool) => {
    return (currentFilter === "all" || tool.category === currentFilter) && tool.name.toLowerCase().includes(term);
  });
  grid.innerHTML = "";
  const noResults = document.querySelector("#noResults");
  if (noResults) noResults.style.display = filtered.length ? "none" : "block";
  filtered.forEach((tool) => {
    const card = document.createElement("a");
    card.className = "tool-card";
    card.href = toolHref(tool);
    card.innerHTML = `
      <span class="tool-icon" style="background:${categoryColor(tool.category)}"><i data-lucide="${tool.icon}"></i></span>
      <h3>${tool.name}</h3>
      <p>${tool.desc}</p>
      <span class="tag">${tool.category} tool</span>
    `;
    grid.appendChild(card);
  });
  refreshIcons();
}

function updateToolCounts() {
  const counts = tools.reduce((acc, tool) => {
    acc.all += 1;
    acc[tool.category] = (acc[tool.category] || 0) + 1;
    return acc;
  }, { all: 0 });
  Object.entries({ countAll: counts.all, countPDF: counts.PDF, countImage: counts.Image, countText: counts.Text, countUtility: counts.Utility }).forEach(([id, count]) => {
    const node = document.querySelector(`#${id}`);
    if (node) node.textContent = count || 0;
  });
}

function toggleMobileMenu() {
  document.querySelector("#mobileMenu")?.classList.toggle("open");
}

window.toggleMobileMenu = toggleMobileMenu;

function renderToolPage() {
  const id = resolveToolIdFromUrl();
  const tool = tools.find((item) => item.id === id) || tools[0];
  document.title = `${tool.name} - ToolzEasy`;
  toolPage.innerHTML = `
    <section class="page-hero tool-page-hero">
      <div class="tool-title-inner">
        <p class="eyebrow">${tool.category} tool</p>
        <h1>${tool.name}</h1>
        <p class="hero-text">${tool.desc}</p>
      </div>
    </section>
    <section class="tool-page-wrap">
      <div class="tool-shell">
        <div class="tool-shell-top">
          <a class="back-link" href="index.html#tools">All tools</a>
          <span>${tool.category}</span>
        </div>
        <div class="tool-body">${toolMarkup(tool)}</div>
      </div>
    </section>
  `;
  bindTool(tool, toolPage);
  refreshIcons();
}

function categoryColor(category) {
  return { PDF: "var(--rose)", Image: "var(--mint)", Text: "var(--amber)", Utility: "var(--soft)" }[category] || "var(--soft)";
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function openTool(tool) {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  modalBody.innerHTML = `<div class="tool-body"><p class="eyebrow">${tool.category} tool</p><h2 id="modalTitle">${tool.name}</h2>${toolMarkup(tool)}</div>`;
  bindTool(tool, modalBody);
  refreshIcons();
}

function closeTool() {
  modal?.classList.remove("open");
  modal?.setAttribute("aria-hidden", "true");
}

function toolMarkup(tool) {
  if (tool.category === "PDF") return pdfToolMarkup(tool);
  if (tool.category === "Image") return imageToolMarkup(tool);
  if (tool.category === "Text") return textToolMarkup(tool);
  return utilityToolMarkup(tool);
}

function pdfToolMarkup(tool) {
  const accepts = tool.name === "JPG to PDF" ? "image/jpeg,image/png" : tool.name === "Word to PDF" ? ".txt,.doc,.docx" : ".pdf";
  const multiple = ["PDF Merge", "JPG to PDF"].includes(tool.name) ? "multiple" : "";
  const pageControls = tool.name === "PDF Split" ? `<input class="control" id="pdfPages" placeholder="Pages, example: 1-3,5">` : "";
  const passwordControl = tool.name === "PDF Protect" ? `<input class="control" id="pdfPassword" type="password" placeholder="Password">` : "";
  const signatureControl = tool.name === "PDF Signature" ? `
    <input class="control" id="sigPage" type="number" min="1" value="1" placeholder="Page number">
    <button class="button secondary action-button" type="button" data-open-signature>Draw signature</button>
    <div class="signature-pad-wrap" hidden>
      <canvas id="signaturePad" width="520" height="180"></canvas>
      <div class="signature-actions">
        <button class="button secondary" type="button" data-clear-signature>Clear</button>
        <button class="button primary" type="button" data-save-signature>OK</button>
      </div>
    </div>
    <label>Signature size <input id="sigSize" type="range" min="80" max="280" value="160"></label>
    <p class="helper-text">After drawing, drag the signature on the PDF preview to set the exact position.</p>
  ` : "";
  return `
    <div class="tool-layout">
      <div class="panel controls">
        <h3>Upload</h3>
        <input class="control" id="pdfInput" type="file" ${multiple} accept="${accepts}">
        ${pageControls}
        ${passwordControl}
        ${signatureControl}
        <button class="button primary action-button" type="button" data-pdf-action>${tool.name}</button>
        <a class="button secondary action-button" id="pdfDownload" hidden>Download</a>
      </div>
      <div class="panel">
        <h3>Status</h3>
        <div class="result ${tool.name === "PDF Signature" ? "pdf-sign-result" : ""}" data-result>${tool.name === "PDF Signature" ? `<div class="pdf-sign-preview" id="pdfSignPreview">Upload a PDF to preview the page here.</div>` : "Choose a file and process it in your browser."}</div>
      </div>
    </div>`;
}

function imageToolMarkup(tool) {
  if (tool.name === "Blur or Pixelate Area") {
    return `
      <div class="tool-layout">
        <div class="panel controls">
          <h3>Settings</h3>
          <input class="control" id="imageInput" type="file" accept="image/*">
          <label class="form-field"><span>Effect</span>
            <select class="control" id="areaMode">
              <option value="blur">Blur</option>
              <option value="pixelate">Pixelate</option>
            </select>
          </label>
          <label class="form-field"><span>Shape</span>
            <select class="control" id="shapeMode">
              <option value="rect">Rectangle</option>
              <option value="ellipse">Ellipse</option>
            </select>
          </label>
          <label class="form-field"><span>Strength</span>
            <input id="blurStrength" type="range" min="4" max="40" value="16">
          </label>
          <button class="button secondary action-button" type="button" data-clear-shapes>🗑 Clear shapes</button>
          <button class="button primary action-button" type="button" data-image-action>Apply &amp; Download</button>
          <a class="button secondary action-button" id="imageDownload" hidden>⬇ Download</a>
          <p class="helper-text" style="margin-top:8px;">1. Upload image &nbsp;2. Drag to draw shapes &nbsp;3. Click Apply</p>
        </div>
        <div class="panel canvas-preview" id="imagePreview" style="min-height:260px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:0.9rem;">
          Upload an image to start drawing.
        </div>
      </div>`;
  }
  if (tool.name === "Image Crop") {
    return `
      <div class="tool-layout">
        <div class="panel controls">
          <h3>Crop</h3>
          <input class="control" id="imageInput" type="file" accept="image/*">
          <select class="control" id="imgFormat">
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WEBP</option>
          </select>
          <button class="button primary action-button" type="button" data-image-action>Crop &amp; Download</button>
          <a class="button secondary action-button" id="imageDownload" hidden>Download</a>
          <p class="helper-text" style="margin-top:8px;">1. Upload image &nbsp;2. Drag the box, or its corner dots, to select the area &nbsp;3. Click Crop &amp; Download</p>
        </div>
        <div class="panel canvas-preview" id="imagePreview" style="min-height:260px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:0.9rem;">
          Upload an image to start cropping.
        </div>
      </div>`;
  }
  if (tool.name === "Image Watermark") {
    return `
      <div class="tool-layout">
        <div class="panel controls">
          <h3>Watermark</h3>
          <input class="control" id="imageInput" type="file" accept="image/*">
          <input class="control" id="watermarkText" placeholder="Watermark text, optional">
          <input class="control" id="watermarkLogo" type="file" accept="image/*">
          <label class="form-field"><span>Size</span><input id="watermarkSize" type="range" min="10" max="60" value="26"></label>
          <label class="form-field"><span>Opacity</span><input id="watermarkOpacity" type="range" min="0.2" max="1" step="0.05" value="0.8"></label>
          <select class="control" id="imgFormat">
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WEBP</option>
          </select>
          <button class="button primary action-button" type="button" data-image-action>Apply &amp; Download</button>
          <a class="button secondary action-button" id="imageDownload" hidden>Download</a>
          <p class="helper-text" style="margin-top:8px;">1. Upload image &nbsp;2. Add text and/or a logo &nbsp;3. Click and drag on the image to position it &nbsp;4. Download</p>
        </div>
        <div class="panel canvas-preview" id="imagePreview" style="min-height:260px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:0.9rem;">
          Upload an image to place a watermark.
        </div>
      </div>`;
  }
  const isProtect = tool.name === "Image Protect ZIP";
  const isRound = tool.name === "Round Corners";
  const round = isRound ? `<label>Corner radius <input id="cornerRadius" type="range" min="4" max="160" value="36"></label>` : "";
  const protect = isProtect ? `<input class="control" id="imagePassword" type="password" placeholder="Password for encrypted package">` : "";
  const sizeControls = tool.name === "Image Resize" ? `
        <input class="control" id="imgWidth" type="number" min="1" placeholder="Width, optional">
        <input class="control" id="imgHeight" type="number" min="1" placeholder="Height, optional">` : "";
  const formatControl = (isProtect || isRound) ? "" : `
        <select class="control" id="imgFormat">
          <option value="image/jpeg">JPG</option>
          <option value="image/png">PNG</option>
          <option value="image/webp">WEBP</option>
        </select>`;
  const qualityControl = tool.name === "Image Convert" ? `<label>Quality <input id="imgQuality" type="range" min="0.2" max="1" step="0.05" value="0.82"></label>` : "";
  return `
    <div class="tool-layout">
      <div class="panel controls">
        <h3>Image</h3>
        <input class="control" id="imageInput" type="file" accept="image/*">
        ${sizeControls}
        ${round}
        ${protect}
        ${formatControl}
        ${qualityControl}
        <button class="button primary action-button" type="button" data-image-action>${tool.name}</button>
        <a class="button secondary action-button" id="imageDownload" hidden>Download</a>
      </div>
      <div class="panel canvas-preview" id="imagePreview">Upload an image to preview it here.</div>
    </div>`;
}

function textToolMarkup(tool) {
  const mode = tool.name === "Case Converter" ? `<select class="control" id="caseMode"><option value="upper">UPPERCASE</option><option value="lower">lowercase</option><option value="title">Title Case</option><option value="sentence">Sentence case</option></select>` : "";
  const fileUpload = tool.name === "Text to Word" ? `<input class="control" id="textFileInput" type="file" accept=".txt,text/plain"><p class="helper-text" style="margin:-4px 0 6px;">Upload a .txt file, or paste text below. No typing needed if you upload.</p>` : "";
  return `<div class="tool-layout"><div class="panel controls"><h3>Input</h3>${fileUpload}<textarea id="textInput" placeholder="Paste text here"></textarea>${mode}<button class="button primary action-button" type="button" data-text-action>${tool.name}</button><a class="button secondary action-button" id="textDownload" hidden>Download</a></div><div class="panel"><h3>Result</h3><div class="result" data-result></div></div></div>`;
}

function utilityToolMarkup(tool) {
  const map = {
    "QR Code Generator": `<div class="tool-layout"><div class="panel controls"><input class="control" id="qrText" placeholder="Text or URL"><button class="button primary action-button" data-qr type="button">Generate QR</button><a class="button secondary action-button" id="qrDownload" download="toolzeasy-qr.png" hidden>Download QR</a></div><div class="panel canvas-preview"><div id="qrOut"></div></div></div>`,
    "Color Picker": `<div class="tool-layout"><div class="panel controls"><input class="control" id="colorInput" type="color" value="#1463ff"><button class="button primary action-button" data-color type="button">Show values</button></div><div class="panel"><div class="result" data-result></div></div></div>`,
    "Password Generator": `<div class="tool-layout"><div class="panel controls"><input class="control" id="passLength" type="number" min="8" max="64" value="16"><label><input id="passSymbols" type="checkbox" checked> Include symbols</label><button class="button primary action-button" data-password type="button">Generate password</button><a class="button secondary action-button" id="passZip" hidden>Download ZIP</a></div><div class="panel"><div class="result" data-result></div></div></div>`,
    "Unit Converter": `<div class="tool-layout"><div class="panel controls"><input class="control" id="unitValue" type="number" value="1"><select class="control" id="unitType"><option value="km-mi">Kilometers to miles</option><option value="mi-km">Miles to kilometers</option><option value="kg-lb">Kilograms to pounds</option><option value="lb-kg">Pounds to kilograms</option><option value="c-f">Celsius to Fahrenheit</option><option value="f-c">Fahrenheit to Celsius</option></select><button class="button primary action-button" data-unit type="button">Convert</button></div><div class="panel"><div class="result" data-result></div></div></div>`,
    "Invoice Generator": `
      <div class="tool-layout invoice-tool">
        <div class="panel controls">
          <h3>Invoice details</h3>
          <input class="control" id="invoiceFrom" placeholder="Your business name">
          <input class="control" id="invoiceClient" placeholder="Client name">
          <input class="control" id="invoiceNumber" placeholder="Invoice number" value="INV-001">
          <div class="invoice-two">
            <label class="form-field"><span>Invoice date</span><input class="control" id="invoiceDate" type="date"></label>
            <label class="form-field"><span>Due date</span><input class="control" id="invoiceDue" type="date"></label>
          </div>
          <div class="invoice-two">
            <label class="form-field"><span>Currency</span><select class="control" id="invoiceCurrency"><option value="$">USD $</option><option value="£">GBP £</option><option value="€">EUR €</option><option value="LKR ">LKR</option><option value="">No symbol</option></select></label>
            <label class="form-field"><span>Tax %</span><input class="control" id="invoiceTax" type="number" min="0" step="0.01" value="0"></label>
          </div>
          <label class="form-field"><span>Discount</span><input class="control" id="invoiceDiscount" type="number" min="0" step="0.01" value="0"></label>
          <h3>Items</h3>
          <div class="invoice-items" id="invoiceItems">
            <div class="invoice-row">
              <input class="control invoice-item-name" placeholder="Item or service">
              <input class="control invoice-item-qty" type="number" min="0" step="0.01" value="1" aria-label="Quantity">
              <input class="control invoice-item-rate" type="number" min="0" step="0.01" placeholder="Price" aria-label="Price">
              <button class="icon-mini" type="button" data-remove-invoice-item aria-label="Remove item">x</button>
            </div>
          </div>
          <button class="button secondary action-button" data-invoice-add type="button">Add item</button>
          <textarea id="invoiceNotes" placeholder="Notes or payment instructions"></textarea>
          <button class="button primary action-button" data-invoice type="button">Create invoice</button>
          <a class="button secondary action-button" id="invoiceDownload" hidden>Download invoice</a>
        </div>
        <div class="panel">
          <h3>Preview</h3>
          <div class="result invoice-result" data-result><div class="invoice-empty">Add invoice details and click Create invoice.</div></div>
        </div>
      </div>`,
    "BMI Calculator": `<div class="tool-layout"><div class="panel controls"><input class="control" id="heightCm" type="number" placeholder="Height in cm"><input class="control" id="weightKg" type="number" placeholder="Weight in kg"><button class="button primary action-button" data-bmi type="button">Calculate</button></div><div class="panel"><div class="result" data-result></div></div></div>`,
    "Age Calculator": `<div class="tool-layout"><div class="panel controls"><input class="control" id="birthDate" type="date"><button class="button primary action-button" data-age type="button">Calculate age</button></div><div class="panel"><div class="result" data-result></div></div></div>`,
    "Tip Calculator": `<div class="tool-layout"><div class="panel controls"><input class="control" id="billAmount" type="number" placeholder="Bill amount"><input class="control" id="tipPercent" type="number" value="15"><input class="control" id="peopleCount" type="number" value="1"><button class="button primary action-button" data-tip type="button">Calculate</button></div><div class="panel"><div class="result" data-result></div></div></div>`,
    "URL Encoder/Decoder": encoderMarkup("urlText", "data-url-encode", "data-url-decode"),
    "Base64 Encoder/Decoder": encoderMarkup("baseText", "data-base-encode", "data-base-decode"),
    "Random Number Generator": `<div class="tool-layout"><div class="panel controls"><input class="control" id="randMin" type="number" value="1"><input class="control" id="randMax" type="number" value="100"><button class="button primary action-button" data-random type="button">Generate</button></div><div class="panel"><div class="result" data-result></div></div></div>`,
    "UUID Generator": `<div class="tool-layout"><div class="panel controls"><input class="control" id="uuidCount" type="number" min="1" max="50" value="5"><button class="button primary action-button" data-uuid type="button">Generate UUIDs</button><a class="button secondary action-button" id="uuidDownload" hidden>Download</a></div><div class="panel"><div class="result" data-result></div></div></div>`,
    "Stopwatch": `<div class="tool-layout"><div class="panel controls"><button class="button primary action-button" data-stopwatch-start type="button">Start</button><button class="button secondary action-button" data-stopwatch-stop type="button">Stop</button><button class="button secondary action-button" data-stopwatch-reset type="button">Reset</button></div><div class="panel"><div class="result" data-result><strong id="stopwatchTime">00:00.0</strong></div></div></div>`,
    "Countdown Timer": `<div class="tool-layout"><div class="panel controls"><input class="control" id="countSeconds" type="number" min="1" value="60"><button class="button primary action-button" data-countdown-start type="button">Start countdown</button><button class="button secondary action-button" data-countdown-stop type="button">Stop</button></div><div class="panel"><div class="result" data-result><strong id="countdownTime">60s</strong></div></div></div>`
  };
  return map[tool.name] || `<div class="result">Tool interface is coming soon.</div>`;
}

function encoderMarkup(id, enc, dec) {
  return `<div class="tool-layout"><div class="panel controls"><textarea id="${id}" placeholder="Paste text"></textarea><button class="button primary action-button" ${enc} type="button">Encode</button><button class="button secondary action-button" ${dec} type="button">Decode</button></div><div class="panel"><div class="result" data-result></div></div></div>`;
}

function bindTool(tool, root) {
  enhanceToolForm(root);
  const result = root.querySelector("[data-result]");
  root.querySelector("[data-pdf-action]")?.addEventListener("click", () => runPdfTool(tool, root, result));
  root.querySelector("[data-image-action]")?.addEventListener("click", () => runImageTool(tool, root, result));
  root.querySelector("[data-text-action]")?.addEventListener("click", () => runTextTool(tool, root, result));
  bindUtility(root, result);
  if (tool.name === "Blur or Pixelate Area") bindAreaSelection(root);
  if (tool.name === "PDF Signature") bindSignaturePad(root);
  if (tool.name === "Image Crop") bindCropTool(root);
  if (tool.name === "Image Watermark") bindWatermarkTool(root);
  if (tool.name === "Text to Word") bindTextFileUpload(root);
  if (tool.name === "Invoice Generator") bindInvoiceTool(root, result);
}

function bindTextFileUpload(root) {
  root.querySelector("#textFileInput")?.addEventListener("change", async () => {
    const file = root.querySelector("#textFileInput")?.files[0];
    if (!file) return;
    const textarea = root.querySelector("#textInput");
    if (textarea) textarea.value = await file.text();
  });
}

function enhanceToolForm(root) {
  root.querySelectorAll(".controls > input.control, .controls > select.control, .controls > textarea").forEach((control) => {
    if (control.closest(".form-field")) return;
    const label = document.createElement("label");
    label.className = "form-field";
    const labelText = document.createElement("span");
    labelText.textContent = labelForControl(control);
    control.parentNode.insertBefore(label, control);
    label.appendChild(labelText);
    label.appendChild(control);
  });
}

function labelForControl(control) {
  const labels = {
    pdfInput: "Choose file",
    pdfPages: "Page range",
    pdfPassword: "Password",
    sigPage: "Page number",
    imageInput: "Choose image",
    imgWidth: "Width",
    imgHeight: "Height",
    areaMode: "Effect",
    magicSelectMode: "Selection mode",
    imgFormat: "Output format",
    watermarkText: "Watermark text",
    watermarkLogo: "Logo image, optional",
    watermarkSize: "Size",
    watermarkOpacity: "Opacity",
    imagePassword: "Password",
    textFileInput: "Upload .txt file",
    textInput: "Text",
    caseMode: "Case style",
    qrText: "Text or URL",
    colorInput: "Color",
    passLength: "Password length",
    unitValue: "Value",
    unitType: "Conversion",
    invoiceFrom: "Business name",
    invoiceClient: "Client name",
    invoiceNumber: "Invoice number",
    invoiceDiscount: "Discount",
    heightCm: "Height in cm",
    weightKg: "Weight in kg",
    birthDate: "Birth date",
    billAmount: "Bill amount",
    tipPercent: "Tip percent",
    peopleCount: "People",
    urlText: "URL text",
    baseText: "Base64 text",
    randMin: "Minimum",
    randMax: "Maximum",
    uuidCount: "How many",
    countSeconds: "Seconds"
  };
  return labels[control.id] || control.placeholder || "Value";
}

async function runPdfTool(tool, root, result) {
  const input = root.querySelector("#pdfInput");
  const files = [...(input?.files || [])];
  const download = root.querySelector("#pdfDownload");
  hideLink(download);
  if (!files.length) return setResult(result, "Choose a file first.");
  try {
    setResult(result, "Processing...");
    if (tool.name === "PDF Merge") return pdfMerge(files, result, download);
    if (tool.name === "PDF Split") return pdfSplit(files[0], root, result, download);
    if (tool.name === "PDF Compress") return pdfCompress(files[0], result, download);
    if (tool.name === "PDF to Word") return pdfToWord(files[0], result, download);
    if (tool.name === "PDF to JPG") return pdfToJpg(files[0], result, download);
    if (tool.name === "PDF Rotate") return pdfRotate(files[0], result, download);
    if (tool.name === "PDF Protect") return pdfProtect(files[0], root, result, download);
    if (tool.name === "Word to PDF") return textToPdf(files[0], result, download);
    if (tool.name === "JPG to PDF") return jpgToPdf(files, result, download);
    if (tool.name === "PDF Signature") return pdfSignature(files[0], root, result, download);
  } catch (error) {
    setResult(result, `Could not process this file. ${error.message || "Try another file."}`);
  }
}

function requirePdfLib() {
  if (!window.PDFLib) throw new Error("PDF library is still loading. Check internet connection and try again.");
  return window.PDFLib;
}

async function pdfMerge(files, result, download) {
  const { PDFDocument } = requirePdfLib();
  const merged = await PDFDocument.create();
  for (const file of files) {
    const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const copied = await merged.copyPages(source, source.getPageIndices());
    copied.forEach((page) => merged.addPage(page));
  }
  setDownload(download, await merged.save({ useObjectStreams: true }), "toolzeasy-merged.pdf", "application/pdf");
  setResult(result, `Merged ${files.length} PDF file${files.length === 1 ? "" : "s"}.`);
}

async function pdfSplit(file, root, result, download) {
  const { PDFDocument } = requirePdfLib();
  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const pages = parsePages(root.querySelector("#pdfPages")?.value || "", source.getPageCount());
  const output = await PDFDocument.create();
  const copied = await output.copyPages(source, pages);
  copied.forEach((page) => output.addPage(page));
  setDownload(download, await output.save({ useObjectStreams: true }), "toolzeasy-split.pdf", "application/pdf");
  setResult(result, `Created a PDF with ${pages.length} page${pages.length === 1 ? "" : "s"}.`);
}

async function pdfCompress(file, result, download) {
  const { PDFDocument } = requirePdfLib();
  const original = await file.arrayBuffer();
  const pdf = await PDFDocument.load(original, { ignoreEncryption: true });
  const bytes = await pdf.save({ useObjectStreams: true });
  setDownload(download, bytes, "toolzeasy-compressed.pdf", "application/pdf");
  setResult(result, `Saved optimized copy. Before: ${formatBytes(original.byteLength)}. After: ${formatBytes(bytes.byteLength)}.`);
}

async function pdfToWord(file, result, download) {
  const text = await extractPdfText(file);
  const html = `<html><body><pre>${escapeHtml(text || "No extractable text found.")}</pre></body></html>`;
  setDownload(download, new TextEncoder().encode(html), "toolzeasy-pdf-text.doc", "application/msword");
  setResult(result, "Created a Word-compatible text document.");
}

async function pdfToJpg(file, result, download) {
  if (!window.pdfjsLib) throw new Error("PDF render library is still loading.");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const zip = window.JSZip ? new JSZip() : null;
  let firstBlob = null;
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.7 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.9);
    if (!firstBlob) firstBlob = blob;
    zip?.file(`page-${pageNumber}.jpg`, blob);
  }
  if (zip && pdf.numPages > 1) {
    const zipBlob = await zip.generateAsync({ type: "blob" });
    setDownload(download, await zipBlob.arrayBuffer(), "toolzeasy-pdf-pages.zip", "application/zip");
  } else {
    setDownload(download, await firstBlob.arrayBuffer(), "toolzeasy-page-1.jpg", "image/jpeg");
  }
  setResult(result, `Converted ${pdf.numPages} page${pdf.numPages === 1 ? "" : "s"}.`);
}

async function pdfRotate(file, result, download) {
  const { PDFDocument, degrees } = requirePdfLib();
  const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  pdf.getPages().forEach((page) => page.setRotation(degrees((page.getRotation().angle + 90) % 360)));
  setDownload(download, await pdf.save({ useObjectStreams: true }), "toolzeasy-rotated.pdf", "application/pdf");
  setResult(result, "Rotated all pages 90 degrees clockwise.");
}

async function pdfProtect(file, root, result, download) {
  const password = root.querySelector("#pdfPassword")?.value || "";
  if (!password) return setResult(result, "Enter a password first.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const entryName = file.name.replace(/\.pdf$/i, "") + ".pdf";
  const zipBytes = await buildPasswordZip([{ name: entryName, bytes }], password);
  setDownload(download, zipBytes, "toolzeasy-protected.zip", "application/zip");
  setResult(result, "Created a password-protected ZIP. Your ZIP or file app will ask for this password when extracting. Note: this is ZIP encryption, not an Acrobat open-password PDF.");
}

async function textToPdf(file, result, download) {
  const { PDFDocument, StandardFonts, rgb } = requirePdfLib();
  const text = await file.text();
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  let page = pdf.addPage([595, 842]);
  let y = 792;
  wrapText(text || file.name, 88).forEach((line) => {
    if (y < 50) {
      page = pdf.addPage([595, 842]);
      y = 792;
    }
    page.drawText(line, { x: 44, y, size: 11, font, color: rgb(0.08, 0.13, 0.2) });
    y -= 17;
  });
  setDownload(download, await pdf.save({ useObjectStreams: true }), "toolzeasy-text.pdf", "application/pdf");
  setResult(result, "Created PDF from readable text.");
}

async function jpgToPdf(files, result, download) {
  const { PDFDocument } = requirePdfLib();
  const pdf = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const image = file.type.includes("png") ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  setDownload(download, await pdf.save({ useObjectStreams: true }), "toolzeasy-images.pdf", "application/pdf");
  setResult(result, `Created PDF from ${files.length} image${files.length === 1 ? "" : "s"}.`);
}

async function pdfSignature(file, root, result, download) {
  const { PDFDocument } = requirePdfLib();
  const signatureDataUrl = root._signatureDataUrl;
  if (!signatureDataUrl) {
    setResult(result, "Click Draw signature, sign with mouse/touch, then press OK.");
    return;
  }
  const placement = root._signaturePlacement;
  if (!placement) {
    setResult(result, "Drag your signature onto the PDF preview before signing.");
    return;
  }
  const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const signatureImage = await pdf.embedPng(signatureDataUrl);
  const page = pdf.getPages()[Math.min(placement.pageIndex, pdf.getPageCount() - 1)];
  page.drawImage(signatureImage, { x: placement.x, y: placement.y, width: placement.width, height: placement.height });
  setDownload(download, await pdf.save({ useObjectStreams: true }), "toolzeasy-signed.pdf", "application/pdf");
  setResult(result, `Added drawn signature to page ${placement.pageIndex + 1}.`);
}

function bindSignaturePad(root) {
  const wrap = root.querySelector(".signature-pad-wrap");
  const canvas = root.querySelector("#signaturePad");
  if (!wrap || !canvas) return;
  const ctx = canvas.getContext("2d");
  resetSignatureCanvas(canvas, ctx);
  let drawing = false;
  const point = (event) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = event.touches?.[0]?.clientX ?? event.clientX;
    const clientY = event.touches?.[0]?.clientY ?? event.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };
  const start = (event) => {
    event.preventDefault();
    drawing = true;
    const p = point(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (event) => {
    if (!drawing) return;
    event.preventDefault();
    const p = point(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const end = () => { drawing = false; };
  root.querySelector("[data-open-signature]")?.addEventListener("click", () => {
    wrap.hidden = false;
  });
  root.querySelector("[data-clear-signature]")?.addEventListener("click", () => {
    resetSignatureCanvas(canvas, ctx);
    root._signatureDataUrl = "";
  });
  root.querySelector("[data-save-signature]")?.addEventListener("click", () => {
    root._signatureDataUrl = trimCanvas(canvas).toDataURL("image/png");
    wrap.hidden = true;
    showSignatureOverlay(root);
  });
  root.querySelector("#pdfInput")?.addEventListener("change", () => renderPdfSignaturePreview(root));
  root.querySelector("#sigPage")?.addEventListener("change", () => renderPdfSignaturePreview(root));
  root.querySelector("#sigSize")?.addEventListener("input", () => showSignatureOverlay(root));
  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end);
}

async function renderPdfSignaturePreview(root) {
  const file = root.querySelector("#pdfInput")?.files[0];
  const preview = root.querySelector("#pdfSignPreview");
  if (!file || !preview) return;
  if (!window.pdfjsLib) {
    preview.textContent = "PDF preview library is still loading.";
    return;
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const data = await file.arrayBuffer();
  root._signaturePdfBytes = data.slice(0);
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pageNumber = Math.max(1, Math.min(pdf.numPages, Number(root.querySelector("#sigPage")?.value || 1)));
  root.querySelector("#sigPage").max = String(pdf.numPages);
  root.querySelector("#sigPage").value = String(pageNumber);
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1.25 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  preview.innerHTML = "";
  const stage = document.createElement("div");
  stage.className = "pdf-sign-stage";
  stage.appendChild(canvas);
  preview.appendChild(stage);
  root._pdfPreview = { pageNumber, pdfPageWidth: page.view[2], pdfPageHeight: page.view[3], previewWidth: canvas.width, previewHeight: canvas.height };
  showSignatureOverlay(root);
}

function showSignatureOverlay(root) {
  const stage = root.querySelector(".pdf-sign-stage");
  if (!stage || !root._signatureDataUrl) return;
  let box = stage.querySelector(".pdf-signature-box");
  if (!box) {
    box = document.createElement("div");
    box.className = "pdf-signature-box";
    box.innerHTML = `<img class="pdf-signature-overlay" alt="Signature preview"><span class="signature-resize-handle" aria-hidden="true"></span>`;
    stage.appendChild(box);
    makeDraggableSignature(root, box, stage);
    makeResizableSignature(root, box, stage);
  }
  const overlay = box.querySelector(".pdf-signature-overlay");
  overlay.src = root._signatureDataUrl;
  const width = Number(root.querySelector("#sigSize")?.value || 160);
  box.style.width = `${width}px`;
  box.style.left = box.style.left || `${Math.max(20, stage.clientWidth - width - 36)}px`;
  box.style.top = box.style.top || `${Math.max(20, stage.clientHeight - 90)}px`;
  updateSignaturePlacement(root, box, stage);
}

function makeDraggableSignature(root, box, stage) {
  let grab = null;
  const point = (event) => {
    const rect = stage.getBoundingClientRect();
    const clientX = event.touches?.[0]?.clientX ?? event.clientX;
    const clientY = event.touches?.[0]?.clientY ?? event.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };
  const down = (event) => {
    if (event.target.closest(".signature-resize-handle")) return;
    event.preventDefault();
    const p = point(event);
    grab = { x: p.x - box.offsetLeft, y: p.y - box.offsetTop };
  };
  const move = (event) => {
    if (!grab) return;
    event.preventDefault();
    const p = point(event);
    const left = Math.max(0, Math.min(stage.clientWidth - box.offsetWidth, p.x - grab.x));
    const top = Math.max(0, Math.min(stage.clientHeight - box.offsetHeight, p.y - grab.y));
    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
    updateSignaturePlacement(root, box, stage);
  };
  const up = () => { grab = null; };
  box.addEventListener("mousedown", down);
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
  box.addEventListener("touchstart", down, { passive: false });
  window.addEventListener("touchmove", move, { passive: false });
  window.addEventListener("touchend", up);
}

function makeResizableSignature(root, box, stage) {
  const handle = box.querySelector(".signature-resize-handle");
  let resize = null;
  const clientX = (event) => event.touches?.[0]?.clientX ?? event.clientX;
  const down = (event) => {
    event.preventDefault();
    resize = { x: clientX(event), width: box.offsetWidth };
  };
  const move = (event) => {
    if (!resize) return;
    event.preventDefault();
    const width = Math.max(70, Math.min(stage.clientWidth - box.offsetLeft, resize.width + clientX(event) - resize.x));
    box.style.width = `${width}px`;
    const slider = root.querySelector("#sigSize");
    if (slider) slider.value = String(Math.max(Number(slider.min), Math.min(Number(slider.max), Math.round(width))));
    updateSignaturePlacement(root, box, stage);
  };
  const up = () => { resize = null; };
  handle.addEventListener("mousedown", down);
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
  handle.addEventListener("touchstart", down, { passive: false });
  window.addEventListener("touchmove", move, { passive: false });
  window.addEventListener("touchend", up);
}

function updateSignaturePlacement(root, box, stage) {
  if (!root._pdfPreview) return;
  const scaleX = root._pdfPreview.pdfPageWidth / stage.clientWidth;
  const scaleY = root._pdfPreview.pdfPageHeight / stage.clientHeight;
  const left = box.offsetLeft;
  const top = box.offsetTop;
  root._signaturePlacement = {
    pageIndex: root._pdfPreview.pageNumber - 1,
    x: left * scaleX,
    y: root._pdfPreview.pdfPageHeight - ((top + box.offsetHeight) * scaleY),
    width: box.offsetWidth * scaleX,
    height: box.offsetHeight * scaleY
  };
}

function resetSignatureCanvas(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#102033";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

function trimCanvas(source) {
  const ctx = source.getContext("2d");
  const data = ctx.getImageData(0, 0, source.width, source.height);
  let minX = source.width, minY = source.height, maxX = 0, maxY = 0;
  for (let y = 0; y < source.height; y++) {
    for (let x = 0; x < source.width; x++) {
      const i = (y * source.width + x) * 4;
      const isInk = data.data[i] < 245 || data.data[i + 1] < 245 || data.data[i + 2] < 245;
      if (!isInk) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX <= minX || maxY <= minY) return source;
  const padding = 10;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(source.width, maxX + padding);
  maxY = Math.min(source.height, maxY + padding);
  const output = document.createElement("canvas");
  output.width = maxX - minX;
  output.height = maxY - minY;
  output.getContext("2d").drawImage(source, minX, minY, output.width, output.height, 0, 0, output.width, output.height);
  return output;
}

async function extractPdfText(file) {
  if (!window.pdfjsLib) return "";
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(" "));
  }
  return pages.join("\n\n");
}

async function runImageTool(tool, root, result) {
  const input = root.querySelector("#imageInput");
  const file = input?.files[0];
  const download = root.querySelector("#imageDownload");
  hideLink(download);
  if (!file) return setResult(result, "Choose an image first.");
  if (tool.name === "Image Protect ZIP") return protectImageZip(file, root, result, download);

  // Blur/Pixelate: the base canvas already has the live preview applied —
  // just download it directly, no need to re-process
  if (tool.name === "Blur or Pixelate Area") {
    const shapes = root._blurShapes || [];
    if (shapes.length === 0) return setResult(result, "Draw at least one shape on the image first.");
    const base = root._blurBaseCanvas;
    if (!base) return setResult(result, "Upload an image first.");
    const format = root.querySelector("#imgFormat")?.value || "image/jpeg";
    const quality = Number(root.querySelector("#imgQuality")?.value || 0.82);
    const blob = await canvasToBlob(base, format, quality);
    setDownload(download, await blob.arrayBuffer(), `toolzeasy-${tool.id}.${extensionFor(format)}`, format);
    return setResult(result, `✓ ${shapes.length} area${shapes.length !== 1 ? "s" : ""} processed. Ready to download.`);
  }

  if (tool.name === "Image Crop") {
    const box = root._cropBox;
    const sourceImg = root._cropSourceImg;
    if (!box || !sourceImg) return setResult(result, "Upload an image and adjust the crop box first.");
    const sx = Math.round(box.x * sourceImg.naturalWidth);
    const sy = Math.round(box.y * sourceImg.naturalHeight);
    const sw = Math.max(1, Math.round(box.w * sourceImg.naturalWidth));
    const sh = Math.max(1, Math.round(box.h * sourceImg.naturalHeight));
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = sw;
    cropCanvas.height = sh;
    cropCanvas.getContext("2d").drawImage(sourceImg, sx, sy, sw, sh, 0, 0, sw, sh);
    const format = root.querySelector("#imgFormat")?.value || "image/jpeg";
    const blob = await canvasToBlob(cropCanvas, format, 0.92);
    setDownload(download, await blob.arrayBuffer(), `toolzeasy-${tool.id}.${extensionFor(format)}`, format);
    return setResult(result, `Cropped to ${sw}×${sh}px. Ready to download.`);
  }

  if (tool.name === "Image Watermark") {
    const wmCanvas = root._watermarkCanvas;
    if (!wmCanvas) return setResult(result, "Upload an image first.");
    const format = root.querySelector("#imgFormat")?.value || "image/jpeg";
    const blob = await canvasToBlob(wmCanvas, format, 0.92);
    setDownload(download, await blob.arrayBuffer(), `toolzeasy-${tool.id}.${extensionFor(format)}`, format);
    return setResult(result, "Watermark applied. Ready to download.");
  }

  const img = await loadImage(file);
  const { canvas, ctx } = drawBaseImage(img, root);
  if (tool.name === "Round Corners") applyRoundCorners(ctx, canvas, Number(root.querySelector("#cornerRadius")?.value || 36));
  if (tool.name === "Image Grayscale") applyGrayscale(ctx, canvas);
  const forcedPng = ["Round Corners"].includes(tool.name);
  const format = forcedPng ? "image/png" : root.querySelector("#imgFormat")?.value || "image/jpeg";
  const quality = Number(root.querySelector("#imgQuality")?.value || 0.82);
  const blob = await canvasToBlob(canvas, format, quality);
  const preview = root.querySelector("#imagePreview");
  preview.innerHTML = "";
  preview.appendChild(canvas);
  setDownload(download, await blob.arrayBuffer(), `toolzeasy-${tool.id}.${extensionFor(format)}`, format);
  setResult(result, `Processed image. Output size: ${formatBytes(blob.size)}.`);
}

function drawBaseImage(img, root) {
  const widthField = Number(root.querySelector("#imgWidth")?.value || 0);
  const heightField = Number(root.querySelector("#imgHeight")?.value || 0);
  const width = widthField || (heightField ? Math.round((img.width / img.height) * heightField) : img.width);
  const height = heightField || Math.round((img.height / img.width) * width);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, ctx };
}

function bindAreaSelection(root) {
  root.querySelector("#imageInput")?.addEventListener("change", async () => {
    const file = root.querySelector("#imageInput")?.files[0];
    if (!file) return;
    const img = await loadImage(file);
    root._blurSourceImg = img;
    root._blurShapes = [];
    setupShapeCanvas(root, img);
  });
  root.querySelector("[data-clear-shapes]")?.addEventListener("click", () => {
    root._blurShapes = [];
    // Reset preview back to original image
    if (root._blurSourceImg) {
      const base = root._blurBaseCanvas;
      if (base) {
        const ctx = base.getContext("2d");
        ctx.clearRect(0, 0, base.width, base.height);
        ctx.drawImage(root._blurSourceImg, 0, 0);
      }
      // Clear overlay too
      const overlay = root._blurOverlay;
      if (overlay) overlay.getContext("2d").clearRect(0, 0, overlay.width, overlay.height);
    }
  });
}

// ── Shape-draw blur/pixelate system ──────────────────────────────────────────

function setupShapeCanvas(root, img) {
  const preview = root.querySelector("#imagePreview");
  if (!preview) return;

  // Base canvas — this is what the user sees (shows image + applied blur live)
  const base = document.createElement("canvas");
  base.width = img.width;
  base.height = img.height;
  base.style.maxWidth = "100%";
  base.style.display = "block";
  const bctx = base.getContext("2d");
  bctx.drawImage(img, 0, 0);

  // Overlay canvas — thin transparent canvas just for drawing the dashed shape outline while dragging
  const overlay = document.createElement("canvas");
  overlay.width = img.width;
  overlay.height = img.height;
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.cursor = "crosshair";
  overlay.style.touchAction = "none";
  overlay.style.pointerEvents = "auto";

  const wrap = document.createElement("div");
  wrap.style.cssText = "position:relative;display:inline-block;max-width:100%;width:100%;";
  wrap.appendChild(base);
  wrap.appendChild(overlay);

  preview.innerHTML = "";
  preview.appendChild(wrap);

  root._blurBaseCanvas = base;
  root._blurOverlay = overlay;
  if (!root._blurShapes) root._blurShapes = [];

  let dragging = false;
  let startX = 0, startY = 0;

  function toCanvas(e) {
    const rect = overlay.getBoundingClientRect();
    const cx = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left;
    const cy = (e.touches?.[0]?.clientY ?? e.clientY) - rect.top;
    return {
      x: Math.max(0, Math.min(overlay.width,  (cx / rect.width)  * overlay.width)),
      y: Math.max(0, Math.min(overlay.height, (cy / rect.height) * overlay.height))
    };
  }

  function onDown(e) {
    e.preventDefault();
    dragging = true;
    const p = toCanvas(e);
    startX = p.x;
    startY = p.y;
  }

  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const p = toCanvas(e);
    const shape = {
      x: Math.min(startX, p.x),
      y: Math.min(startY, p.y),
      w: Math.abs(p.x - startX),
      h: Math.abs(p.y - startY)
    };
    // Draw dashed outline on overlay only while dragging
    const oc = overlay.getContext("2d");
    oc.clearRect(0, 0, overlay.width, overlay.height);
    const shapeMode = root.querySelector("#shapeMode")?.value || "rect";
    oc.save();
    oc.strokeStyle = "rgba(255,50,50,0.95)";
    oc.fillStyle = "rgba(255,50,50,0.08)";
    oc.lineWidth = Math.max(2, overlay.width / 300);
    oc.setLineDash([8, 4]);
    buildShapePath(oc, shapeMode, shape.x, shape.y, shape.w, shape.h);
    oc.fill();
    oc.stroke();
    oc.restore();
  }

  function onUp(e) {
    if (!dragging) return;
    dragging = false;

    // Clear the dashed outline
    overlay.getContext("2d").clearRect(0, 0, overlay.width, overlay.height);

    const p = toCanvas(e || {});
    const shape = {
      x: Math.round(Math.min(startX, p.x ?? startX)),
      y: Math.round(Math.min(startY, p.y ?? startY)),
      w: Math.round(Math.abs((p.x ?? startX) - startX)),
      h: Math.round(Math.abs((p.y ?? startY) - startY))
    };

    if (shape.w < 6 || shape.h < 6) return;

    root._blurShapes.push(shape);

    // *** LIVE PREVIEW: apply blur/pixelate immediately on base canvas ***
    applyAreaEffect(bctx, base, root, [shape]);
  }

  overlay.addEventListener("mousedown", onDown);
  overlay.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  overlay.addEventListener("touchstart", onDown, { passive: false });
  overlay.addEventListener("touchmove", onMove, { passive: false });
  overlay.addEventListener("touchend", onUp, { passive: false });
}

function applyAreaEffect(ctx, canvas, root, shapesOverride) {
  const shapes = shapesOverride || root._blurShapes || [];
  if (shapes.length === 0) return;
  const mode = root.querySelector("#areaMode")?.value || "blur";
  const shapeMode = root.querySelector("#shapeMode")?.value || "rect";
  const strength = Number(root.querySelector("#blurStrength")?.value || 16);

  shapes.forEach(shape => {
    const x = Math.round(shape.x);
    const y = Math.round(shape.y);
    const w = Math.round(shape.w);
    const h = Math.round(shape.h);
    if (w < 2 || h < 2) return;

    if (mode === "pixelate") {
      // Step 1: copy region to tiny canvas
      const blockSize = Math.max(2, Math.round(strength * 0.7));
      const smallW = Math.max(1, Math.floor(w / blockSize));
      const smallH = Math.max(1, Math.floor(h / blockSize));
      const small = document.createElement("canvas");
      small.width = smallW;
      small.height = smallH;
      const sc = small.getContext("2d");
      sc.imageSmoothingEnabled = false;
      sc.drawImage(canvas, x, y, w, h, 0, 0, smallW, smallH);

      // Step 2: paste back enlarged with clipping
      ctx.save();
      buildShapePath(ctx, shapeMode, x, y, w, h);
      ctx.clip();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small, 0, 0, smallW, smallH, x, y, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.restore();

    } else {
      // Blur: extract region → blur on offscreen canvas → paste back clipped
      // Extract with padding to avoid edge artifacts
      const pad = strength * 2;
      const ex = Math.max(0, x - pad);
      const ey = Math.max(0, y - pad);
      const ew = Math.min(canvas.width - ex, w + pad * 2);
      const eh = Math.min(canvas.height - ey, h + pad * 2);

      const offscreen = document.createElement("canvas");
      offscreen.width = ew;
      offscreen.height = eh;
      const oc = offscreen.getContext("2d");

      // Draw the padded region
      oc.drawImage(canvas, ex, ey, ew, eh, 0, 0, ew, eh);

      // Apply blur filter
      const blurred = document.createElement("canvas");
      blurred.width = ew;
      blurred.height = eh;
      const bc = blurred.getContext("2d");
      bc.filter = `blur(${strength}px)`;
      bc.drawImage(offscreen, 0, 0);
      bc.filter = "none";

      // Paste blurred region back, clipped to shape
      ctx.save();
      // Translate so shape coordinates work relative to canvas
      buildShapePath(ctx, shapeMode, x, y, w, h);
      ctx.clip();
      // Draw blurred region back at its original canvas position
      ctx.drawImage(blurred, ex, ey, ew, eh, ex, ey, ew, eh);
      ctx.restore();
    }
  });
}

function buildShapePath(ctx, shapeMode, x, y, w, h) {
  ctx.beginPath();
  if (shapeMode === "ellipse") {
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else {
    ctx.rect(x, y, w, h);
  }
}

function applyRoundCorners(ctx, canvas, radius) {
  const source = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  roundedRect(ctx, 0, 0, canvas.width, canvas.height, radius);
  ctx.clip();
  const temp = document.createElement("canvas");
  temp.width = canvas.width;
  temp.height = canvas.height;
  temp.getContext("2d").putImageData(source, 0, 0);
  ctx.drawImage(temp, 0, 0);
  ctx.restore();
}

function applyWatermark(ctx, canvas, opts) {
  const { text = "", logo = null, x = 0.5, y = 0.88, sizePercent = 26, opacity = 0.8 } = opts || {};
  const cx = x * canvas.width;
  const cy = y * canvas.height;
  ctx.save();
  ctx.globalAlpha = opacity;
  let logoHeight = 0;
  if (logo) {
    const logoWidth = canvas.width * (sizePercent / 100);
    logoHeight = logoWidth * (logo.naturalHeight / logo.naturalWidth || 1);
    ctx.drawImage(logo, cx - logoWidth / 2, cy - logoHeight / 2 - (text ? logoHeight * 0.18 : 0), logoWidth, logoHeight);
  }
  if (text) {
    const fontSize = Math.max(14, Math.round(canvas.width * (sizePercent / 100) * 0.22));
    ctx.font = `bold ${fontSize}px Inter, Arial`;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = Math.max(2, fontSize / 10);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const ty = logo ? cy + logoHeight / 2 + fontSize * 0.5 : cy;
    ctx.strokeText(text, cx, ty);
    ctx.fillText(text, cx, ty);
  }
  ctx.restore();

  // Draggable position marker so it's clear where to grab and move the watermark
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(7, canvas.width * 0.007), 0, Math.PI * 2);
  ctx.fillStyle = "rgba(20,99,255,0.9)";
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function bindCropTool(root) {
  root.querySelector("#imageInput")?.addEventListener("change", async () => {
    const file = root.querySelector("#imageInput")?.files[0];
    if (!file) return;
    const img = await loadImage(file);
    root._cropSourceImg = img;
    setupCropCanvas(root, img);
  });
}

function setupCropCanvas(root, img) {
  const preview = root.querySelector("#imagePreview");
  if (!preview) return;
  if (root._cropCleanup) root._cropCleanup();

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext("2d").drawImage(img, 0, 0);

  const wrap = document.createElement("div");
  wrap.style.cssText = "position:relative;display:inline-block;max-width:100%;width:100%;user-select:none;";
  wrap.appendChild(canvas);

  const box = document.createElement("div");
  box.className = "crop-box";
  const dims = document.createElement("span");
  dims.className = "crop-dims";
  box.appendChild(dims);
  ["nw", "ne", "sw", "se"].forEach((pos) => {
    const handle = document.createElement("div");
    handle.className = `crop-handle crop-handle-${pos}`;
    handle.dataset.pos = pos;
    box.appendChild(handle);
  });
  wrap.appendChild(box);

  preview.innerHTML = "";
  preview.appendChild(wrap);

  root._cropBox = { x: 0.15, y: 0.15, w: 0.7, h: 0.7 };

  const paint = () => {
    const b = root._cropBox;
    box.style.left = `${b.x * 100}%`;
    box.style.top = `${b.y * 100}%`;
    box.style.width = `${b.w * 100}%`;
    box.style.height = `${b.h * 100}%`;
    dims.textContent = `${Math.round(b.w * img.naturalWidth)} × ${Math.round(b.h * img.naturalHeight)}px`;
  };
  paint();

  const MIN = 0.04;
  let mode = null;
  let startPointer = { x: 0, y: 0 };
  let startBox = null;

  function pointerFrac(e) {
    const rect = wrap.getBoundingClientRect();
    const px = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left;
    const py = (e.touches?.[0]?.clientY ?? e.clientY) - rect.top;
    return { x: px / rect.width, y: py / rect.height };
  }

  function onDown(e, m) {
    e.preventDefault();
    e.stopPropagation();
    mode = m;
    startPointer = pointerFrac(e);
    startBox = { ...root._cropBox };
  }

  function onMove(e) {
    if (!mode) return;
    e.preventDefault();
    const p = pointerFrac(e);
    const dx = p.x - startPointer.x;
    const dy = p.y - startPointer.y;
    const b = { ...startBox };
    if (mode === "move") {
      b.x = clamp(startBox.x + dx, 0, 1 - startBox.w);
      b.y = clamp(startBox.y + dy, 0, 1 - startBox.h);
    } else {
      if (mode.includes("w")) {
        const nx = clamp(startBox.x + dx, 0, startBox.x + startBox.w - MIN);
        b.w = startBox.x + startBox.w - nx;
        b.x = nx;
      }
      if (mode.includes("e")) {
        b.w = clamp(startBox.w + dx, MIN, 1 - startBox.x);
      }
      if (mode.includes("n")) {
        const ny = clamp(startBox.y + dy, 0, startBox.y + startBox.h - MIN);
        b.h = startBox.y + startBox.h - ny;
        b.y = ny;
      }
      if (mode.includes("s")) {
        b.h = clamp(startBox.h + dy, MIN, 1 - startBox.y);
      }
    }
    root._cropBox = b;
    paint();
  }

  function onUp() { mode = null; }

  box.addEventListener("mousedown", (e) => { if (e.target === box) onDown(e, "move"); });
  box.addEventListener("touchstart", (e) => { if (e.target === box) onDown(e, "move"); }, { passive: false });
  box.querySelectorAll(".crop-handle").forEach((handle) => {
    handle.addEventListener("mousedown", (e) => onDown(e, handle.dataset.pos));
    handle.addEventListener("touchstart", (e) => onDown(e, handle.dataset.pos), { passive: false });
  });
  window.addEventListener("mousemove", onMove);
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("mouseup", onUp);
  window.addEventListener("touchend", onUp);

  root._cropCleanup = () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("mouseup", onUp);
    window.removeEventListener("touchend", onUp);
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function bindWatermarkTool(root) {
  root.querySelector("#imageInput")?.addEventListener("change", async () => {
    const file = root.querySelector("#imageInput")?.files[0];
    if (!file) return;
    const img = await loadImage(file);
    root._watermarkSourceImg = img;
    root._watermarkPos = { x: 0.5, y: 0.88 };
    setupWatermarkCanvas(root, img);
  });
  root.querySelector("#watermarkLogo")?.addEventListener("change", async () => {
    const file = root.querySelector("#watermarkLogo")?.files[0];
    root._watermarkLogoImg = file ? await loadImage(file) : null;
    redrawWatermark(root);
  });
  ["watermarkText", "watermarkSize", "watermarkOpacity"].forEach((id) => {
    root.querySelector(`#${id}`)?.addEventListener("input", () => redrawWatermark(root));
  });
}

function setupWatermarkCanvas(root, img) {
  const preview = root.querySelector("#imagePreview");
  if (!preview) return;
  if (root._watermarkCleanup) root._watermarkCleanup();

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.style.cursor = "grab";
  canvas.style.touchAction = "none";

  const wrap = document.createElement("div");
  wrap.style.cssText = "position:relative;display:inline-block;max-width:100%;width:100%;";
  wrap.appendChild(canvas);
  preview.innerHTML = "";
  preview.appendChild(wrap);

  root._watermarkCanvas = canvas;
  redrawWatermark(root);

  let dragging = false;
  function toFrac(e) {
    const rect = canvas.getBoundingClientRect();
    const px = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left;
    const py = (e.touches?.[0]?.clientY ?? e.clientY) - rect.top;
    return { x: clamp(px / rect.width, 0, 1), y: clamp(py / rect.height, 0, 1) };
  }
  function onDown(e) {
    e.preventDefault();
    dragging = true;
    canvas.style.cursor = "grabbing";
    root._watermarkPos = toFrac(e);
    redrawWatermark(root);
  }
  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    root._watermarkPos = toFrac(e);
    redrawWatermark(root);
  }
  function onUp() { dragging = false; canvas.style.cursor = "grab"; }

  canvas.addEventListener("mousedown", onDown);
  canvas.addEventListener("touchstart", onDown, { passive: false });
  window.addEventListener("mousemove", onMove);
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("mouseup", onUp);
  window.addEventListener("touchend", onUp);

  root._watermarkCleanup = () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("mouseup", onUp);
    window.removeEventListener("touchend", onUp);
  };
}

function redrawWatermark(root) {
  const canvas = root._watermarkCanvas;
  const img = root._watermarkSourceImg;
  if (!canvas || !img) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  const text = root.querySelector("#watermarkText")?.value || "";
  const logo = root._watermarkLogoImg || null;
  const pos = root._watermarkPos || { x: 0.5, y: 0.88 };
  const sizePercent = Number(root.querySelector("#watermarkSize")?.value || 26);
  const opacity = Number(root.querySelector("#watermarkOpacity")?.value || 0.8);
  applyWatermark(ctx, canvas, { text, logo, x: pos.x, y: pos.y, sizePercent, opacity });
}

function applyGrayscale(ctx, canvas) {
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < image.data.length; i += 4) {
    const gray = image.data[i] * 0.299 + image.data[i + 1] * 0.587 + image.data[i + 2] * 0.114;
    image.data[i] = gray;
    image.data[i + 1] = gray;
    image.data[i + 2] = gray;
  }
  ctx.putImageData(image, 0, 0);
}

async function protectImageZip(file, root, result, download) {
  const password = root.querySelector("#imagePassword")?.value || "";
  if (!password) return setResult(result, "Enter a password first.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const zipBytes = await buildPasswordZip([{ name: file.name, bytes }], password);
  setDownload(download, zipBytes, "toolzeasy-protected-image.zip", "application/zip");
  setResult(result, "Created a password-protected ZIP. Your ZIP or file app will ask for this password when extracting.");
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function runTextTool(tool, root, result) {
  const text = root.querySelector("#textInput")?.value || "";
  let output = "";
  const words = text.trim().match(/\b[\w'-]+\b/g) || [];
  if (tool.name === "Word Counter") {
    result.innerHTML = stats([["Words", words.length], ["Characters", text.length], ["Sentences", (text.match(/[.!?]+/g) || []).length], ["Reading min", Math.max(1, Math.ceil(words.length / 220))]]);
    return;
  }
  if (tool.name === "Character Counter") {
    result.innerHTML = stats([["Characters", text.length], ["No spaces", text.replace(/\s/g, "").length], ["Lines", text ? text.split(/\r\n|\r|\n/).length : 0], ["Bytes", new Blob([text]).size]]);
    return;
  }
  if (tool.name === "Case Converter") output = convertCase(text, root.querySelector("#caseMode")?.value || "upper");
  if (tool.name === "Remove Line Spaces") output = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).join("\n");
  if (tool.name === "Text to Word") output = text;
  if (tool.name === "Slug Generator") output = slugify(text);
  if (tool.name === "Duplicate Line Remover") output = [...new Set(text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))].join("\n");
  if (tool.name === "Line Sorter") output = text.split(/\r?\n/).filter(Boolean).sort((a, b) => a.localeCompare(b)).join("\n");
  result.textContent = output;
  const download = root.querySelector("#textDownload");
  if (tool.name === "Text to Word") setDownload(download, new TextEncoder().encode(`<html><body><pre>${escapeHtml(output)}</pre></body></html>`), "toolzeasy-text.doc", "application/msword");
  else setTextDownload(download, output, `${tool.id}.txt`);
}

function stats(items) {
  return `<div class="stat-grid">${items.map(([label, value]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join("")}</div>`;
}

function convertCase(text, mode) {
  if (mode === "upper") return text.toUpperCase();
  if (mode === "lower") return text.toLowerCase();
  if (mode === "title") return text.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (letter) => letter.toUpperCase());
}

function bindUtility(root, result) {
  root.querySelector("[data-qr]")?.addEventListener("click", () => {
    const out = root.querySelector("#qrOut");
    const download = root.querySelector("#qrDownload");
    out.innerHTML = "";
    hideLink(download);
    if (!window.QRCode) return setResult(out, "QR library is loading. Try again.");
    new QRCode(out, { text: root.querySelector("#qrText")?.value || "https://toolzeasy.com", width: 220, height: 220 });
    requestAnimationFrame(() => {
      const canvas = out.querySelector("canvas");
      const image = out.querySelector("img");
      download.href = canvas ? canvas.toDataURL("image/png") : image?.src || "";
      download.hidden = !download.href;
    });
  });
  root.querySelector("[data-color]")?.addEventListener("click", () => {
    const hex = root.querySelector("#colorInput").value;
    const rgb = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
    result.innerHTML = `<strong>${hex.toUpperCase()}</strong><br>RGB: ${rgb.join(", ")}<br>HSL: ${rgbToHsl(...rgb)}`;
  });
  root.querySelector("[data-password]")?.addEventListener("click", async () => {
    const length = Number(root.querySelector("#passLength").value);
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789" + (root.querySelector("#passSymbols").checked ? "!@#$%&*?" : "");
    const pass = Array.from(crypto.getRandomValues(new Uint32Array(length)), (n) => chars[n % chars.length]).join("");
    result.textContent = pass;
    const zip = await makeZip({ "password.txt": new TextEncoder().encode(pass) });
    setDownload(root.querySelector("#passZip"), await zip.arrayBuffer(), "toolzeasy-password.zip", "application/zip");
  });
  root.querySelector("[data-unit]")?.addEventListener("click", () => {
    const value = Number(root.querySelector("#unitValue").value);
    const type = root.querySelector("#unitType").value;
    const map = {
      "km-mi": [value * 0.621371, "miles"], "mi-km": [value * 1.60934, "kilometers"],
      "kg-lb": [value * 2.20462, "pounds"], "lb-kg": [value / 2.20462, "kilograms"],
      "c-f": [(value * 9) / 5 + 32, "Fahrenheit"], "f-c": [((value - 32) * 5) / 9, "Celsius"]
    };
    const [out, unit] = map[type];
    result.textContent = `${Number(out.toFixed(4))} ${unit}`;
  });
  root.querySelector("[data-invoice]")?.addEventListener("click", () => generateInvoice(root, result));
  root.querySelector("[data-bmi]")?.addEventListener("click", () => {
    const h = Number(root.querySelector("#heightCm").value) / 100;
    const w = Number(root.querySelector("#weightKg").value);
    if (!h || !w) return setResult(result, "Enter height and weight.");
    const bmi = w / (h * h);
    result.innerHTML = `<strong>BMI: ${bmi.toFixed(1)}</strong><br>${bmiCategory(bmi)}<br><span class="helper-text">${bmiMessage(bmi)}</span>`;
  });
  root.querySelector("[data-age]")?.addEventListener("click", () => {
    const age = calculateAge(new Date(root.querySelector("#birthDate").value));
    result.textContent = age ? `${age.years} years, ${age.months} months, ${age.days} days old` : "Choose a valid past date.";
  });
  root.querySelector("[data-tip]")?.addEventListener("click", () => {
    const bill = Number(root.querySelector("#billAmount").value);
    const tip = Number(root.querySelector("#tipPercent").value);
    const people = Math.max(1, Number(root.querySelector("#peopleCount").value || 1));
    const total = bill * (1 + tip / 100);
    result.textContent = `Total: $${total.toFixed(2)} | Per person: $${(total / people).toFixed(2)}`;
  });
  root.querySelector("[data-url-encode]")?.addEventListener("click", () => result.textContent = encodeURIComponent(root.querySelector("#urlText").value));
  root.querySelector("[data-url-decode]")?.addEventListener("click", () => safeDecode(() => decodeURIComponent(root.querySelector("#urlText").value), result, "Invalid encoded URL text."));
  root.querySelector("[data-base-encode]")?.addEventListener("click", () => result.textContent = btoa(unescape(encodeURIComponent(root.querySelector("#baseText").value))));
  root.querySelector("[data-base-decode]")?.addEventListener("click", () => safeDecode(() => decodeURIComponent(escape(atob(root.querySelector("#baseText").value))), result, "Invalid Base64 text."));
  root.querySelector("[data-random]")?.addEventListener("click", () => {
    const min = Number(root.querySelector("#randMin").value);
    const max = Number(root.querySelector("#randMax").value);
    result.textContent = String(Math.floor(Math.random() * (max - min + 1)) + min);
  });
  root.querySelector("[data-uuid]")?.addEventListener("click", () => {
    const count = Math.min(50, Math.max(1, Number(root.querySelector("#uuidCount").value)));
    const uuids = Array.from({ length: count }, () => crypto.randomUUID()).join("\n");
    result.textContent = uuids;
    setTextDownload(root.querySelector("#uuidDownload"), uuids, "uuids.txt");
  });
  root.querySelector("[data-stopwatch-start]")?.addEventListener("click", () => startStopwatch(root));
  root.querySelector("[data-stopwatch-stop]")?.addEventListener("click", stopStopwatch);
  root.querySelector("[data-stopwatch-reset]")?.addEventListener("click", () => resetStopwatch(root));
  root.querySelector("[data-countdown-start]")?.addEventListener("click", () => startCountdown(root));
  root.querySelector("[data-countdown-stop]")?.addEventListener("click", stopCountdown);
}

function bindInvoiceTool(root, result) {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const dateInput = root.querySelector("#invoiceDate");
  const dueInput = root.querySelector("#invoiceDue");
  if (dateInput && !dateInput.value) dateInput.value = today;
  if (dueInput && !dueInput.value) dueInput.value = due;
  root.querySelector("[data-invoice-add]")?.addEventListener("click", () => {
    root.querySelector("#invoiceItems")?.appendChild(createInvoiceItemRow());
  });
  root.querySelector("#invoiceItems")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-invoice-item]");
    if (!button) return;
    const rows = root.querySelectorAll(".invoice-row");
    if (rows.length === 1) {
      const row = rows[0];
      row.querySelector(".invoice-item-name").value = "";
      row.querySelector(".invoice-item-qty").value = "1";
      row.querySelector(".invoice-item-rate").value = "";
      return;
    }
    button.closest(".invoice-row")?.remove();
    updateInvoicePreview(root, result);
  });
  root.querySelectorAll("input, textarea, select").forEach((control) => {
    control.addEventListener("input", () => updateInvoicePreview(root, result));
  });
}

function createInvoiceItemRow() {
  const row = document.createElement("div");
  row.className = "invoice-row";
  row.innerHTML = `
    <input class="control invoice-item-name" placeholder="Item or service">
    <input class="control invoice-item-qty" type="number" min="0" step="0.01" value="1" aria-label="Quantity">
    <input class="control invoice-item-rate" type="number" min="0" step="0.01" placeholder="Price" aria-label="Price">
    <button class="icon-mini" type="button" data-remove-invoice-item aria-label="Remove item">x</button>
  `;
  return row;
}

function generateInvoice(root, result) {
  const data = collectInvoiceData(root);
  if (!data.items.length) {
    setResult(result, "Add at least one item with a price.");
    return;
  }
  const html = createInvoiceHtml(data);
  result.innerHTML = createInvoicePreview(data);
  setDownload(root.querySelector("#invoiceDownload"), new TextEncoder().encode(html), `toolzeasy-${slugify(data.number || "invoice")}.html`, "text/html");
}

function updateInvoicePreview(root, result) {
  const data = collectInvoiceData(root);
  if (!data.items.length) return;
  result.innerHTML = createInvoicePreview(data);
}

function collectInvoiceData(root) {
  const currency = root.querySelector("#invoiceCurrency")?.value || "$";
  const items = [...root.querySelectorAll(".invoice-row")].map((row) => {
    const name = row.querySelector(".invoice-item-name")?.value.trim() || "";
    const qty = Number(row.querySelector(".invoice-item-qty")?.value || 0);
    const rate = Number(row.querySelector(".invoice-item-rate")?.value || 0);
    return { name, qty, rate, amount: qty * rate };
  }).filter((item) => item.name || item.amount > 0);
  if (!items.length) items.push({ name: "Service", qty: 1, rate: 0, amount: 0 });
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discount = Math.max(0, Number(root.querySelector("#invoiceDiscount")?.value || 0));
  const taxable = Math.max(0, subtotal - discount);
  const taxRate = Math.max(0, Number(root.querySelector("#invoiceTax")?.value || 0));
  const tax = taxable * (taxRate / 100);
  const total = taxable + tax;
  return {
    from: root.querySelector("#invoiceFrom")?.value.trim() || "Your business",
    client: root.querySelector("#invoiceClient")?.value.trim() || "Client",
    number: root.querySelector("#invoiceNumber")?.value.trim() || "INV-001",
    date: root.querySelector("#invoiceDate")?.value || "",
    due: root.querySelector("#invoiceDue")?.value || "",
    notes: root.querySelector("#invoiceNotes")?.value.trim() || "Thank you for your business.",
    currency,
    items,
    subtotal,
    discount,
    taxRate,
    tax,
    total
  };
}

function money(value, currency) {
  return `${currency}${Number(value || 0).toFixed(2)}`;
}

function startStopwatch(root) {
  if (stopwatchTimer) return;
  stopwatchStart = Date.now() - stopwatchElapsed;
  stopwatchTimer = setInterval(() => {
    stopwatchElapsed = Date.now() - stopwatchStart;
    const el = root.querySelector("#stopwatchTime");
    if (el) el.textContent = formatDuration(stopwatchElapsed);
  }, 100);
}

function stopStopwatch() {
  clearInterval(stopwatchTimer);
  stopwatchTimer = null;
}

function resetStopwatch(root) {
  stopStopwatch();
  stopwatchElapsed = 0;
  const el = root.querySelector("#stopwatchTime");
  if (el) el.textContent = "00:00.0";
}

function startCountdown(root) {
  stopCountdown();
  let remaining = Math.max(1, Number(root.querySelector("#countSeconds").value || 60));
  const el = root.querySelector("#countdownTime");
  if (el) el.textContent = `${remaining}s`;
  countdownTimer = setInterval(() => {
    remaining -= 1;
    if (el) el.textContent = remaining > 0 ? `${remaining}s` : "Done";
    if (remaining <= 0) stopCountdown();
  }, 1000);
}

function stopCountdown() {
  clearInterval(countdownTimer);
  countdownTimer = null;
}

function safeDecode(fn, result, message) {
  try {
    result.textContent = fn();
  } catch {
    result.textContent = message;
  }
}

function setResult(element, text) {
  if (element) element.textContent = text;
}

function hideLink(link) {
  if (link) link.hidden = true;
}

function setTextDownload(link, text, filename) {
  setDownload(link, new TextEncoder().encode(text), filename, "text/plain");
}

function setDownload(link, bytes, filename, type) {
  if (!link) return;
  const blob = bytes instanceof Blob ? bytes : new Blob([bytes], { type });
  if (link.href) URL.revokeObjectURL(link.href);
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.hidden = false;
}

// ── Real password-protected ZIP (ZipCrypto), openable by Windows/macOS/7-Zip/WinRAR ──
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function zipCryptoKeystream(password) {
  let key0 = 0x12345678, key1 = 0x23456789, key2 = 0x34567890;
  const step = (crc, byte) => (CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)) >>> 0;
  const update = (byteVal) => {
    key0 = step(key0, byteVal);
    key1 = (key1 + (key0 & 0xff)) >>> 0;
    key1 = (Math.imul(key1, 134775813) + 1) >>> 0;
    key2 = step(key2, key1 >>> 24);
  };
  for (let i = 0; i < password.length; i++) update(password.charCodeAt(i) & 0xff);
  return {
    encryptByte(b) {
      const temp = (key2 | 2) & 0xffff;
      const k = (Math.imul(temp, temp ^ 1) >>> 8) & 0xff;
      update(b);
      return (b ^ k) & 0xff;
    }
  };
}

function encryptEntryZipCrypto(bytes, password, crc) {
  const keys = zipCryptoKeystream(password);
  const header = crypto.getRandomValues(new Uint8Array(12));
  header[11] = (crc >>> 24) & 0xff;
  const out = new Uint8Array(12 + bytes.length);
  for (let i = 0; i < 12; i++) out[i] = keys.encryptByte(header[i]);
  for (let i = 0; i < bytes.length; i++) out[12 + i] = keys.encryptByte(bytes[i]);
  return out;
}

function dosDateTime(date = new Date()) {
  const time = ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | ((date.getSeconds() >> 1) & 0x1f);
  const day = (((date.getFullYear() - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0xf) << 5) | (date.getDate() & 0x1f);
  return { time, day };
}

async function buildPasswordZip(entries, password) {
  const { time, day } = dosDateTime();
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const crc = crc32(entry.bytes);
    const encrypted = encryptEntryZipCrypto(entry.bytes, password, crc);
    const compressedSize = encrypted.length;
    const uncompressedSize = entry.bytes.length;

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0001, true);
    local.setUint16(8, 0, true);
    local.setUint16(10, time, true);
    local.setUint16(12, day, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, compressedSize, true);
    local.setUint32(22, uncompressedSize, true);
    local.setUint16(26, nameBytes.length, true);
    local.setUint16(28, 0, true);
    const localHeaderBytes = new Uint8Array(local.buffer);
    localParts.push(localHeaderBytes, nameBytes, encrypted);

    const central = new DataView(new ArrayBuffer(46));
    central.setUint32(0, 0x02014b50, true);
    central.setUint16(4, 20, true);
    central.setUint16(6, 20, true);
    central.setUint16(8, 0x0001, true);
    central.setUint16(10, 0, true);
    central.setUint16(12, time, true);
    central.setUint16(14, day, true);
    central.setUint32(16, crc, true);
    central.setUint32(20, compressedSize, true);
    central.setUint32(24, uncompressedSize, true);
    central.setUint16(28, nameBytes.length, true);
    central.setUint16(30, 0, true);
    central.setUint16(32, 0, true);
    central.setUint16(34, 0, true);
    central.setUint16(36, 0, true);
    central.setUint32(38, 0, true);
    central.setUint32(42, offset, true);
    centralParts.push(new Uint8Array(central.buffer), nameBytes);

    offset += localHeaderBytes.length + nameBytes.length + encrypted.length;
  }

  const centralStart = offset;
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);

  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true);
  eocd.setUint16(4, 0, true);
  eocd.setUint16(6, 0, true);
  eocd.setUint16(8, entries.length, true);
  eocd.setUint16(10, entries.length, true);
  eocd.setUint32(12, centralSize, true);
  eocd.setUint32(16, centralStart, true);
  eocd.setUint16(20, 0, true);

  const allParts = [...localParts, ...centralParts, new Uint8Array(eocd.buffer)];
  const total = allParts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const part of allParts) { out.set(part, pos); pos += part.length; }
  return out;
}

async function makeZip(files) {
  if (!window.JSZip) throw new Error("ZIP library is still loading. Check internet connection and try again.");
  const zip = new JSZip();
  Object.entries(files).forEach(([name, data]) => zip.file(name, data));
  return zip.generateAsync({ type: "blob" });
}

function parsePages(value, total) {
  if (!value.trim()) return Array.from({ length: total }, (_, index) => index);
  const pages = new Set();
  value.split(",").forEach((part) => {
    const [start, end] = part.split("-").map((item) => Number(item.trim()));
    if (Number.isFinite(start) && Number.isFinite(end)) {
      for (let page = start; page <= end; page++) if (page >= 1 && page <= total) pages.add(page - 1);
    } else if (Number.isFinite(start) && start >= 1 && start <= total) {
      pages.add(start - 1);
    }
  });
  if (!pages.size) throw new Error("Enter valid page numbers.");
  return [...pages].sort((a, b) => a - b);
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function extensionFor(format) {
  if (format.includes("png")) return "png";
  if (format.includes("webp")) return "webp";
  return "jpg";
}

function wrapText(text, width) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > width) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function slugify(text) {
  return text.toLowerCase().trim().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDuration(ms) {
  const total = Math.floor(ms / 100);
  const tenths = total % 10;
  const seconds = Math.floor(total / 10) % 60;
  const minutes = Math.floor(total / 600);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

function calculateAge(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime()) || date > new Date()) return null;
  const today = new Date();
  let years = today.getFullYear() - date.getFullYear();
  let months = today.getMonth() - date.getMonth();
  let days = today.getDate() - date.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function createInvoicePreview(data) {
  return `<article class="invoice-preview-doc">
    <header>
      <div><p class="eyebrow">Invoice</p><h2>${escapeHtml(data.number)}</h2></div>
      <strong>${escapeHtml(data.from)}</strong>
    </header>
    <div class="invoice-meta">
      <div><span>Bill to</span><strong>${escapeHtml(data.client)}</strong></div>
      <div><span>Date</span><strong>${escapeHtml(data.date || "-")}</strong></div>
      <div><span>Due</span><strong>${escapeHtml(data.due || "-")}</strong></div>
    </div>
    <table>
      <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
      <tbody>${data.items.map((item) => `<tr><td>${escapeHtml(item.name || "Service")}</td><td>${item.qty}</td><td>${money(item.rate, data.currency)}</td><td>${money(item.amount, data.currency)}</td></tr>`).join("")}</tbody>
    </table>
    <div class="invoice-totals">
      <span>Subtotal <strong>${money(data.subtotal, data.currency)}</strong></span>
      <span>Discount <strong>${money(data.discount, data.currency)}</strong></span>
      <span>Tax (${data.taxRate}%) <strong>${money(data.tax, data.currency)}</strong></span>
      <span class="invoice-total">Total <strong>${money(data.total, data.currency)}</strong></span>
    </div>
    <p class="invoice-notes">${escapeHtml(data.notes)}</p>
  </article>`;
}

function createInvoiceHtml(data) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Invoice ${escapeHtml(data.number)}</title>
  <style>
    body{margin:0;background:#f4f7fb;color:#102033;font-family:Arial,sans-serif}
    main{max-width:820px;margin:32px auto;padding:36px;background:#fff;border:1px solid #d8e2f0}
    header{display:flex;justify-content:space-between;gap:24px;margin-bottom:28px}
    h1{margin:0;color:#1463ff;font-size:42px}.muted{color:#64748b}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0}.box{border:1px solid #d8e2f0;padding:16px}.box span{display:block;color:#64748b;font-size:12px;text-transform:uppercase;font-weight:700;margin-bottom:6px}
    table{width:100%;border-collapse:collapse;margin-top:18px}th,td{border-bottom:1px solid #d8e2f0;padding:12px;text-align:left}th{font-size:12px;text-transform:uppercase;color:#64748b}td:nth-child(n+2),th:nth-child(n+2){text-align:right}
    .totals{margin:20px 0 0 auto;max-width:320px}.totals div{display:flex;justify-content:space-between;padding:8px 0}.total{border-top:2px solid #102033;font-size:22px;font-weight:700}.notes{margin-top:28px;color:#40536d;line-height:1.6}
    @media print{body{background:#fff}main{border:0;margin:0;max-width:none}.no-print{display:none}}
  </style>
</head>
<body>
  <main>
    <button class="no-print" onclick="window.print()" style="float:right;padding:10px 14px;border:1px solid #d8e2f0;background:#fff;border-radius:8px;cursor:pointer">Print / Save PDF</button>
    <header><div><p class="muted">Invoice</p><h1>${escapeHtml(data.number)}</h1></div><strong>${escapeHtml(data.from)}</strong></header>
    <section class="meta"><div class="box"><span>Bill to</span><strong>${escapeHtml(data.client)}</strong></div><div class="box"><span>Date</span><strong>${escapeHtml(data.date || "-")}</strong></div><div class="box"><span>Due</span><strong>${escapeHtml(data.due || "-")}</strong></div></section>
    <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${data.items.map((item) => `<tr><td>${escapeHtml(item.name || "Service")}</td><td>${item.qty}</td><td>${money(item.rate, data.currency)}</td><td>${money(item.amount, data.currency)}</td></tr>`).join("")}</tbody></table>
    <section class="totals"><div><span>Subtotal</span><strong>${money(data.subtotal, data.currency)}</strong></div><div><span>Discount</span><strong>${money(data.discount, data.currency)}</strong></div><div><span>Tax (${data.taxRate}%)</span><strong>${money(data.tax, data.currency)}</strong></div><div class="total"><span>Total</span><strong>${money(data.total, data.currency)}</strong></div></section>
    <p class="notes">${escapeHtml(data.notes)}</p>
  </main>
</body>
</html>`;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
}

function bmiCategory(bmi) {
  if (bmi < 18.5) return "Category: Underweight";
  if (bmi < 25) return "Category: Normal weight";
  if (bmi < 30) return "Category: Overweight";
  return "Category: Obesity range";
}

function bmiMessage(bmi) {
  if (bmi < 18.5) return "Below the common healthy adult BMI range.";
  if (bmi < 25) return "Within the common healthy adult BMI range.";
  if (bmi < 30) return "Above the common healthy adult BMI range.";
  return "In a higher BMI range. This is general information, not medical advice.";
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

init();
