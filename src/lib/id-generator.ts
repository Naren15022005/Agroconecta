class AgroConectaIdGenerator {
  /**
   * Genera un ID único con prefijo AGRC para diferentes entidades
   * @param type - Tipo de entidad (USR, PRD, ORD, CAT, AGR, CLI, EMP, ROL, SUB)
   * @returns ID único como AGRC_USR_001A2B
   */
  static generateId(type: string): string {
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
  /**
   * Genera ID para usuarios. Si se pasa un `role` se incluirá como `AGRC_USER_<ROLE>_...`
   * Ej: `AGRC_USER_ADMIN_...`, `AGRC_USER_CLIENTE_...`
   */
  static generateUserId(role?: string): string {
    if (role && typeof role === 'string' && role.length > 0) {
      const normalized = role.toString().toUpperCase().replace(/\s+/g, '_');
      return this.generateId(`USER_${normalized}`);
    }
    return this.generateId('USER');
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
    return this.generateUserId('AGRICULTOR');
  }

  /**
   * Genera ID específico para clientes
   */
  static generateClienteId(): string {
    return this.generateUserId('CLIENTE');
  }

  /**
   * Genera ID específico para empresas
   */
  static generateEmpresaId(): string {
    return this.generateUserId('EMPRESA');
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
    // Allow descriptive types like USER_ADMIN, USER_CLIENTE, PRD, ORD, CAT, etc.
    const pattern = /^AGRC_([A-Z0-9_]+)_[A-Z0-9]+$/;
    return pattern.test(id);
  }

  /**
   * Extrae el tipo de entidad del ID
   * @param id - ID de AgroConecta
   * @returns Tipo de entidad o null si no es válido
   */
  static extractEntityType(id: string): string | null {
    const match = id.match(/^AGRC_([A-Z0-9_]+)_/);
    if (!match) return null;
    const raw = match[1];
    return this.canonicalizeType(raw);
  }

  /**
   * Canonicaliza tipos antiguos o abreviados a la forma actual.
   * Por ejemplo: CLI -> USER_CLIENTE, AGR -> USER_AGRICULTOR
   */
  static canonicalizeType(rawType: string): string {
    const t = rawType.toString().toUpperCase();
    const map: Record<string, string> = {
      USR: 'USER',
      AGR: 'USER_AGRICULTOR',
      CLI: 'USER_CLIENTE',
      EMP: 'USER_EMPRESA',
      PRD: 'PRD',
      ORD: 'ORD',
      CAT: 'CAT',
      ROL: 'ROL',
      SUB: 'SUB',
    };
    // If already a USER_... or USER pattern, return as-is
    if (t.startsWith('USER_') || t === 'USER') return t;
    return map[t] ?? t;
  }

  /**
   * Normaliza un ID legacy a la forma canónica.
   * Si no aplica, devuelve el ID original.
   */
  static normalizeId(id: string): string {
    const type = this.extractEntityType(id);
    if (!type) return id;
    const prefix = `AGRC_${type}_`;
    if (id.startsWith(prefix)) return id;
    // Legacy format: reconstruct id with canonical type
    const parts = id.split('_');
    if (parts.length < 3) return id;
    const suffix = parts.slice(2).join('_');
    return `AGRC_${type}_${suffix}`;
  }
}
export default AgroConectaIdGenerator;
