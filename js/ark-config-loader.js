/**
 * ARK Config Loader - Sistema de configuraciones dinámicas
 * Carga configuraciones desde JSON y las aplica al módulo ase_config.html
 * 
 * @author RoyalServers Dev Team
 * @version 1.0.0
 */

class ARKConfigLoader {
  constructor() {
    this.config = {};
    this.configPath = 'data/ark_config.json';
    this.isLoaded = false;
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    try {
      await this.loadConfig();
      this.applyConfig();
      this.addLoadingIndicator();
      console.log('✅ ARK Config Loader: Configuraciones cargadas exitosamente');
    } catch (error) {
      console.error('❌ ARK Config Loader: Error al cargar configuraciones', error);
      this.showErrorNotification();
    }
  }

  async loadConfig() {
    const response = await fetch(this.configPath);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    this.config = await response.json();
    this.isLoaded = true;
  }

  applyConfig() {
    // Aplicar configuraciones por sección
    this.applyGeneralConfig();
    this.applyTribesConfig();
    this.applyDinosConfig();
    this.applyPlayerStatsConfig();
    this.applyTamingLimitsConfig();
    this.applyStructuresConfig();
    this.applyPlayerLevelsConfig();
    this.updateMetaInfo();
  }

  applyGeneralConfig() {
    const general = this.config.general;
    if (!general) return;

    // Actualizar estados de funciones habilitadas/deshabilitadas
    this.updateFeatureStatus('permanent_diseases', general.permanent_diseases);
    this.updateFeatureStatus('unlimited_mindwipe', general.unlimited_mindwipe);
    this.updateFeatureStatus('gamma_config', general.gamma_config);
    this.updateFeatureStatus('third_person', general.third_person);
    this.updateFeatureStatus('floating_damage', general.floating_damage);
    this.updateFeatureStatus('tribute_transfer', general.tribute_transfer);
    this.updateFeatureStatus('third_party_imprinting', general.third_party_imprinting);
    this.updateFeatureStatus('tribe_warfare', general.tribe_warfare);
    this.updateFeatureStatus('flyer_speed_leveling', general.flyer_speed_leveling);
    this.updateFeatureStatus('cave_flyers', general.cave_flyers);
    this.updateFeatureStatus('world_buffs', general.world_buffs);
    this.updateFeatureStatus('ragnarok_volcano', general.ragnarok_volcano);

    // Actualizar notas especiales
    this.updateText('[data-config="tribute_transfer_note"]', general.tribute_transfer_note);
    this.updateText('[data-config="ragnarok_volcano_note"]', general.ragnarok_volcano_note);
  }

  applyTribesConfig() {
    const tribes = this.config.tribes;
    if (!tribes) return;

    this.updateText('[data-config="max_members"]', tribes.max_members);
    this.updateText('[data-config="max_alliances"]', tribes.max_alliances);
    this.updateText('[data-config="tribes_per_alliance"]', tribes.tribes_per_alliance);
  }

  applyDinosConfig() {
    const dinos = this.config.dinos;
    if (!dinos) return;

    // Niveles de dinosaurios
    if (dinos.levels) {
      this.updateText('[data-config="max_wild_level"]', dinos.levels.max_wild_level);
      this.updateText('[data-config="max_tek_level"]', dinos.levels.max_tek_level);
      this.updateText('[data-config="wyvern_egg_level"]', dinos.levels.wyvern_egg_level);
      this.updateText('[data-config="rockdrake_egg_level"]', dinos.levels.rockdrake_egg_level);
      this.updateText('[data-config="crystal_wyvern_level"]', dinos.levels.crystal_wyvern_level);
      this.updateText('[data-config="deino_magma_level"]', dinos.levels.deino_magma_level);
    }

    // Reproducción
    if (dinos.breeding) {
      this.updateText('[data-config="hatching_speed"]', `x${dinos.breeding.hatching_speed}`);
      this.updateText('[data-config="maturation_speed"]', `x${dinos.breeding.maturation_speed}`);
      this.updateText('[data-config="imprint_scale"]', `x${dinos.breeding.imprint_scale}`);
    }

    // Dinosaurios baneados
    if (dinos.banned) {
      this.updateBadgeList('[data-config="banned_dinos"]', dinos.banned, 'ark-badge-danger');
    }
  }

  applyPlayerStatsConfig() {
    const stats = this.config.player_stats;
    if (!stats) return;

    this.updateText('[data-config="experience"]', `x${stats.experience}`);
    this.updateText('[data-config="weight"]', `x${stats.weight}`);
    this.updateText('[data-config="speed"]', `x${stats.speed}`);
    this.updateText('[data-config="craft_speed"]', `x${stats.craft_speed}`);
    this.updateText('[data-config="taming_speed"]', `x${stats.taming_speed}`);
    this.updateText('[data-config="player_harvest"]', `x${stats.player_harvest}`);
    this.updateText('[data-config="dino_harvest"]', `x${stats.dino_harvest}`);
  }

  applyTamingLimitsConfig() {
    const limits = this.config.taming_limits;
    if (!limits) return;

    // Actualizar tabla de límites de doma
    const tamingTable = document.querySelector('[data-config="taming_limits_table"]');
    if (tamingTable) {
      this.updateTamingLimitsTable(tamingTable, limits);
    }
  }

  applyStructuresConfig() {
    const structures = this.config.structures;
    if (!structures) return;

    // Configuraciones generales
    if (structures.settings) {
      this.updateFeatureStatus('collision_disabled', !structures.settings.collision_disabled);
      this.updateFeatureStatus('pickup_enabled', structures.settings.pickup_enabled);
      this.updateFeatureStatus('cave_building_disabled', !structures.settings.cave_building_disabled);
      this.updateFeatureStatus('spawn_building_disabled', !structures.settings.spawn_building_disabled);
    }

    // Tiempos de decay
    if (structures.decay_times) {
      Object.entries(structures.decay_times).forEach(([material, days]) => {
        this.updateText(`[data-config="${material}_decay"]`, `${days} días`);
      });
    }

    // Límites de estructuras
    if (structures.limits) {
      const limitsTable = document.querySelector('[data-config="structure_limits_table"]');
      if (limitsTable) {
        this.updateStructureLimitsTable(limitsTable, structures.limits);
      }
    }
  }

  applyPlayerLevelsConfig() {
    const levels = this.config.player_levels;
    if (!levels) return;

    this.updateText('[data-config="max_total_level"]', levels.max_total);
    this.updateText('[data-config="base_max_level"]', levels.base_max);

    // Actualizar tabla de ascensiones
    if (levels.ascensions) {
      this.updateAscensionsTable(levels.ascensions);
    }

    // Actualizar niveles adicionales
    if (levels.additional_levels) {
      this.updateAdditionalLevels(levels.additional_levels);
    }
  }

  // Métodos de utilidad
  updateFeatureStatus(feature, isEnabled) {
    const elements = document.querySelectorAll(`[data-config="${feature}"]`);
    elements.forEach(element => {
      const icon = element.querySelector('.ark-list-icon');
      if (icon) {
        if (isEnabled) {
          icon.className = 'fas fa-check ark-list-icon icon-enabled';
        } else {
          icon.className = 'fas fa-times ark-list-icon icon-disabled';
        }
      }
    });
  }

  updateText(selector, value) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (element.tagName === 'INPUT') {
        element.value = value;
      } else {
        element.textContent = value;
      }
    });
  }

  updateBadgeList(selector, items, badgeClass) {
    const container = document.querySelector(selector);
    if (!container) return;

    // Limpiar contenido actual
    container.innerHTML = '';

    // Crear badges
    items.forEach(item => {
      const badge = document.createElement('span');
      badge.className = `ark-badge ${badgeClass}`;
      badge.textContent = item;
      container.appendChild(badge);
    });
  }

  updateTamingLimitsTable(table, limits) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const mapNames = {
      'aberration': 'Aberration',
      'crystal_isles': 'Crystal Isles',
      'extinction': 'Extinction',
      'fjordur': 'Fjordur',
      'genesis_2': 'Genesis 2',
      'genesis': 'Genesis',
      'the_island': 'The Island',
      'the_center': 'The Center',
      'scorched_earth': 'Scorched Earth',
      'lost_island': 'Lost Island',
      'ragnarok': 'Ragnarok',
      'valguero': 'Valguero'
    };

    Object.entries(limits).forEach(([map, limit]) => {
      const row = document.createElement('tr');
      const badgeClass = limit >= 300 ? 'ark-badge-warning' : 'ark-badge-primary';
      
      row.innerHTML = `
        <td>${mapNames[map] || map}</td>
        <td><span class="ark-badge ${badgeClass}">${limit}</span></td>
      `;
      
      tbody.appendChild(row);
    });
  }

  updateStructureLimitsTable(table, limits) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const mapNames = {
      'aberration': 'Aberration',
      'crystal_isles': 'Crystal Isles',
      'extinction': 'Extinction',
      'fjordur': 'Fjordur',
      'genesis_2': 'Genesis 2',
      'genesis': 'Genesis',
      'the_island': 'The Island',
      'the_center': 'The Center',
      'scorched_earth': 'Scorched Earth',
      'lost_island': 'Lost Island',
      'ragnarok': 'Ragnarok',
      'valguero': 'Valguero'
    };

    Object.entries(limits).forEach(([map, limit]) => {
      const row = document.createElement('tr');
      const badgeClass = limit >= 4000 ? 'ark-badge-warning' : 'ark-badge-primary';
      
      row.innerHTML = `
        <td>${mapNames[map] || map}</td>
        <td><span class="ark-badge ${badgeClass}">${limit.toLocaleString()}</span></td>
      `;
      
      tbody.appendChild(row);
    });
  }

  updateAscensionsTable(ascensions) {
    Object.entries(ascensions).forEach(([map, data]) => {
      const selector = `[data-config="ascension_${map}"]`;
      const element = document.querySelector(selector);
      if (element) {
        element.innerHTML = `
          <td>${data.boss}${data.location ? ` (${data.location})` : ''}</td>
          <td><span class="ark-badge ark-badge-warning">+${data.levels}</span> → <strong>${data.total}</strong></td>
        `;
      }
    });
  }

  updateAdditionalLevels(additionalLevels) {
    Object.entries(additionalLevels).forEach(([type, data]) => {
      const selector = `[data-config="additional_${type}"]`;
      const element = document.querySelector(selector);
      if (element) {
        element.querySelector('.ark-list-text').innerHTML = `
          <strong>Niveles de ${type.toUpperCase()}:</strong> +${data.levels} niveles ${data.description}
          <br><small style="color: var(--ark-text-muted);">Total: ${data.total}</small>
        `;
      }
    });
  }

  updateMetaInfo() {
    const meta = this.config.meta;
    if (!meta) return;

    // Actualizar información meta si hay elementos específicos
    const versionElement = document.querySelector('[data-config="version"]');
    if (versionElement) versionElement.textContent = meta.version;

    const lastUpdatedElement = document.querySelector('[data-config="last_updated"]');
    if (lastUpdatedElement) lastUpdatedElement.textContent = meta.last_updated;
  }

  addLoadingIndicator() {
    // Agregar indicador de que las configuraciones se cargaron dinámicamente
    const indicator = document.createElement('div');
    indicator.className = 'config-loaded-indicator';
    indicator.innerHTML = `
      <i class="fas fa-check" style="color: var(--ark-success); margin-right: 0.5rem;"></i>
      <small style="color: var(--ark-text-muted);">
        Configuraciones cargadas dinámicamente (v${this.config.meta?.version || '1.0.0'})
      </small>
    `;
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--ark-surface);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: 1px solid var(--ark-border);
      box-shadow: var(--ark-shadow);
      z-index: 1000;
      font-size: 0.875rem;
      opacity: 0.8;
    `;

    document.body.appendChild(indicator);

    // Ocultar el indicador después de 5 segundos
    setTimeout(() => {
      indicator.style.transition = 'opacity 0.5s ease';
      indicator.style.opacity = '0';
      setTimeout(() => indicator.remove(), 500);
    }, 5000);
  }

  showErrorNotification() {
    const notification = document.createElement('div');
    notification.className = 'config-error-notification';
    notification.innerHTML = `
      <i class="fas fa-exclamation-triangle" style="color: var(--ark-danger); margin-right: 0.5rem;"></i>
      <span>Error al cargar configuraciones. Usando valores por defecto.</span>
    `;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 107, 107, 0.1);
      color: var(--ark-danger);
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid var(--ark-danger);
      z-index: 1000;
      font-size: 0.875rem;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transition = 'opacity 0.5s ease';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 8000);
  }

  // Método público para recargar configuraciones
  async reload() {
    try {
      await this.loadConfig();
      this.applyConfig();
      console.log('✅ Configuraciones recargadas exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error al recargar configuraciones', error);
      return false;
    }
  }

  // Método público para obtener configuraciones
  getConfig() {
    return this.config;
  }

  // Método público para verificar si las configuraciones están cargadas
  isConfigLoaded() {
    return this.isLoaded;
  }
}

// Inicializar el loader automáticamente
window.arkConfigLoader = new ARKConfigLoader();

// Exponer métodos útiles globalmente
window.reloadARKConfig = () => window.arkConfigLoader.reload();
window.getARKConfig = () => window.arkConfigLoader.getConfig();