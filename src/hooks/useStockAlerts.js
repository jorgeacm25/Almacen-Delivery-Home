import { useMemo } from 'react';

/**
 * Hook para detectar alertas de productos
 * - Stock bajo: cuando cantidad < umbralStockMinimo
 * - Por vencer: cuando fecha vencimiento está dentro de diasAlerta
 * 
 * @param {Array} productos - Array de productos
 * @param {number} umbralStockMinimo - Cantidad mínima considerada como stock bajo (default: 50)
 * @param {number} diasAlerta - Días antes de vencimiento para mostrar alerta (default: 7)
 * @returns {Object} - { stockBajo: [], porVencer: [], total: number }
 */
export const useStockAlerts = (
  productos = [], 
  umbralStockMinimo = 50, 
  diasAlerta = 7
) => {
  return useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Calcular fecha límite para vencimiento (hoy + diasAlerta)
    const fechaLimiteVencimiento = new Date(hoy);
    fechaLimiteVencimiento.setDate(hoy.getDate() + diasAlerta);

    const stockBajo = [];
    const porVencer = [];

    productos.forEach(producto => {
      // Alerta de stock bajo
      if (producto.cantidad < umbralStockMinimo) {
        stockBajo.push({
          id: producto.id,
          nombre: producto.nombre,
          cantidad: producto.cantidad,
          unidad: producto.unidad,
          umbral: umbralStockMinimo,
          tipo: 'stock',
          severidad: producto.cantidad === 0 ? 'critica' : 'alta'
        });
      }

      // Alerta de vencimiento
      if (producto.fechaVencimiento) {
        try {
          const fechaVenc = new Date(producto.fechaVencimiento);
          fechaVenc.setHours(0, 0, 0, 0);

          // Si la fecha de vencimiento ya pasó
          if (fechaVenc < hoy) {
            porVencer.push({
              id: producto.id,
              nombre: producto.nombre,
              fechaVencimiento: producto.fechaVencimiento,
              diasRestantes: Math.floor((fechaVenc - hoy) / (1000 * 60 * 60 * 24)),
              tipo: 'vencimiento',
              severidad: 'critica', // Vencido es crítico
              vencido: true
            });
          }
          // Si vence dentro de diasAlerta
          else if (fechaVenc <= fechaLimiteVencimiento) {
            porVencer.push({
              id: producto.id,
              nombre: producto.nombre,
              fechaVencimiento: producto.fechaVencimiento,
              diasRestantes: Math.floor((fechaVenc - hoy) / (1000 * 60 * 60 * 24)),
              tipo: 'vencimiento',
              severidad: fechaVenc.getTime() === hoy.getTime() ? 'critica' : 'alta',
              vencido: false
            });
          }
        } catch (error) {
          console.error(`Error al procesar fecha de vencimiento para ${producto.nombre}:`, error);
        }
      }
    });

    return {
      stockBajo: stockBajo.sort((a, b) => a.cantidad - b.cantidad),
      porVencer: porVencer.sort((a, b) => a.diasRestantes - b.diasRestantes),
      total: stockBajo.length + porVencer.length,
      resumen: {
        stockBajoCritico: stockBajo.filter(p => p.severidad === 'critica').length,
        productosVencidos: porVencer.filter(p => p.vencido).length,
        productosProxAVencer: porVencer.filter(p => !p.vencido).length
      }
    };
  }, [productos, umbralStockMinimo, diasAlerta]);
};
