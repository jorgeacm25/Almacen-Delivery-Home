const calcularFechaLimite = (dias) => {
  const hoy = new Date();
  const limite = new Date(hoy);
  limite.setDate(hoy.getDate() - dias);
  return limite;
};

const parsearFecha = (valor) => {
  if (!valor) return null;
  const directo = new Date(valor);
  if (!Number.isNaN(directo.getTime())) return directo;

  const m = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(m[4] || 0), Number(m[5] || 0));
};

export default function SeccionReportes({ historial, productos }) {
  const limiteSemana = calcularFechaLimite(7);
  const limiteMes = calcularFechaLimite(30);

  const movimientosSemana = historial.filter((item) => {
    const fecha = parsearFecha(item.fecha);
    return fecha && fecha >= limiteSemana;
  });

  const movimientosMes = historial.filter((item) => {
    const fecha = parsearFecha(item.fecha);
    return fecha && fecha >= limiteMes;
  });

  const productosBajoStock = productos.filter((p) => (Number(p.cantidad) || 0) <= 50);

  return (
    <div className="mt-8 px-4 sm:px-6 md:px-8 pb-8">
      <div className="alto-contraste-card rounded-2xl shadow-xl p-6 w-full max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-cyan-800 mb-6 text-center">Reportes</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border-2 border-cyan-500 rounded-xl p-5 bg-white">
            <p className="text-lg font-extrabold text-cyan-700">Ultima semana</p>
            <p className="text-4xl font-extrabold text-gray-900 mt-2">{movimientosSemana.length}</p>
            <p className="text-base text-gray-700 mt-1">Movimientos registrados</p>
          </div>

          <div className="border-2 border-cyan-500 rounded-xl p-5 bg-white">
            <p className="text-lg font-extrabold text-cyan-700">Ultimo mes</p>
            <p className="text-4xl font-extrabold text-gray-900 mt-2">{movimientosMes.length}</p>
            <p className="text-base text-gray-700 mt-1">Movimientos registrados</p>
          </div>

          <div className="border-2 border-cyan-500 rounded-xl p-5 bg-white">
            <p className="text-lg font-extrabold text-cyan-700">Productos con stock bajo</p>
            <p className="text-4xl font-extrabold text-red-700 mt-2">{productosBajoStock.length}</p>
            <p className="text-base text-gray-700 mt-1">Con 50 o menos unidades</p>
          </div>
        </div>

        <div className="border-2 border-cyan-200 rounded-xl p-5 bg-cyan-50">
          <h3 className="text-2xl font-extrabold text-cyan-800 mb-4">Detalle de productos bajos en stock</h3>
          {productosBajoStock.length === 0 ? (
            <p className="text-lg text-green-700 font-bold">No hay productos con stock bajo actualmente.</p>
          ) : (
            <ul className="space-y-2">
              {productosBajoStock.map((p) => (
                <li key={p.id} className="text-lg font-semibold text-gray-800">
                  {p.nombre}: {p.cantidad} {p.unidad}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-6 py-3 border-2 border-cyan-800 bg-white text-cyan-900 font-extrabold rounded-lg hover:bg-cyan-100"
          >
            Imprimir Reporte
          </button>
        </div>
      </div>
    </div>
  );
}
