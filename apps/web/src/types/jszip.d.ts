declare module 'jszip/lib/index.js' {
  class JSZip {
    file(name: string, data: Blob): this;
    generateAsync(options: { type: 'blob' }): Promise<Blob>;
  }
  export default JSZip;
}
