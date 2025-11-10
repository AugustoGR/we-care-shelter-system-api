const sharp = require('sharp');

export class ImageUtil {
  /**
   * Processa uma imagem em base64, reduzindo a qualidade e convertendo para JPEG
   * @param base64Image String base64 da imagem (com ou sem o prefixo data:image)
   * @param quality Qualidade da imagem (0-100), padrão 60
   * @returns String base64 da imagem processada
   */
  static async processBase64Image(
    base64Image: string,
    quality: number = 60,
  ): Promise<string> {
    try {
      // Remove o prefixo data:image se existir
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

      // Converte base64 para buffer
      const buffer = Buffer.from(base64Data, 'base64');

      // Processa a imagem com sharp
      const processedBuffer = await sharp.default(buffer)
        .jpeg({ quality, progressive: true }) // Converte para JPEG com qualidade especificada
        .resize(800, 800, {
          // Redimensiona mantendo proporção, máximo 800x800
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toBuffer();

      // Converte de volta para base64
      const processedBase64 = processedBuffer.toString('base64');

      // Retorna com o prefixo data:image
      return `data:image/jpeg;base64,${processedBase64}`;
    } catch (error) {
      throw new Error(`Erro ao processar imagem: ${error.message}`);
    }
  }

  /**
   * Verifica se uma string é uma imagem base64 válida
   * @param str String para verificar
   * @returns true se for base64, false caso contrário
   */
  static isBase64Image(str: string): boolean {
    if (!str) return false;

    // Verifica se tem o prefixo data:image
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
    if (base64Regex.test(str)) return true;

    // Verifica se é base64 puro (sem prefixo)
    try {
      const base64Data = str.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      return buffer.toString('base64') === base64Data;
    } catch {
      return false;
    }
  }

  /**
   * Calcula o tamanho aproximado de uma imagem base64 em KB
   * @param base64Image String base64 da imagem
   * @returns Tamanho em KB
   */
  static getBase64Size(base64Image: string): number {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const sizeInBytes = (base64Data.length * 3) / 4;
    return Math.round(sizeInBytes / 1024);
  }
}
