import sharp from "sharp";

/**
 * QR Code Generator Class
 * Supports both browser and Node.js environments
 */
class QRCodeGenerator {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.baseUrl - Base URL for all QR codes
   * @param {string} options.orderId - School ID (default for all codes)
   * @param {Object} options.qrOptions - Options for QR code generation
   * @param {number} options.qrOptions.width - QR code width in pixels
   * @param {string} options.qrOptions.color - QR code color
   * @param {string} options.qrOptions.backgroundColor - Background color
   * @param {string|Buffer} options.qrOptions.logo - Optional logo (DataURL in browser, Buffer or DataURL in Node)
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl;
    this.orderId = options.orderId;
    this.qrOptions = {
      width: options.qrOptions?.width || 300,
      color: options.qrOptions?.color || '#000000',
      backgroundColor: options.qrOptions?.backgroundColor || '#ffffff',
      logo: options.qrOptions?.logo || null,
      ...options.qrOptions
    };
    this._checkEnvironment();
  }

  _checkEnvironment() {
    this.isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    this.isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
    if (!this.isBrowser && !this.isNode) throw new Error('Unsupported environment');
  }

  _buildUrl(studentId = null) {
    const url = new URL(this.baseUrl);
    if (this.orderId) url.searchParams.append('order_id', this.orderId);
    if (studentId) url.searchParams.append('student_id', studentId);
    return url.toString();
  }

  dataUrlToBuffer(dataUrl) {
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) throw new Error('Invalid data URL');
    return { contentType: matches[1], buffer: Buffer.from(matches[2], 'base64') };
  }

  async createGeneralQR(options = {}) {
    const url = this._buildUrl();
    const qrOptions = { ...this.qrOptions, ...options };
    return this._generateQRCode(url, qrOptions);
  }

  async createStudentQR(studentId, options = {}) {
    if (!studentId) throw new Error('Student ID is required');
    const url = this._buildUrl(studentId);
    const qrOptions = { ...this.qrOptions, ...options };
    return this._generateQRCode(url, qrOptions);
  }

  async _generateQRCode(url, options) {
    if (this.isBrowser) return this._generateQRCodeBrowser(url, options);
    if (this.isNode) return this._generateQRCodeNode(url, options);
  }

  /* ---------- Browser ---------- */
  async _generateQRCodeBrowser(url, options) {
    await this._loadQRCodeScript();
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      QRCode.toCanvas(canvas, url, {
        width: options.width,
        color: { dark: options.color, light: options.backgroundColor },
        errorCorrectionLevel: 'H'
      }, async (err) => {
        if (err) return reject(err);
        try {
          if (options.logo) await this._drawLogoOnCanvas(canvas, options.logo);
          resolve(canvas);
        } catch (e) { reject(e); }
      });
    });
  }

  async _drawLogoOnCanvas(canvas, logo) {
    return new Promise((resolve, reject) => {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        const size = canvas.width * 0.25;
        const x = (canvas.width - size) / 2;
        const y = (canvas.height - size) / 2;
        ctx.drawImage(img, x, y, size, size);
        resolve();
      };
      img.onerror = reject;
      img.src = typeof logo === 'string' ? logo : URL.createObjectURL(logo);
    });
  }

  async _loadQRCodeScript() {
    if (typeof QRCode !== 'undefined') return;
    if (window._qrcodeLoading) {
      await new Promise(r => {
        const i = setInterval(() => { if (typeof QRCode !== 'undefined') { clearInterval(i); r(); } }, 100);
      });
      return;
    }
    window._qrcodeLoading = true;
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.3/qrcode.min.js';
      s.onload = () => { window._qrcodeLoading = false; resolve(); };
      s.onerror = () => { window._qrcodeLoading = false; reject(new Error('Failed to load QRCode lib')); };
      document.head.appendChild(s);
    });
  }

// buffer = your image buffer (from multer, file, etc.)
  async _resizeImageBuffer(buffer, width, height) {
    return await sharp(buffer)
      .resize(width, height, {
        fit: "contain",   // keeps aspect ratio
        background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent padding if needed
      })
      .png()
      .toBuffer();
  }
  /* ---------- Node ---------- */
  async _generateQRCodeNode(url, options) {
    const QRCode = await import('qrcode');
    const dataUrl = await QRCode.toDataURL(url, {
      width: options.width,
      color: { dark: options.color, light: options.backgroundColor },
      errorCorrectionLevel: 'H'
    });
    if (!options.logo) return dataUrl;

    const sharp = await import('sharp'); // must be installed
    const { buffer } = this.dataUrlToBuffer(dataUrl);
    const qrImg = sharp.default(buffer);

    let logoBuffer;
    if (typeof options.logo === 'string') logoBuffer = this.dataUrlToBuffer(options.logo).buffer;
    else logoBuffer = options.logo;

    const meta = await qrImg.metadata();
    const size = Math.floor(meta.width * 0.25);
    const newLogoBuffer = await this._resizeImageBuffer(logoBuffer, 60, 60);

    const composed = await qrImg
      .composite([{ input: newLogoBuffer, gravity: 'center', resize: { width: size, height: size } }])
      .png()
      .toBuffer();

    return `data:image/png;base64,${composed.toString('base64')}`;
  }

  downloadQRCode(qrCode, filename = 'qrcode.png') {
    if (!this.isBrowser) return;
    const dataUrl = typeof qrCode === 'string' ? qrCode : qrCode.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  getUrl(studentId = null) { return this._buildUrl(studentId); }
  setSchoolId(id) { this.orderId = id; }
  setBaseUrl(url) { this.baseUrl = url; }
  setQROptions(options) { this.qrOptions = { ...this.qrOptions, ...options }; }
}

export default QRCodeGenerator;

// if (typeof module !== 'undefined' && module.exports) module.exports = QRCodeGenerator;
// if (typeof window !== 'undefined') window.QRCodeGenerator = QRCodeGenerator;
