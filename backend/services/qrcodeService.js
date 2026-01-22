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
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl;
    this.orderId = options.orderId;
    this.qrOptions = {
      width: options.qrOptions?.width || 300,
      color: options.qrOptions?.color || '#000000',
      backgroundColor: options.qrOptions?.backgroundColor || '#ffffff',
      ...options.qrOptions
    };
    
    this._checkEnvironment();
  }

  /**
   * Check the runtime environment and initialize accordingly
   */
  _checkEnvironment() {
    this.isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    this.isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
    
    if (!this.isBrowser && !this.isNode) {
      throw new Error('Unsupported environment');
    }
  }

  /**
   * Build URL with parameters
   * @returns {string} Complete URL with parameters
   */
  _buildUrl(studentId = null) {
    const url = new URL(this.baseUrl);
    
    // Always add school ID if provided
    if (this.orderId) {
      url.searchParams.append('order_id', this.orderId);
    }

    return url.toString();
  }

  // utils/dataUrlToBuffer.js
dataUrlToBuffer(dataUrl) {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid data URL");

  return {
    contentType: matches[1],
    buffer: Buffer.from(matches[2], "base64"),
  };
};

  /**
   * Create a general QR code for the school
   * @param {Object} options - Override default QR options
   * @returns {Promise<HTMLElement|string>} QR code element or data URL
   */
  async createGeneralQR(options = {}) {
    const url = this._buildUrl();
    const qrOptions = { ...this.qrOptions, ...options };
    
    return this._generateQRCode(url, qrOptions);
  }

  /**
   * Create a specific QR code for a student
   * @param {string} studentId - Student ID
   * @param {Object} options - Override default QR options
   * @returns {Promise<HTMLElement|string>} QR code element or data URL
   */
  async createStudentQR(studentId, options = {}) {
    if (!studentId) {
      throw new Error('Student ID is required for student-specific QR codes');
    }
    
    const url = this._buildUrl(studentId);
    const qrOptions = { ...this.qrOptions, ...options };
    
    return this._generateQRCode(url, qrOptions);
  }

  /**
   * Generate QR code based on environment
   * @param {string} url - URL to encode
   * @param {Object} options - QR code options
   * @returns {Promise<HTMLElement|string>} QR code element or data URL
   */
  async _generateQRCode(url, options) {
    if (this.isBrowser) {
      return this._generateQRCodeBrowser(url, options);
    } else if (this.isNode) {
      return this._generateQRCodeNode(url, options);
    }
  }

  /**
   * Generate QR code in browser environment
   * @param {string} url - URL to encode
   * @param {Object} options - QR code options
   * @returns {Promise<HTMLElement>} QR code canvas element
   */
  async _generateQRCodeBrowser(url, options) {
    // Dynamically import QRCode.js library
    await this._loadQRCodeScript();
    
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        
        QRCode.toCanvas(canvas, url, {
          width: options.width,
          color: {
            dark: options.color,
            light: options.backgroundColor
          },
          errorCorrectionLevel: 'H' // High error correction
        }, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(canvas);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Load QRCode.js library dynamically
   */
  async _loadQRCodeScript() {
    if (typeof QRCode === 'undefined') {
      // Check if script is already loading
      if (window._qrcodeLoading) {
        await new Promise(resolve => {
          const checkInterval = setInterval(() => {
            if (typeof QRCode !== 'undefined') {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });
        return;
      }
      
      window._qrcodeLoading = true;
      
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.3/qrcode.min.js';
        script.integrity = 'sha512-CL4f2Y7tFpR6NbQ1pTMxJQ2uB6J2Z/gLr4Rl+4RfMh7LQJ9t0F7mZ5z6q5p5I5f5q5M5f5G5M5f5G5M5f5G5M5';
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
          window._qrcodeLoading = false;
          resolve();
        };
        
        script.onerror = () => {
          window._qrcodeLoading = false;
          reject(new Error('Failed to load QRCode library'));
        };
        
        document.head.appendChild(script);
      });
    }
  }

  /**
   * Generate QR code in Node.js environment
   * @param {string} url - URL to encode
   * @param {Object} options - QR code options
   * @returns {Promise<string>} Data URL of the QR code
   */
  async _generateQRCodeNode(url, options) {
    try {
      // Dynamically import the qrcode module
      const QRCode = await import('qrcode');
      
      return await QRCode.toDataURL(url, {
        width: options.width,
        color: {
          dark: options.color,
          light: options.backgroundColor
        },
        errorCorrectionLevel: 'H'
      });
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw new Error('Please install qrcode module: npm install qrcode');
      }
      throw error;
    }
  }

  /**
   * Download QR code (browser only)
   * @param {HTMLElement|string} qrCode - QR code element or data URL
   * @param {string} filename - Download filename
   */
  downloadQRCode(qrCode, filename = 'qrcode.png') {
    if (!this.isBrowser) {
      console.warn('Download is only available in browser environment');
      return;
    }
    
    let dataUrl;
    
    if (typeof qrCode === 'string') {
      dataUrl = qrCode;
    } else if (qrCode instanceof HTMLCanvasElement) {
      dataUrl = qrCode.toDataURL('image/png');
    } else {
      throw new Error('Invalid QR code format');
    }
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Get URL for a specific student (without generating QR)
   * @param {string} studentId - Student ID (optional)
   * @returns {string} Complete URL
   */
  getUrl(studentId = null) {
    return this._buildUrl(studentId);
  }

  /**
   * Update school ID
   * @param {string} schoolId - New school ID
   */
  setSchoolId(schoolId) {
    this.schoolId = schoolId;
  }

  /**
   * Update base URL
   * @param {string} baseUrl - New base URL
   */
  setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Update QR code options
   * @param {Object} options - New QR code options
   */
  setQROptions(options) {
    this.qrOptions = { ...this.qrOptions, ...options };
  }
}

// For Node.js environment, export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QRCodeGenerator;
}

// Example usage:
if (typeof window !== 'undefined') {
  // Browser usage example
  window.QRCodeGenerator = QRCodeGenerator;
  
  // Usage example:
  /*
  async function exampleUsage() {
    // Initialize generator
    const qrGenerator = new QRCodeGenerator({
      baseUrl: 'https://your-school.com/student-portal',
      schoolId: 'SCHOOL123',
      qrOptions: {
        width: 400,
        color: '#1a237e',
        backgroundColor: '#f5f5f5'
      }
    });
    
    // Create general QR code for school
    const generalQR = await qrGenerator.createGeneralQR();
    document.getElementById('general-qr-container').appendChild(generalQR);
    
    // Create specific QR code for student
    const studentQR = await qrGenerator.createStudentQR('STUDENT456', {
      width: 350,
      color: '#0d47a1'
    });
    document.getElementById('student-qr-container').appendChild(studentQR);
    
    // Get the URL for a specific student
    console.log(qrGenerator.getUrl('STUDENT789'));
    
    // Download a QR code
    // qrGenerator.downloadQRCode(studentQR, 'student-qr.png');
  }
  */
}