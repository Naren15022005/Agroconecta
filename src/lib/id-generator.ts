class AgroConectaIdGenerator {
  /**
   * Genera un ID único con prefijo AGRC para diferentes entidades
   * @param type - Tipo de entidad (USR, PRD, ORD, CAT, AGR, CLI, EMP, ROL, SUB)
   * @returns ID único como AGRC_USR_001A2B
   */
  static generateId(type: 'USR' | 'PRD' | 'ORD' | 'CAT' | 'AGR' | 'CLI' | 'EMP' | 'ROL' | 'SUB'): string {
    const timestamp = Date.now().toString(36).toUpperCase(); // Base36 del timestamp
    const random = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 chars random
    return `AGRC_${type}_${timestamp}${random}`;
  }

  /**
   * Genera ID específico para subcategorías
   */
  static generateSubcategoryId(): string {
    return this.generateId('SUB');
  }

  /**
   * Genera ID específico para usuarios
   */
  static generateUserId(): string {
    return this.generateId('USR');
  }

  /**
   * Genera ID específico para productos
   */
  static generateProductId(): string {
    return this.generateId('PRD');
  }

  /**
   * Genera ID específico para pedidos
   */
  static generateOrderId(): string {
    return this.generateId('ORD');
  }

  /**
   * Genera ID específico para categorías
   */
  static generateCategoryId(): string {
    return this.generateId('CAT');
  }

  /**
   * Genera ID específico para agricultores
   */
  static generateAgricultorId(): string {
    return this.generateId('AGR');
  }

  /**
   * Genera ID específico para clientes
   */
  static generateClienteId(): string {
    return this.generateId('CLI');
  }

  /**
   * Genera ID específico para empresas
   */
  static generateEmpresaId(): string {
    return this.generateId('EMP');
  }

  /**
   * Genera ID específico para roles
   */
  static generateRoleId(): string {
    return this.generateId('ROL');
  }

  /**
   * Valida si un ID tiene el formato correcto de AgroConecta
   * @param id - ID a validar
   * @returns true si es válido
   */
  static isValidAgroConectaId(id: string): boolean {
    const pattern = /^AGRC_(USR|PRD|ORD|CAT|AGR|CLI|EMP|ROL|SUB)_[A-Z0-9]+$/;
    return pattern.test(id);
  }

  /**
   * Extrae el tipo de entidad del ID
   * @param id - ID de AgroConecta
   * @returns Tipo de entidad o null si no es válido
   */
  static extractEntityType(id: string): string | null {
    const match = id.match(/^AGRC_([A-Z]+)_/);
    return match ? match[1] : null;
  }
}
export default AgroConectaIdGenerator;
